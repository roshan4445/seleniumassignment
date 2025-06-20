import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Send, AlertCircle } from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ComplaintData {
  fullName?: string;
  address?: string;
  contact?: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
}

export function VoiceComplaintForm() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [complaintData, setComplaintData] = useState<ComplaintData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const steps = [
    { field: 'fullName', question: 'What is your full name?', required: true },
    { field: 'contact', question: 'Please provide your contact number.', required: true },
    { field: 'address', question: 'What is your complete address?', required: true },
    { field: 'category', question: 'What category does your complaint fall under? Say infrastructure, traffic, water, electricity, sanitation, healthcare, education, corruption, or other.', required: true },
    { field: 'title', question: 'Please provide a brief title for your complaint.', required: true },
    { field: 'location', question: 'Where did this incident occur?', required: true },
    { field: 'description', question: 'Please describe your complaint in detail.', required: true },
  ];

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      processVoiceInput(result);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);
      toast.error('Voice recognition error. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const processVoiceInput = useCallback((input: string) => {
    if (!input.trim()) {
      toast.error('No input detected. Please try again.');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const currentField = steps[currentStep]?.field;
        
        if (!currentField) {
          setIsProcessing(false);
          return;
        }
        
        // Process category specially
        if (currentField === 'category') {
          const categoryMap: Record<string, string> = {
            'infrastructure': 'Public Infrastructure',
            'traffic': 'Traffic & Transportation',
            'water': 'Water Supply',
            'electricity': 'Electricity',
            'sanitation': 'Sanitation',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'corruption': 'Corruption',
            'other': 'Other',
          };
          
          const category = Object.keys(categoryMap).find(key => 
            input.toLowerCase().includes(key)
          );
          
          if (category) {
            setComplaintData(prev => ({ ...prev, [currentField]: categoryMap[category] }));
          } else {
            setComplaintData(prev => ({ ...prev, [currentField]: 'Other' }));
          }
        } else {
          setComplaintData(prev => ({ ...prev, [currentField]: input.trim() }));
        }
        
        setIsProcessing(false);
        
        // Move to next step
        if (currentStep < steps.length - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          
          // Speak next question after a short delay
          setTimeout(() => {
            if (steps[nextStep]) {
              speak(steps[nextStep].question);
            }
          }, 500);
        } else {
          // All steps completed
          speak('Thank you! I have collected all the information. Please review your complaint and submit it.');
        }
      } catch (error) {
        console.error('Error processing voice input:', error);
        setIsProcessing(false);
        toast.error('Error processing your input. Please try again.');
      }
    }, 1000);
  }, [currentStep, speak, steps]);

  const startVoiceAssistant = () => {
    setHasStarted(true);
    setCurrentStep(0);
    setComplaintData({});
    synthRef.current = window.speechSynthesis;
    
    setTimeout(() => {
      speak('Hello! I will help you file your complaint. ' + steps[0].question);
    }, 500);
  };

  const submitComplaint = () => {
    const requiredFields = steps.filter(step => step.required);
    const missingFields = requiredFields.filter(step => !complaintData[step.field as keyof ComplaintData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please provide: ${missingFields.map(f => f.field.replace(/([A-Z])/g, ' $1')).join(', ')}`);
      return;
    }
    
    const complaintId = `CPL${Date.now().toString().slice(-6)}`;
    toast.success(`Voice complaint submitted successfully! Reference ID: ${complaintId}`);
    
    // Reset form
    setComplaintData({});
    setCurrentStep(0);
    setHasStarted(false);
    setTranscript('');
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const resetForm = () => {
    setComplaintData({});
    setCurrentStep(0);
    setHasStarted(false);
    setTranscript('');
    setIsProcessing(false);
    stopSpeaking();
  };

  // Get current step safely
  const getCurrentStep = () => {
    return steps[currentStep] || steps[0];
  };

  const isFormComplete = () => {
    return steps.every(step => complaintData[step.field as keyof ComplaintData]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Voice Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Assistant
            {hasStarted && (
              <Button variant="outline" size="sm" onClick={resetForm}>
                Reset
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasStarted ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Click the button below to start filing your complaint using voice commands.
              </p>
              <Button onClick={startVoiceAssistant} size="lg">
                <Mic className="w-4 h-4 mr-2" />
                Start Voice Assistant
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Question */}
              <div className="text-center space-y-2">
                <Badge variant="outline">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <h3 className="text-lg font-semibold">
                  {getCurrentStep().question}
                </h3>
              </div>

              {/* Voice Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={startListening}
                  disabled={isListening || isSpeaking || isProcessing}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Speak Answer
                    </>
                  )}
                </Button>

                {isSpeaking && (
                  <Button onClick={stopSpeaking} variant="outline" size="lg">
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop Speaking
                  </Button>
                )}
              </div>

              {/* Voice Waveform */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex justify-center"
                  >
                    <VoiceWaveform isActive={isListening} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transcript */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
                >
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    You said: "{transcript}"
                  </p>
                </motion.div>
              )}

              {/* Processing Indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Processing your response...
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collected Data Preview */}
      {hasStarted && Object.keys(complaintData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collected Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(complaintData).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            
            {isFormComplete() && (
              <div className="mt-6 text-center">
                <Button onClick={submitComplaint} size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Voice Complaint
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Voice Assistant Tips</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Wait for the question before answering</li>
                <li>• You can restart by clicking the Reset button</li>
                <li>• Ensure your microphone is enabled</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}