USE bubbleshop;

load data local infile "/Users/shuyu01/workplace/BubbleShop/data/import_data/fruit_import.txt" into table goods (name, kinds, marketprice, img);
