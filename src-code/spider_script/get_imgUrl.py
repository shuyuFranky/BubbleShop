from bs4 import BeautifulSoup
import re

soup = BeautifulSoup(open("xuxian.html"), "lxml")
fruit_img_url = soup.find_all("img", class_ = "scrollLoading")
fruit_name_price = soup.find_all("div", class_ = "buy-title")

"""
for item in fruit_img_url:
    url = item.get('xsrc')
    url = unicode(url)
    url = url.encode('UTF-8')
    img = item.get('title')
    img = unicode(img)
    img = img.encode('UTF-8')
    print(img + "\t" + url)
"""
for item in fruit_name_price:
    price_tag = item.h4.span
    price = unicode(price_tag.string)
    price = price.encode('UTF-8')
    print(price)
