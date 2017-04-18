# Xxd服务器使用流程
## 1 Git安装
### 1.1 Linux、Mac
Centos通过yum，Ubuntu通过apt-get进行安装，Mac通过[官方网站](https://git-scm.com/downloads)、brew或者源代码自己编译安装，为了管理和升级建议使用Homebrew

### 1.2 Windows
>Git for Windows. 国内直接从官网http://git-scm.com/download/win 下载比较困难，需要翻墙。这里提供一个国内的下载站，方便大家下载 https://github.com/waylau/git-for-win 该站与官网同步更新

根据需要下载对应版本，如*Git-2.12.0-64-bit.exe*。

下载后进行安装，之前的步骤可以选择默认，到下图步骤时请选择 ***Use Git Bash only***

![Adjusting your PATH environment](http://img.sinkiot.com/xxdUserManual/25806493_1345448675558S.jpg)

**next** 进入到一下界面，选择 ***Checkout as-is, commit Unix-style line endings***

![Configuring the line ending conversions](http://img.sinkiot.com/xxdUserManual/25806493_134544868979mf.jpg)

之后的步骤都可以选择默认 **next** 直到安装完成。这个时候已经可以使用git了， 打开Git Bash可以进入linux shell，可以使用git命令进行各种操作。

## 2 golang环境配置
### 2.1 Linux、Mac
根据操作系统[下载](http://www.golangtc.com/download)对应的软件包，以linux为例，下载 go1.8.linux-amd64.tar.gz。

* 解压文件到 */usr/local/* 目录 （自定义目录请设置GOROOT环境变量）
* 创建golang的工作目录，如目录在 */root/gowork* 并在gowork中建立src目录
* 设置GOPATH环境变量 `export GOPATH=/root/gowork`
* 设置PATH环境变量 `export PATH=$PATH:/usr/local/go/bin`

### 2.2 Windows
根据需要[下载](http://www.golangtc.com/download)对应的软件包，以64位系统为例，下载 go1.8.windows-amd64.zip。

* 把解压缩后的文件夹go放到到指定目录，如*c:/*
* 创建golang的工作目录，如目录在 *c:/gowork/* 并在目录中建立src目录
* 设置GOPATH环境变量
   ![gopath|550x400](http://img.sinkiot.com/xxdUserManual/20170418144924_gopath.png)
* 设置Path环境变量
   ![path|550x400](http://img.sinkiot.com/xxdUserManual/20170418145032_path.png)
   完成以上配置后，Windows的golang环境就配置完成了。

## 3 代码下载
* 下载喧喧代码：git clone https://github.com/easysoft/xuanxuan.git 
* Linux、Mac等系统可以进入到目录 *xuanxuan/server* 建立连接 `ln -s  ·pwd·/xxd $GOPATH/src/xxd`
* Windows系统可以把 *xuanxuan/server/xxd* 目录拷贝到 *gowork/src* 目录下
* 下载依赖包：
```bash
# config ini
go get github.com/Unknwon/goconfig

# websocket
go get github.com/gorilla/websocket
```

## 4 服务器配置与运行
golang支持编译运行和源码运行两种方式。
从golang的工作目录gowork进入到xxd目录
源码运行 `go run main.go`
编译运行 `go build main.go`后会生成一个二进制文件，运行二进制文件。

若对配置有其它要求，可以进入到config目录对xxd.conf进行修改

* **Server test模式**
  源码运行 `go run main.go -test true`
  编译运行 `./main -test true`
