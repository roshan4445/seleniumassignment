
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
driver = webdriver.Chrome()
driver.maximize_window()
driver.implicitly_wait(10)
driver.get("https://qawithdrawal.ccbp.tech/")
username_element = driver.find_element(By.CSS_SELECTOR, "div[class='user-details-container'] > p")
username = username_element.text
expected_username = "Sarah Williams"
if username == expected_username:
    print("Username is correct")
else:
    print("Incorrect username")
balance_element = driver.find_element(By.CSS_SELECTOR, "p[class='balance']")
balance = int(balance_element.text)
expected_initial_balance = 2000

if balance == expected_initial_balance:
    print("Initial balance is correct")
else:
    print("Incorrect initial balance")
denomination_buttons = driver.find_elements(By.CSS_SELECTOR, "li[class='denomination-item']>button")
initial_balance = balance
denominations=driver.find_elements(By.CSS_SELECTOR,"li[class='denomination-item']>button")
for denomination in denominations:
    denomination.click()
    initial_balance-=int (denomination.text)
    print(initial_balance)
    if(int(driver.find_element(By.CSS_SELECTOR, "p[class='balance']").text))==initial_balance:
        print("Working as expected")
    time.sleep(3)
time.sleep(10)

