USE bubbleshop;


load data local infile "/Users/shuyu01/workplace/BubbleShop/data/import_data/store_has_goods_import.txt" into table store_goods (store_id, goods_id, price);
