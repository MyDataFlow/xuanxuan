VERSION=$(shell head -n 1 ../xxb/VERSION)

all: zentao

zentao:
	mkdir -p ./build/config/ext
	mkdir -p ./build/lib
	mkdir -p ./build/module
	mkdir -p ./build/framework
	mkdir -p ./build/db
	mkdir -p ./build/www
	cp ../ranzhi/config/ext/xuanxuan.php ./build/config/
	cp -r ../ranzhi/lib/phpaes ./build/lib/
	cp -r ../ranzhi/framework/xuanxuan.class.php ./build/framework/
	cp -r ../ranzhi/www/xuanxuan.php ./build/www/
	cp -r ../ranzhi/db/xuanxuan.sql ./build/db/
	cp -r ../ranzhi/app/sys/chat ./build/module/
	cp -r ../ranzhi/app/sys/action ./build/module/
	sed -i 's/site,//' ./build/module/chat/model.php
	sed -i 's/admin, g/g/' ./build/module/chat/model.php
	sed -e '/password = md5/d' ./build/module/chat/control.php
	zip -rqm -9 xuanxuan.zentao.$(VERSION).zip ./build/*
