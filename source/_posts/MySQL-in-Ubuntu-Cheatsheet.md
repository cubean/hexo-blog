---
title: MySQL Installation and Commands
date: 2017-08-08 11:48:57
categories: MySQL
tags: 
- MySQL
---

## 1. Mount additional disk to mysql data folder

```sh
$ sudo fdisk -l
$ sudo mkfs.ext4 /dev/xvdb
$ sudo mkdir /var/lib/mysql
$ sudo vi /etc/fstab
/dev/xvdb      /var/lib/mysql         ext4    defaults,nofail 0 2

$ sudo mount -a
$ df -h

$ sudo rm -rf /var/lib/mysql/*
```

## 2. Install MySQL in Redhat 

[Official Doc](https://dev.mysql.com/doc/refman/5.7/en/linux-installation-yum-repo.html)

```sh
$ curl -O https://repo.mysql.com//mysql57-community-release-el7-11.noarch.rpm
$ sudo yum -y localinstall mysql57-community-release-el7-11.noarch.rpm
$ sudo yum repolist all | grep mysql

$ sudo yum -y install mysql-community-server

$ sudo service mysqld start
$ sudo service mysqld status

$ sudo grep 'temporary password' /var/log/mysqld.log
$ mysql -uroot -p
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '<ROOTPsw>';

mysql> SHOW VARIABLES LIKE 'validate_password%';
mysql> SET GLOBAL validate_password_policy=LOW;
```

## 3. Install MySQL in Ubuntu

```sh
$ sudo apt-get update
$ sudo apt-get install mysql-server

// Set administrator password
$ sudo mysql_secure_installation

// Validate password
$ mysqladmin -p -u root version
```

<!-- more -->

## 4. Create new user

```sh
$ mysql -uroot -p
mysql > CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
mysql > CREATE USER 'username'@'%' IDENTIFIED BY 'password';
mysql > GRANT ALL ON *.* TO 'username'@'localhost';
mysql > GRANT ALL ON *.* TO 'username'@'%';

// Give part authorization
mysql > GRANT SELECT, INSERT, UPDATE, DELETE, ALTER, CREATE, DROP, INDEX, LOCK TABLES, REFERENCES
  ON webdb.* TO 'new_user’@‘%’;
```

## 5. Open remote visiting in Ubuntu

```sh
// Enable remote visiting
$ sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf

// Find and comment next line
…
# bind-address = 127.0.0.1
…

```

## 6. Restart mysql

```sh
// Restart mysql
$ sudo systemctl restart mysql

```

## Other options

### Duplicate table

```sql
CREATE TABLE newtable LIKE oldtable; 
INSERT newtable SELECT * FROM oldtable;
```

### Change max connection num

```sh

$ sudo cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.bak

$ sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
max_connections        = 1000
max_user_connections   = 600

$ sudo service mysql restart

```

### FORCE UNLOCK for locked tables in MySQL


Breaking locks like this may cause atomicity in the database to not be enforced on the sql statements that caused the lock.
This is hackish, and the proper solution is to fix your application that caused the locks. However, when dollars are on the line, a swift kick will get things moving again.
1) Enter MySQL

```sh
mysql -u your_user -p
```

2) Let's see the list of locked tables

```
mysql> show open tables where in_use>0;
```

3) Let's see the list of the current processes, one of them is locking your table(s)

```
mysql> show processlist;
```

4) Kill one of these processes

```
mysql> kill <put_process_id_here>;
```

### Change the root password

```sh
$ sudo /etc/init.d/mysql stop
$ sudo mysqld_safe --skip-grant-tables --skip-networking &
$ mysql -uroot
mysql> update user set authentication_string=PASSWORD('anna@20!WtJFKh1gh@I_75') where user='root';
mysql> flush privileges;
mysql> quit;

$ sudo /etc/init.d/mysql start
```


### Calculate the MySQL database size

Sum up the data_length + index_length is equal to the total table size.

	1. data_length – store the real data.
	2. index_length – store the table index.

- Here’s the SQL script to list out the entire databases size

	```sql
	SELECT table_schema "Data Base Name", sum( data_length + index_length) / 1024 / 1024
	"Data Base Size in MB" FROM information_schema.TABLES GROUP BY table_schema ;
	```

- Another SQL script to list out one database size, and each tables size in detail

	```sql
	SELECT table_name, table_rows, data_length, index_length,
	round(((data_length + index_length) / 1024 / 1024),2) "Size in MB"
	FROM information_schema.TABLES where table_schema = "schema_name";
	```
	
### Locate the MySQL stored data
	
```sh
$ cd /var/lib/mysql
$ $ ls -lh
total 1.5G
...
```

## MySQL configuration

```sh

[configuration (in brief)] 
max_connections                 = 350
query_cache_size                = 16K # thinking I can lower this but don't suspect it to be cause
thread_cache_size               = 16
table_cache                     = 1024
sort_buffer_size                = 512M
myisam_sort_buffer_size         = 256M
key_buffer_size                 = 4G
delay_key_write                 = OFF
join_buffer_size                = 128M
net_buffer_length               = 64K

innodb_file_per_table
innodb_buffer_pool_size         = 40G
innodb_additional_mem_pool_size = 20M
innodb_log_file_size            = 256M
innodb_log_buffer_size          = 8M
innodb_lock_wait_timeout        = 50
innodb_data_home_dir            = /var/lib/mysql
innodb_data_file_path           = ibdata1:10M:autoextend    #actual size = 2.3G
innodb_log_group_home_dir       = /var/lib/mysql
innodb_log_files_in_group       = 2

innodb_flush_log_at_trx_commit  = 1
innodb_support_xa               = 1

[System] 
Memory  : 72GB
CPU     : 16 x 2.53GHz
```

ncreasing the innodb_buffer_pool_size > 40G to be unstable on the slaves and results in MySQL server crash

