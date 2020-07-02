#!/usr/bin/env python2.7
from picamera import PiCamera
from gpiozero import MotionSensor
from time import sleep
import time
import csv

pir = MotionSensor(4)
sharedPath = "../shared/"
configPath = sharedPath + "config/"
settingsPath = sharedPath + "settings/"

f = open(configPath + "device.txt", "rt")
device = f.read().replace('\n', '')
f.close()

timestamp = str(int(time.time()))
filename = device + "_" + timestamp
filename_video = filename + ".h264"
filename_photo = filename + ".jpg"
camera = PiCamera()
camera.rotation = 270
camera.resolution = (1920, 1080)

settingsFile = open(settingsPath + "status.txt", "rt")
settings = settingsFile.read().replace('\n', '').split(",")

print("Settings: %s" % (settings[0]))

# while True:
# 	pir.wait_for_motion();

# 	isArmedFile = open(settingsPath + "is_armed.txt", "rt");
# 	is_armed = isArmedFile.read().replace('\n', '');
# 		isArmedFile.close();

# 	if is_armed == "1":
# 		print("Motion detected, recording!");

# 		camera.start_preview();
# 		sleep(2);
# 		camera.capture(sharedPath + "photo/" + filename_photo);
# 		camera.start_recording(sharedPath + "video/" + filename_video);

# 		pir.wait_for_no_motion();
# 		print("No more motion, stopping...");
# 		camera.stop_recording();
# 		camera.stop_preview();

# 		f = open(sharedPath + "data/" + timestamp + ".csv", "w");
# 		f.write(device + "," + timestamp + "," + filename_photo + "," + filename_video);
# 		f.close();
