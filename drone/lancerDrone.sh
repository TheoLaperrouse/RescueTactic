#!/bin/bash
docker stop headless
docker run --name headless -d --rm -it --env PX4_HOME_LAT=$1 --env PX4_HOME_LON=$2 --env PX4_HOME_ALT=0.0 jonasvautherin/px4-gazebo-headless:1.11.0
sleep 20
echo 'On démarre le programme python'
echo $3 $4 $5 $6
python3 ./drone/lancerMission.py $3 $4 $5 $6
#docker run --name headless    --rm -it --env PX4_HOME_LAT=48.115682 --env PX4_HOME_LON=-1.637667 --env PX4_HOME_ALT=0.0 jonasvautherin/px4-gaz>