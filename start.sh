#!/bin/sh

#启动mysql
/bin/sh $(which mysqld_safe) --datadir=$(which /usr/local/var/mysql)

#启动memcache
$(which memcached) -d -m 2048  -u root -l 127.0.0.1 -p 12111 -c 1024 -P /tmp/memcached.pid

#启动nodejs
node ./app.js
