Name:xxb
Version:1.0.stable
Release:1
Summary:This is XXB software for xuanxuan.

Group:utils
License:ZPL
URL:http://xuan.im
Source0:%{name}.%{version}.tar.gz
BuildRoot:%{_tmppath}/%{name}-.%{version}-root
BuildArch:noarch
Requires:httpd,php-cli,php,php-common,php-pdo,php-mysql,php-json,php-ldap,mysql

%description

%prep
%setup -c

%install
mkdir -p $RPM_BUILD_ROOT
chmod 777 -R %{_builddir}/%{name}-%{version}/opt/xxb/tmp/
chmod 777 -R %{_builddir}/%{name}-%{version}/opt/xxb/www/data
chmod 777 -R %{_builddir}/%{name}-%{version}/opt/xxb/config
chmod 777 %{_builddir}/%{name}-%{version}/opt/xxb/app
chmod 777 %{_builddir}/%{name}-%{version}/opt/xxb/www
find %{_builddir}/%{name}-%{version}/opt/xxb/ -name ext |xargs chmod -R 777
cp -a %{_builddir}/%{name}-%{version}/* $RPM_BUILD_ROOT

%clean
rm -rf $RPM_BUILD_ROOT

%files
/

%post
chcon -R --reference=/var/www/html/ /opt/xxb/
lowVersion=`httpd -v|awk '$3~/Apache/{print $3}'|awk -F '/' '{print ($2<2.4) ? 1 : 0}'`
if [ $lowVersion -eq 1 ]; then
sed -i '/Require all granted/d' /etc/httpd/conf.d/xxb.conf
fi

echo "xxb has been successfully installed."
echo "Please restart httpd and visit http://localhost/xxb."
