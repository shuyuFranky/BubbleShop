import sys
import urllib2
import os

def saveImg(img_url, filename):
    try:
        u = urllib2.urlopen(img_url)
        data = u.read()
        f = open(filename, 'wb')
        f.write(data)
        f.close()
    except urllib2.URLError, e:
        print e.reason
        print "hhhhhhh"
        return 

input_file = sys.argv[1]
fh = open(input_file, 'r')

os.chdir('../data/img_store/')
for line in fh:
    line = line.strip("\n")
    # for fruit_img
    #number, name, url, price = line.split("\t")
    # for store_img
    number, name, pos, url = line.split("\t")
    img_name = 'img_' + number + '.png'
    saveImg(url, img_name)
    print("Save img => %s"%(img_name))

fh.close()
