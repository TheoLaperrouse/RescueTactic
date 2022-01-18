import folium
import sys
import os
import io
from PIL import Image
from selenium.webdriver.firefox.options import Options
from selenium import webdriver
import time

fn = 'index.html'
token = "pk.eyJ1IjoidG90b2Jpc2NvdG8iLCJhIjoiY2ttNG4yMGhsMDUyczJ3cXQ4YzR1YWFtbiJ9.1-6kh-im0NGu6cepBJxrRQ"
tileurl = 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=' + str(token)
m = folium.Map(location=[float(sys.argv[1]), float(sys.argv[2])], zoom_start=24, service_log_path=os.path.devnull ,tiles=tileurl, attr='Mapbox')
m.add_child(folium.LatLngPopup())
m.save(fn)
options = Options()
options.add_argument("--headless")
driver = browser = webdriver.Firefox(options=options,executable_path='C:/Users/avanniekerk/Downloads/geckodriver')
driver.set_window_size(4000, 3000)
tmpurl='file://{path}/{mapfile}'.format(path=os.getcwd(),mapfile=fn)
driver.get(tmpurl)
time.sleep(5)
driver.save_screenshot('screenshot.png')
im = Image.open("screenshot.png")
im_size = im.size
print(im_size)
left = 1950 - 75
top = 1413 - 75
width = 250
height = 250
box = (left, top, left+width, top+height)
area = im.crop(box)
print(area.size)
area.save("goodScreenShoot.png", "PNG")
