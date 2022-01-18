import requests
import json
import time
import sys
import random

while 1:
    longit = "48.1156" + str(random.randint(0, 9))
    latit = "-1.6376" + str(random.randint(0, 9))
    print('lat : {} long : {}'.format(latit,longit))
    url = 'http://pitgroupb.istic.univ-rennes1.fr/api/drone/update_drone_value'
    myobj = {"idIntervention" : sys.argv[1] ,"longitude" : float(longit) ,"latitude" : float(latit) }
    print(myobj)
    headers={'Content-type':'application/json', 'Accept':'application/json'}
    req = requests.post(url, json=myobj,headers=headers)
    print(req.status_code, req.reason)
    time.sleep(1)