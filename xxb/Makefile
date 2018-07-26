VERSION=$(shell head -n 1 VERSION)

all: xxb

xxb:
	mkdir -p xxb/db
	mkdir -p xxb/lib
	mkdir -p xxb/app/sys
	mkdir -p xxb/www/data
	mkdir -p xxb/tmp/log
	mkdir -p xxb/tmp/model
	mkdir -p xxb/tmp/backup
	mkdir -p xxb/tmp/extension
	mkdir -p xxb/tmp/package
	mkdir -p xxb/app/oa
	cp -r ./zdoo/framework xxb/
	cp -r ./zdoo/lib/base xxb/lib/
	cp -r ./zdoo/lib/dao xxb/lib/
	cp -r ./zdoo/lib/front xxb/lib/
	cp -r ./zdoo/lib/filter xxb/lib/
	cp -r ./zdoo/lib/pager xxb/lib/
	cp -r ./zdoo/lib/purifier xxb/lib/
	cp -r ./zdoo/lib/mobile xxb/lib/
	cp -r ./zdoo/lib/pinyin xxb/lib/
	cp -r ./zdoo/lib/snoopy xxb/lib/
	cp -r ./zdoo/config xxb/
	cp -r ./zdoo/www/js xxb/www/
	cp -r ./zdoo/www/sys xxb/www/
	cp -r ./zdoo/www/theme xxb/www/
	cp -r ./zdoo/app/oa/attend xxb/app/oa/
	cp -r ./zdoo/app/oa/holiday xxb/app/oa/
	cp -r ./zdoo/app/sys/install xxb/app/sys/
	cp -r ./zdoo/app/sys/common xxb/app/sys/
	cp -r ./zdoo/app/sys/index xxb/app/sys/
	cp -r ./zdoo/app/sys/user xxb/app/sys/
	cp -r ./zdoo/app/sys/group xxb/app/sys/
	cp -r ./zdoo/app/sys/action xxb/app/sys/
	cp -r ./zdoo/app/sys/tree xxb/app/sys/
	cp -r ./zdoo/app/sys/upgrade xxb/app/sys/
	cp -r ./zdoo/app/sys/block xxb/app/sys/
	cp -r ./zdoo/app/sys/setting xxb/app/sys/
	cp -r ./zdoo/app/sys/setting xxb/app/sys/
	cp -r ./zdoo/app/sys/company xxb/app/sys/
	cp -r ./zdoo/app/sys/entry xxb/app/sys/
	cp -r ./zdoo/app/sys/file xxb/app/sys/
	cp -r ./zdoo/app/sys/misc xxb/app/sys/
	cp -r ./zdoo/app/sys/package xxb/app/sys/
	cp -r ./zdoo/app/sys/sso xxb/app/sys/
	cp -r ./backend/* xxb/
	cp -r ./VERSION xxb/
	cp ./zdoo/www/index.php xxb/www/
	cp -r ../ranzhi/* xxb/
	cp -r ./doc xxb/
	php build/xxb.php
	cat xxb/db/xuanxuan.sql >> xxb/db/xxb.sql
	sed -i 's/ranzhi\.sql/xxb\.sql/' xxb/app/sys/install/model.php
	sed -i '/runable/s#^#//#' xxb/app/sys/common/view/footer.html.php
	sed -i '/checkVersion/s#^#//#' xxb/app/sys/user/view/login.html.php
	sed -i '/Remove all entries/i\        return true;' xxb/app/sys/install/model.php
	sed -i 's/x: 40, y: 0/x: 0,y: 0/' xxb/www/js/jquery/ips.js
	sed -i "s/<ul><li><button class='reload-win'>.*<\/ul><\/div>//" xxb/www/js/jquery/ips.js
	sed -i "s/fixNavbar/\/\/fixNavbar/" xxb/www/js/my.js
	sed -i "s/'system'/'setting'/" xxb/app/sys/setting/ext/control/xuanxuan.php
	# sed -i "/'manageAppPriv'/d" xxb/app/sys/group/view/browse.html.php
	# combine js and css files.
	cp -rf tools xxb/ && cd xxb/tools/ && php ./minifyfront.php && php ./cn2tw.php
	rm -rf xxb/tools
	chmod -R 777 xxb/config
	chmod -R 777 xxb/tmp
	chmod -R 777 xxb/www/data
	zip -rqm -9 xxb.$(VERSION).zip xxb
	zip -rq -9 xuanxuan.ranzhi.${VERSION}.zip ../ranzhi/*

deb:
	mkdir ~/buildroot
	cp -r build/debian/DEBIAN ~/buildroot
	sed -i '/^Version/cVersion: ${VERSION}' ~/buildroot/DEBIAN/control
	mkdir -p ~/buildroot/opt
	mkdir -p ~/buildroot/etc/apache2/sites-enabled
	cp build/debian/xxb.conf ~/buildroot/etc/apache2/sites-enabled/
	cp xxb.${VERSION}.zip ~/buildroot/opt/
	cd ~/buildroot/opt; unzip xxb.${VERSION}.zip; rm xxb.${VERSION}.zip
	#sed -i 's/index.php/\/xxb\/sys\/index.php/' ~/buildroot/opt/xxb/www/sys/.htaccess
	#sed -i 's/index.php/\/xxb\/oa\/index.php/' ~/buildroot/opt/xxb/www/oa/.htaccess
	sudo dpkg -b ~/buildroot/ xxb-${VERSION}.deb
	rm -rf ~/buildroot

rpm:
	mkdir -p ~/rpmbuild/SPECS
	cp build/rpm/xxb.spec ~/rpmbuild/SPECS
	sed -i '/^Version/cVersion:${VERSION}' ~/rpmbuild/SPECS/xxb.spec
	mkdir -p ~/rpmbuild/SOURCES
	cp xxb.${VERSION}.zip ~/rpmbuild/SOURCES
	mkdir -p ~/rpmbuild/SOURCES/etc/httpd/conf.d/
	cp build/debian/xxb.conf ~/rpmbuild/SOURCES/etc/httpd/conf.d/
	mkdir -p ~/rpmbuild/SOURCES/opt/
	cd ~/rpmbuild/SOURCES; unzip xxb.${VERSION}.zip; mv xxb opt/
	#sed -i 's/index.php/\/xxb\/sys\/index.php/' ~/rpmbuild/SOURCES/opt/xxb/www/sys/.htaccess
	#sed -i 's/index.php/\/xxb\/oa\/index.php/' ~/rpmbuild/SOURCES/opt/xxb/www/oa/.htaccess
	cd ~/rpmbuild/SOURCES; tar -czvf xxb.${VERSION}.tar.gz etc opt; rm -rf xxb.${VERSION}.zip etc opt
	rpmbuild -ba ~/rpmbuild/SPECS/xxb.spec
	cp ~/rpmbuild/RPMS/noarch/xxb-${VERSION}-1.noarch.rpm ./
	rm -rf ~/rpmbuild

