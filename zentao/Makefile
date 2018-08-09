VERSION=$(shell head -n 1 ../xxb/VERSION)

all: zentao

zentao:
	mkdir -p ./build/config/ext
	mkdir -p ./build/lib
	mkdir -p ./build/module
	mkdir -p ./build/framework
	mkdir -p ./build/db
	mkdir -p ./build/www
	cp ../ranzhi/config/ext/xuanxuan.php ./build/config/ext/
	cp -r ../ranzhi/lib/phpaes ./build/lib/
	cp -r ../ranzhi/framework/xuanxuan.class.php ./build/framework/
	cp -r ../ranzhi/db/xuanxuan.sql ./build/db/
	cp -r ../ranzhi/app/sys/chat ./build/module/
	cp -r ../ranzhi/app/sys/action ./build/module/
	cp -r ./xuanxuan/module/* ./build/module/
	cp -r ./xuanxuan/www/* ./build/www/
	sed -i 's/site,//' ./build/module/chat/model.php
	sed -i 's/admin, g/g/' ./build/module/chat/model.php
	sed -i '/password = md5/d' ./build/module/chat/control.php
	sed -i '/getSignedTime/d' ./build/module/chat/control.php
	sed -i 's/tree/dept/' ./build/module/chat/control.php
	sed -i "s/, 'sys'//" ./build/module/chat/control.php
	sed -i 's/system.sys/system/' ./build/module/chat/control.php
	sed -i 's/&app=sys//' ./build/module/chat/control.php
	sed -i 's/file->createdBy/file->addedBy/' ./build/module/chat/control.php
	sed -i 's/file->createdDate/file->addedDate/' ./build/module/chat/control.php
	sed -i 's/im_/zt_im_/' ./build/db/xuanxuan.sql
	sed -i 's/sys_user/zt_user/' ./build/db/xuanxuan.sql
	sed -i 's/sys_file/zt_file/' ./build/db/xuanxuan.sql
	zip -rqm -9 xuanxuan.zentao.$(VERSION).zip ./build/*
	rm -rf ./build
