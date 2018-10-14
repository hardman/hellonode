#!/bin/sh

#启动mysql
/bin/sh /usr/local/opt/mysql/bin/mysqld_safe --datadir=/usr/local/var/mysql

#启动memcache
/usr/local/bin/memcached -d -m 2048  -u root -l 127.0.0.1 -p 12111 -c 1024 -P /tmp/memcached.pid

#启动nodejs
node ./app.js
