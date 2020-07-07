#!/usr/bin/env python2.7
from picamera import PiCamera
from gpiozero import MotionSensor
from time import sleep
import os
import time
import csv

pir = MotionSensor(4)
appPath = "/home/pi/smarthome/camera/"
filesPath = appPath + "server/app/files/"
sharedPath = appPath + "shared/"
configPath = sharedPath + "config/"
settingsPath = sharedPath + "settings/"

f = open(configPath + "device.txt", "rt")
device = f.read().replace('\n', '')
f.close()

camera = PiCamera()
camera.rotation = 270
camera.resolution = (1920, 1080)
camera.led = False

print("Starting camera monitoring...")

while True:
    pir.wait_for_motion()

    settingsFile = open(settingsPath + "status.txt", "rt")
    settings = settingsFile.read().replace('\n', '').split(",")
    settingsFile.close()

    if len(settings) == 2:
        is_enabled = settings[0]
        is_armed = settings[1]

        timestamp = str(int(time.time()))
        filename = device + "_" + timestamp
        filename_video = filename + ".h264"
        filename_photo = filename + ".jpg"

        if is_armed == "0" and is_enabled == "1":
            os.system(
                'omxplayer --no-keys ~/smarthome/camera/audio/arming-alarm.wav &')

        if is_armed == "1":
            print("Alarm! Alarm! Alarm!")
            os.system('omxplayer --no-keys ~/smarthome/camera/audio/alarm.wav &')

        if is_enabled == "1":
            print("Motion detected, recording!")
            camera.led = True
            camera.start_preview()
            sleep(2)
            camera.capture(filesPath + filename_photo)
            camera.start_recording(filesPath + filename_video)
            sleep(10)
            pir.wait_for_no_motion()

            print("No more motion, stopping...")
            camera.stop_recording()
            camera.stop_preview()
            camera.led = False

            videoH264 = filesPath + filename + ".h264"
            videoMp4 = filesPath + filename + ".mp4"
            command = "MP4Box -add " + videoH264 + " " + videoMp4
            os.system(command)

            f = open(sharedPath + "data/" + filename + ".csv", "w")
            f.write(device + "," + timestamp + "," +
                    filename_photo + "," + filename + ".mp4")
            f.close()