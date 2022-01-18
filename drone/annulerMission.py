import sys
import asyncio
from mavsdk import System
from mavsdk.mission import (MissionItem, MissionPlan)

async def run():
    drone = System()
    await drone.connect(system_address="udp://:14540")

    print("Waiting for drone to connect...")
    async for state in drone.core.connection_state():
        if state.is_connected:
            print("Drone discovered with UUID: {}".format(state.uuid))
            break

    print("-- Mission pause")
    await drone.mission.pause_mission()

    print("-- Mission clear")
    await drone.mission.clear_mission()

if __name__ == "__main__":
        loop = asyncio.get_event_loop()
        loop.run_until_complete(run())

