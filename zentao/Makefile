VERSION=$(shell head -n 1 ../xxb/VERSION)

all: zentao

zentao:
	//config/ext/xuanxuan.php
	//lib/phpaes
	//framework/xuanxuan.class.php
	//www/xuanxuan.php
	//module/action/ext/lang	
	mkdir -p config
	mkdir -p module
	cp -r ./VERSION xxb/
	cp ./zdoo/www/index.php xxb/www/
	cp -r ../ranzhi/* xxb/
	cp -r ./doc xxb/
	php build/xxb.php
	cat xxb/db/xuanxuan.sql >> xxb/db/xxb.sql
	sed -i 's/ranzhi\.sql/xxb\.sql/' xxb/app/sys/install/model.php
	zip -rqm -9 xxb.$(VERSION).zip xxb

