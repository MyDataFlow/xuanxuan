#!/bin/sh

version=xxd.$1

echo "build version:"$version

echo "build darwin ..."
folder=$version.mac
if [ ! -d $folder ]; then
    mkdir $folder
fi
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o $folder/xxd main.go
cp -ra config $folder
tar zcf $folder.tar.gz $folder
rm -rf $folder


folder=$version.linux-x64
if [ ! -d $folder ]; then
    mkdir $folder
fi
echo "build linux x64 ..."
go build -o $folder/xxd main.go
cp -ra config $folder
tar zcf $folder.tar.gz $folder
rm -rf $folder


folder=$version.linux-ia32
if [ ! -d $folder ]; then
    mkdir $folder
fi
echo "build linux ia32 ..."
GOARCH=386 go build -o $folder/xxd main.go
cp -ra config $folder
tar zcf $folder.tar.gz $folder
rm -rf $folder


folder=$version.win64
if [ ! -d $folder ]; then
    mkdir $folder
fi
echo "build win64 ..."
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o $folder/xxd.exe main.go
cp -ra config $folder
zip -rq $folder.zip $folder
rm -rf $folder


folder=$version.win32
if [ ! -d $folder ]; then
    mkdir $folder
fi
echo "build win32 ..."
CGO_ENABLED=0 GOOS=windows GOARCH=386 go build -o $folder/xxd.exe main.go
cp -ra config $folder
zip -rq $folder.zip $folder
rm -rf $folder


echo "build end "

