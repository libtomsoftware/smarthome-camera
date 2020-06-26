from datetime import datetime

dateTimeObj = datetime.now()
device = "camera01"
timestamp = dateTimeObj.strftime("%Y%b%d-%H-%M-%S-%f)")
filename = device + "-" + timestamp

raspistill -o ../shared/photo/filename.jpg

f = open("../shared/data/" + timestamp + ".csv", "w")
f.write(device + "," + "," + timestamp + "," + filename)
f.close()