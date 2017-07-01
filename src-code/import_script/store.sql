USE bubbleshop;

load data local infile "/Users/shuyu01/workplace/BubbleShop/data/import_data/store_import.txt" into table store (name, score, address, phone, warehouse_id, img);
