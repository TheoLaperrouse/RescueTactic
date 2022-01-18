import sys
import asyncio
from mavsdk import System
from mavsdk.mission import (MissionItem, MissionPlan)
import requests
import json
import subprocess
from random_object_id import generate
import folium
import os
import io
from PIL import Image
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium import webdriver
import time

battery = 100
idIntervention = str(sys.argv[3]) 
longitudeGlobal = 0
latitudeGlobal = 0
indexMax = int(sys.argv[4])


options = Options()
options.add_argument("--headless")
options.add_argument("--disable-extensions")
driver = webdriver.Firefox(options=options,executable_path='./scripts/geckodriver')
driver.set_window_size(4000, 3000)


def take_screenshoot(idInterv,index,video):

    url = f"http://pitgroupb.istic.univ-rennes1.fr/api/drone/{sys.argv[3]}"

    headers = {'Content-type':'application/json', 'Accept':'application/json'}
    r = requests.get(url, headers=headers)
    points = r.json()
    longitudeGlobal = points['position']['coordonnee']['longitude']
    latitudeGlobal = points['position']['coordonnee']['latitude']

    print("\n\nDONNEE DU DRONE :")
    print(longitudeGlobal)
    print(latitudeGlobal)

    latitude = float(latitudeGlobal)
    longitude = float(longitudeGlobal)

    idImage = generate()

    file = ""
    if video : 
        idImage="video"
        dir = f"./uploads/{idInterv}"
        file = f'./uploads/{idInterv}/video.png'
    else:
        dir = f'./uploads/{idInterv}/{index}'
        file = f'./uploads/{idInterv}/{index}/{idImage}.png'

    fn = 'index.html'
    token = "pk.eyJ1IjoidG90b2Jpc2NvdG8iLCJhIjoiY2ttNG4yMGhsMDUyczJ3cXQ4YzR1YWFtbiJ9.1-6kh-im0NGu6cepBJxrRQ"
    tileurl = 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=' + str(token)
    m = folium.Map(location=[latitude, longitude], zoom_start=24, service_log_path=os.path.devnull ,tiles=tileurl, attr='Mapbox')
    m.add_child(folium.LatLngPopup())
    m.save(fn)    
    # options.add_argument("start-maximized");
    # options.add_argument("--disable-gpu");
    tmpurl='file://{path}/{mapfile}'.format(path=os.getcwd(),mapfile=fn)
    driver.get(tmpurl)
    time.sleep(1)
    driver.save_screenshot('screenshot.png')
    im = Image.open("screenshot.png")
    im_size = im.size
    print(im_size)
    left = 1875
    top = 1338
    width = 250
    height = 250
    box = (left, top, left+width, top+height)
    area = im.crop(box)
    print(area.size)
    if not os.path.exists(dir):
        os.makedirs(dir)
    area.save(file, "PNG")

    if video : 
        print('Video add image')
        url = 'http://pitgroupb.istic.univ-rennes1.fr/api/drone/add_image_video'
        myobj = {"idIntervention" : idIntervention} 
        headers= {'Content-type':'application/json', 'Accept':'application/json'}
        print(myobj)
        req = requests.post(url, json=myobj,headers=headers)
        print(req.status_code, req.reason)
    else :
        print('add image par point')
        url = 'http://pitgroupb.istic.univ-rennes1.fr/api/drone/add_image_point'
        myobj = {"idIntervention" : idIntervention, "indexPoint" : index, "name" : idImage} 
        headers= {'Content-type':'application/json', 'Accept':'application/json'}
        print(myobj)
        req = requests.post(url, json=myobj,headers=headers)
        print(req.status_code, req.reason)


async def runTelemetry(drone):
    asyncio.ensure_future(print_position(drone))
    asyncio.ensure_future(print_battery(drone))
    #asyncio.ensure_future(print_video(drone))

async def print_battery(drone):
    global battery
    async for pos in drone.telemetry.battery():
        battery = battery - 1
        print('BATTERY UPDATE : {}'.format(battery))
        url = 'http://pitgroupb.istic.univ-rennes1.fr/api/drone/update_drone_value'
        myobj = {"idIntervention" : idIntervention ,"batterie" :battery }
        headers={'Content-type':'application/json', 'Accept':'application/json'}
        req = requests.post(url, json=myobj,headers=headers)
        print(req.status_code, req.reason)
        await asyncio.sleep(10) 
        if  battery < 0 :
            print("-- Mission pause")
            await drone.mission.pause_mission()
            print("-- Mission clear")
            await drone.mission.clear_mission()
            exit()

async def print_video(drone) :
    async for gps_info in drone.telemetry.gps_info():
        print('\nPHOTO VIDEO\n')
        asyncio.ensure_future(take_screenshoot(idIntervention,' ', True))
        # Thread(target = take_screenshoot, args=(idIntervention,' ', True,)).start()

