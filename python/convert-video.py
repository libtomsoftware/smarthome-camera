#!/usr/bin/env python2.7
appPath = "/home/pi/smarthome/camera/"
filesPath = appPath + "server/app/files/"
filename = sys.argv[0]
fullPath = filesPath + filename

print("Converting video...")
videoConvertCommand = "MP4Box -add " + fullPath + ".h264 " + fullPath + ".mp4"
call([videoConvertCommand], shell=True)
print("Video converted...")
