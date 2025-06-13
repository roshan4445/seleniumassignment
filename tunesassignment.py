from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
driver=webdriver.Chrome()
driver.get("https://qatunes.ccbp.tech/")
driver.implicitly_wait(10)
driver.maximize_window()
driver.get("https://qatunes.ccbp.tech/")
music_dropdown=driver.find_element(By.XPATH,"//select[@id='genre']")
music_options=Select(music_dropdown)
music_options.select_by_value("pop")
time.sleep(1)
get_btn=driver.find_element(By.XPATH,"//button[@id='getButton']")
get_btn.click()
wait=WebDriverWait(driver,10)
rock_results=wait.until(EC.presence_of_all_elements_located((By.XPATH, "//li[@class='song-title']")))
if(len(rock_results)>0):
    print(str(len(rock_results))+" Songs Displayed")
else:
    print("Songs Not Displayed")
time.sleep(5)
music_options.select_by_value("rock")
time.sleep(1)
get_btn=driver.find_element(By.XPATH,"//button[@id='getButton']")
get_btn.click()
wait=WebDriverWait(driver,10)
rock_results=wait.until(EC.presence_of_all_elements_located((By.XPATH, "//li[@class='song-title']")))
if(len(rock_results)>0):
    print(str(len(rock_results))+" Songs Displayed")
else:
    print("Songs Not Displayed")
time.sleep(10)