async def print_position(drone):
    global latitudeGlobal
    global longitudeGlobal
    async for position in drone.telemetry.position():
        latitudeGlobal = position.latitude_deg
        longitudeGlobal = position.longitude_deg
        print('lat : {} long : {}'.format(latitudeGlobal,longitudeGlobal))
        url = 'http://pitgroupb.istic.univ-rennes1.fr/api/drone/update_drone_value'
        myobj = {"idIntervention" : idIntervention ,"longitude" : position.longitude_deg ,"latitude" :position.latitude_deg }
        headers={'Content-type':'application/json', 'Accept':'application/json'}
        req = requests.post(url, json=myobj,headers=headers)
        print(req.status_code, req.reason)
        await asyncio.sleep(1)  
    

if len(sys.argv) > 3:
    command = 'mylist = {0}'.format(sys.argv[1])
    exec(command)
    print(mylist)
    coords = []
    for b in mylist:
        coords.append([float(b[0]),float(b[1]),float(b[2])])
    mode = sys.argv[2].lower()
    mode_boucle = 'boucle'
    mode_reverse = 'reverse'

    is_reverse = False

    async def run():
        drone = System()
        await drone.connect(system_address="udp://:14540")
        async for state in drone.core.connection_state():
            if state.is_connected:
                break

        mission_items = []
        asyncio.ensure_future(runTelemetry(drone))
        for coord in coords:
            mission_items.append(MissionItem(coord[0],
                                            coord[1],
                                            coord[2],
                                            15,
                                            True,
                                            float('nan'),
                                            float('nan'),
                                            MissionItem.CameraAction.TAKE_PHOTO,
                                            float('nan'),
                                            float('nan')))

        mission_plan = MissionPlan(mission_items)

        mission_items_reverse = mission_items[:]
        mission_items_reverse += mission_items[::-1]
        mission_plan_reverse = MissionPlan(mission_items_reverse)

        print_mission_progress_task = asyncio.ensure_future(print_mission_progress(drone))
        running_tasks = [print_mission_progress_task]

        observe_termination_task = asyncio.ensure_future(observe_termination(drone, running_tasks))

        # await drone.mission.set_return_to_launch_after_mission(True)

        if (mode == mode_boucle):
            await drone.mission.upload_mission(mission_plan)
        elif (mode == mode_reverse):
            await drone.mission.upload_mission(mission_plan_reverse)
        await drone.action.arm()
        await drone.mission.start_mission()
        await observe_termination_task

    async def print_mission_progress(drone):
        async for mission_progress in drone.mission.mission_progress():
            if(mission_progress.current > 0):
                print('On prend une photo!')
                #indexPhoto = int(mission_progress.current % ((mission_progress.total/2)+1))
                indexPhoto = int(indexMax) + int(mission_progress.current)
                print(indexPhoto)
                print('\nPHOTO POINT\n')
                #await asyncio.ensure_future(take_screenshoot(idIntervention,indexPhoto, False))
                # Thread(target = take_screenshoot, args=(idIntervention,indexPhoto, False,)).start()

            if (mission_progress.current == mission_progress.total):
                print("ON A FINI")
                await drone.mission.set_current_mission_item(0)
                print("ON REPART")

    async def observe_termination(drone, running_tasks):
        """ Monitors whether the drone is still in mission or not and
            returns if not """

        was_in_mission = False

        async for flight_mode in drone.telemetry.flight_mode():
            if (str(flight_mode) == "MISSION"):
                is_in_mission = True
            else:
                is_in_mission = False

            if is_in_mission:
                was_in_mission = True

            if was_in_mission and not is_in_mission:
                for task in running_tasks:
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                await asyncio.get_event_loop().shutdown_asyncgens()

                return


        """ Monitors whether the drone is flying or not and
            returns after landing """

        was_in_air = False
        async for is_in_air in drone.telemetry.in_air():
            if is_in_air:
                was_in_air = is_in_air

            if was_in_air and not is_in_air:
                for task in running_tasks:
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                await asyncio.get_event_loop().shutdown_asyncgens()
                return

    if __name__ == "__main__":
        loop = asyncio.get_event_loop()
        loop.run_until_complete(run())

else:
    print("Il manque des paramètres !")


# Istic points:
# start:
# 48.115634;-1.637820

# point 1:
# 48.115682;-1.637667

# point 2:
# 48.115537;-1.638273

# point 3:
# 48.115202;-1.638024

# "[(48.115682;-1.637667;10),(48.115537;-1.638273;15),(48.115202;-1.638024;10)]"

# commands :
# winpty docker run --rm -it --env PX4_HOME_LAT=48.115634 --env PX4_HOME_LON=-1.637820 --env PX4_HOME_ALT=0.0 jonasvautherin/px4-gazebo-headless:1.11.0
# python3 ./drone/lancerMission.py [[48.115682,-1.637667,5],[48.115537,-1.638273,5],[48.115202,-1.638024,5]] boucle idInterv
# python mission.py "[(48.115682;-1.637667;5),(48.115537;-1.638273;5),(48.115202;-1.638024;5)]" reverse
# python mission.py "[(48.115682;-1.637667;5),(48.115537;-1.638273;5),(48.115202;-1.638024;5)]" truc
