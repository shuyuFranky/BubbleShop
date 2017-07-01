#encoding:utf-8

from bs4 import BeautifulSoup
import urllib2
import re
import os

#--------------------
#   Tool class
#   preprocessing the p tag,
#   delete the useless infomation
#--------------------
class Tool():
    #去除img标签
    removeImg = re.compile('<img.*?src=.*?>')
    #删除超链接标签
    removeAddr = re.compile('<a.*?>|</a>')
    #除去换行的标签
    replaceLine = re.compile('<tr>|<div>|</div>|</p>')
    #除去表格制表<td>
    replaceTD = re.compile('<td>')
    #除去换行符或双换行符
    replaceBR = re.compile('<br><br>|<br>')
    #将其余标签剔除
    removeExtraTag = re.compile('<.*?>')
    #将字母剔除
    removeAlpha = re.compile('[a-zA-Z]')
    def replace(self, x):
        x = re.sub(self.removeImg, "", x)
        x = re.sub(self.removeAddr, "", x)
        x = re.sub(self.replaceLine, "", x)
        x = re.sub(self.replaceTD, "", x)
        x = re.sub(self.replaceBR, "", x)
        x = re.sub(self.removeExtraTag, "" ,x)
        #x = re.sub(self.removeAlpha,"",x)
        #strip()将前后多余内容删除
        return x.strip()

#--------------------
#   Web Spider
#
#--------------------
class WebSpider():
    
    def __init__(self, url):
        self.tool = Tool()
        self.url = url
        try:
            self.html = urllib2.urlopen(self.url)
            pagedata = self.html.read().decode('utf-8')
            self.soup = BeautifulSoup(pagedata, "lxml")
        except urllib2.URLError as e:
            print(url)
            print(e.reason)

    def get_title(self):
        return self.soup.title.string
    
    def get_title_len(self, t):
        title = self.get_title()
        if t == 'utf8':
            title = title.encode('UTF-8')
            return len(title)
        elif t == 'unicode':
            title = unicode(title)
            return len(title)
        else :
            print "fmt error, using 'utf8' or 'unicode'"
            return None

    def get_images(self):
        images = self.soup.find_all('img')
        return images

    def get_image_num(self):
        images = self.soup.find_all('img')
        return len(images)

    def get_video_num(self):
        videos = self.soup.find_all('video')
        return len(videos)
        
    def get_passage_data(self):
        data = ""
        for msg in self.soup.find_all('p'):
            if not msg.string:
                #print("None")
                continue
            data += self.tool.replace((msg.string).encode('UTF-8'))
        return data

    def get_passage_len(self, t):
        data = self.get_passage_data()
        if t == 'utf8':
            return len(data)
        elif t == 'unicode':
            data = data.decode('UTF-8')
            return len(data)
        else:
            print "fmt error, using 'utf8' or 'unicode'"
            return None

    def print_all(self):
        print "title : ", self.get_title()
        print "title length : ", self.get_title_len('unicode')
        print "image number : ", self.get_image_num()
        print "video number : ", self.get_video_num()
        print "passage length : ", self.get_passage_len('unicode')
        print "passage content : "
        print self.get_passage_data()

    
    def download_all_images(self, dir_name):
        os.chdir(dir_name)
        image = self.get_images()
        num = 0
        for msg in image:
            num += 1
            msg = unicode(msg)
            msg = msg.encode('UTF-8')
            pattern = re.compile('src="(.*?)"', re.S)
            img_url = re.findall(pattern, msg)[0]
            name = "img_" + str(num) + ".png"
            if img_url[0] == 'h':
                self.saveImg(img_url, name)

    #传入图片地址，文件名，保存单张图片
    def saveImg(self,imageURL,fileName):
        try:
            u = urllib2.urlopen(imageURL)
            data = u.read()
            f = open(fileName, 'wb')
            f.write(data)
            f.close()
        except urllib2.URLError, e:
            print e.reason
            print "hhhhhhhhh"
            return 

spider = WebSpider("http://www.xuxian.com")
spider.saveImg("http://imgcdn.xuxian.com/upload/2016/05/16/20160516165147786.png", "image_03.png")
#spider.saveImg("http://imgcdn.xuxian.com/upload/2016/10/31/20161031021027213_464_261.jpg", "image_01.png")
#spider.saveImg("http://imgcdn.xuxian.com/upload/2016/10/31/20161031021027213_464_261.jpg", "image_02.png")
#spider.download_all_images("./tmp")
#spider.print_all()
"""
image = spider.get_images()
fh = open('imgurl', 'w')
for msg in image:
    msg = unicode(msg)
    msg = msg.encode('UTF-8')
    pattern = re.compile('src="(.*?)"', re.S)
    print type(re.findall(pattern, msg))
    fh.write(re.findall(pattern, msg)[0]+"\n")
fh.close()

fh = open('imgurl', 'r')
i = 0
for line in fh:
    i += 1
    spider.saveImg(line, "img"+str(i))
    print "----ok----"

"""
