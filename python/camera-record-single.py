#!/usr/bin/env python2.7
from picamera import PiCamera
from time import sleep
import time

appPath = "/home/pi/smarthome/camera/"
filesPath = appPath + "server/app/files/"
configPath = sharedPath + "config/"

f = open(configPath + "device.txt", "rt")
device = f.read().replace('\n', '')
f.close()

timestamp = str(int(round(time.time() * 1000)))
filename = device + "_" + timestamp
filename_video = filename + ".h264"

camera = PiCamera()
camera.rotation = 270
camera.resolution = (1920, 1080)
camera.led = False

print("Recording...")
camera.led = True
camera.start_preview()
sleep(2)
camera.start_recording(filesPath + filename_video)
sleep(10)
print("Stopping...")
camera.stop_recording()
camera.stop_preview()
camera.led = False
