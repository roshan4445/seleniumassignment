from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()
driver.maximize_window()
driver.implicitly_wait(10)

driver.get("https://qafeedback.ccbp.tech/")

sad_emoji = driver.find_element(By.CSS_SELECTOR, "li:nth-child(1) > button")
sad_emoji.click()
time.sleep(1)

edit_button = driver.find_element(By.CSS_SELECTOR, "div[class='thank-you-container'] > button[class='edit-feedback-btn']")
edit_button.click()
time.sleep(1)

none_emoji = driver.find_element(By.CSS_SELECTOR, "li:nth-child(2) > button")
none_emoji.click()
time.sleep(1)

edit_button = driver.find_element(By.CSS_SELECTOR, "div > button:last-child")
edit_button.click()
time.sleep(1)

happy_emoji = driver.find_element(By.CSS_SELECTOR, "li:last-child > button")
happy_emoji.click()
time.sleep(1)

thank_you_element = driver.find_element(By.CSS_SELECTOR, "div > h1:nth-child(2)")
thank_you_text = thank_you_element.text
expected_thank_you = "Thank You!"

if thank_you_text == expected_thank_you:
    print("Thank You text: Verified")
else:
    print("Thank You text: Verification Failed")

description_element = driver.find_element(By.CSS_SELECTOR, "div > p:nth-child(3)")
description_text = description_element.text
expected_description = "We will use your feedback to improve our customer support performance."

if description_text == expected_description:
    print("Description: Verified")
else:
    print("Description: Verification Failed")


