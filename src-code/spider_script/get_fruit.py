from bs4 import BeautifulSoup
import re
import sys

def mydecode(s):
    s = unicode(s)
    s = s.encode('UTF-8')
    return s


input_file =  sys.argv[1]
soup = BeautifulSoup(open(input_file), "lxml")
fruit_info = soup.find_all("div", class_ = "buy-title")

fh = open('fruit_info.txt', 'w')

i = 0
for item in fruit_info:
    i += 1
    name = item.h3.string
    ind = 0
    for child in item.h4.children:
        ind += 1
        if ind == 1:
            price = child.string
        else:
            market_price = child.string
    name = mydecode(name)
    price = mydecode(price)
    market_price = mydecode(market_price)
    data = str(i) + "\t" + name + "\t" + market_price + "\t" + price
    fh.write(data + "\n")

fh.close()



