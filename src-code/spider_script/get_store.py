from bs4 import BeautifulSoup
import re
import sys

def mydecode(s):
    s = unicode(s)
    s = s.encode('UTF-8')
    return s


input_file =  sys.argv[1]
soup = BeautifulSoup(open(input_file), "lxml")
store_info = soup.find_all("div", class_ = "block")

fh = open('store_info.txt', 'w')

i = 0
for item in store_info:
    i += 1
    item = item.div.ul
    img_url = ''
    store_name = ''
    store_pos = ''
    for child in item.children:
        if str(type(child)) == "<class 'bs4.element.Tag'>":
            info = child.get('class')
            if info[0] == "clear":
                continue
            elif info[0] == "one":
                img_url = child.img.get('src')
            elif info[0] == "two":
                store_name = child.h3.string
                store_pos = child.p.string
       
    store_name = mydecode(store_name)
    store_pos = mydecode(store_pos)
    img_url = mydecode(img_url)
    data = str(i) + "\t" + store_name + "\t" + store_pos + "\t" + img_url
    fh.write(data + "\n")

fh.close()



