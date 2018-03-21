---
title: Spark Operations
date: 2017-11-03 18:54:01
tags:
- Spark
- Big data
---

## Download Spark with hadoop

```sh
$ wget http://d3kbcqa49mib13.cloudfront.net/spark-2.2.0-bin-hadoop2.7.tgz
$ tar xvf spark-2.2.0-bin-hadoop2.7.tgz
```
## Spark shell

- Read parquet files

```sh
$ cd spark-2.2.0-bin-hadoop2.7/
$ bin/spark-shell

scala> val df = spark.read.parquet("file:///home/username/spark-warehouse/sample_dataset")
scala> df.show
```

- Run scala script in spark-shell

```sh
bin/spark-shell -i loadalldatasets.scala
```

## Spark cluster

- Run slave and master nodes manually:

```sh
sbin/start-master.sh
sbin/start-slave.sh spark://<MasterIP>:7077
```

<!-- more -->

## spark-submit

```sh
bin/spark-submit --class "spark.computing.SimpleApp" --master spark://<MasterIP>:7077 ~/spark-computing_2.11-1.0.jar
```

## SparkSession exmaple

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder().appName("myApp").config("spark.some.config.option", "some-value").getOrCreate()

// Encoders for most common types are automatically provided by import spark.implicits._

// Read in the parquet file created above
// Parquet files are self-describing so the schema is preserved
// The result of loading a Parquet file is also a DataFrame
val parquetFileDF = spark.read.parquet("spark-warehouse/sample_dataset")
parquetFileDF.show

// Spark also supports pulling data sets into a cluster-wide in-memory cache. 
// Next function will make dataset to be cached.
parquetFileDF.cache

// Parquet files can also be used to create a temporary view and then used in SQL statements
parquetFileDF.createOrReplaceTempView("parquetFile")
val namesDF = spark.sql("SELECT * FROM parquetFile WHERE confidence_level='1.Above 85'")
namesDF.map(attributes => "question: " + attributes(0)).show
```

## Read csv file as DataFrame

### 1 spark-csv

For CSV, there is a separate library: spark-csv

It's CsvContext class provides csvFile method which can be used to load csv.

```scala
val cars = sqlContext.csvFile("cars.csv") // uses 
```
implicit class CsvContext

### 2 Parsing CSV in Spark 2.0 

Spark SQL does have inbuilt CSV parser with Scala 2.11 API powered by databricks. 

```scala
val conf = new SparkConf().setMaster("local[2]").setAppName("my app")
val sc = new SparkContext(conf)
val sparkSession = SparkSession.builder
  .config(conf = conf)
  .appName("spark session example")
  .getOrCreate()
  
val df = sparkSession.read
        .format("org.apache.spark.csv")
        .option("header", "true") //reading the headers
        .option("mode", "DROPMALFORMED")
        .csv("csv/file/path")
        
```
Dependency:

"org.apache.spark" %% "spark-sql_2.11" % 2.0.0,


## SQL operations

```sh

// Check the configure, it also could be checked in http://<MasterIP>:4041/environment/

scala> sc.getConf.getAll

res48: Array[(String, String)] = Array((spark.driver.port,39657), 
(spark.repl.class.outputDir,/tmp/spark-c04b757f-ba28-41ce-aa1a-fb44000d2a3f/repl-ce272ce7-2756-44ab-836c-ed31012eb439), 
(spark.app.name,Spark shell), 
(spark.home,/home/username/spark-2.2.0-bin-hadoop2.7), 
(spark.sql.catalogImplementation,hive), 
(spark.driver.host,<MasterIP>), 
(spark.jars,""), 
(spark.master,local[*]), 
(spark.executor.id,driver), 
(spark.submit.deployMode,client), 
(spark.repl.class.uri,spark://<MasterIP>:39657/classes), 
(spark.app.id,local-1504752595101))

scala> sc.getConf.getExecutorEnv
res52: Seq[(String, String)] = WrappedArray()

scala> sc.getConf.setExecutorEnv("spark.executor.memory", "6g")
res54: org.apache.spark.SparkConf = org.apache.spark.SparkConf@50d5ddf2


// Register the DataFrame as a SQL temporary view
scala> dfhug.createOrReplaceTempView("dhhuge")

scala> :paste

import java.time.{Duration, LocalDate, LocalDateTime, ZoneId}

// Cache nothing
val startTime = LocalDateTime.now
val num = spark.sql("select department, transaction_date, quantity, transaction_date from dhhuge where (((isnotnull(department) and (department = 'grocery')) and isnotnull(transaction_date)) and (transaction_date >= '2012-12-30')) and (transaction_date <= '2016-12-07')").count
println(s"Row num is $num")
val endTime = LocalDateTime.now
val span = Duration.between(startTime, endTime)
println(s"Query time is ${span.toHours}:${span.toMinutes}:${span.toMillis / 1000}:${span.toMillis % 1000}")

// Cache the whole dataset only.
dfhug.cache
val startTime = LocalDateTime.now
val num = spark.sql("select department, transaction_date, quantity, transaction_date from dhhuge where (((isnotnull(department) and (department = 'grocery')) and isnotnull(transaction_date)) and (transaction_date >= '2012-12-30')) and (transaction_date <= '2016-12-07')").cache.count
println(s"Row num is $num")
val endTime = LocalDateTime.now
val span = Duration.between(startTime, endTime)
println(s"Query time is ${span.toHours}:${span.toMinutes}:${span.toMillis / 1000}:${span.toMillis % 1000}")


// Cache middle result
```

## MySQL operations

- Create table

```
CREATE TABLE `sample_dataset` (
  `household_key` VARCHAR(45) NULL,
  `basket_id` VARCHAR(45) NULL,
  `product_id` VARCHAR(45) NULL,
  `transaction_date` TIMESTAMP(6) NULL,
  `department` VARCHAR(45) NULL,
  `brand` VARCHAR(45) NULL,
  `age_desc` VARCHAR(45) NULL,
  `income_desc` VARCHAR(45) NULL,
  `homeowner_desc` VARCHAR(45) NULL,
  `household_size_desc` VARCHAR(45) NULL,
  `price` DOUBLE NULL,
  `discount` DOUBLE NULL,
  `transaction_time` VARCHAR(45) NULL,
  `commodity` VARCHAR(45) NULL,
  `household_type` VARCHAR(45) NULL,
  `household_size` VARCHAR(45) NULL,
  `quantity` INT NULL,
  `sales` DOUBLE NULL)
ENGINE = MyISAM
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
```

- Write dataset into MySQL

```sh
$ wget http://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.38.tar.gz
$ tar -vxf mysql-connector-java-5.1.38.tar.gz
$ sudo cp mysql-connector-java-5.1.38/mysql-connector-java-5.1.38-bin.jar /usr/share/java/
$ cd /usr/share/java/
$ sudo ln -s  mysql-connector-java-5.1.38-bin.jar mysql-connector-java.jar

$ spark-shell --jars /usr/share/java/mysql-connector-java.jar
```

```sh
val prop = new java.util.Properties
prop.setProperty("driver", "com.mysql.jdbc.Driver")
prop.setProperty("user", "username")
prop.setProperty("password", "userpsw") 
 
//jdbc mysql url - destination database is named "data"
val url = "jdbc:mysql://127.0.0.1/testCase?useSSL=false"
 
//destination database table 
val table = "sample_dataset"
 
//write data from spark dataframe to database
dfhug.write.mode("append").jdbc(url, table, prop)

```

## Cloudera Platform

http://<MasterIP>:7180/cmf/login

## AWS EMR

MyLocal

```sh
$ scp .ssh/cubeanAWS.pem hadoop@ec2-52-65-19-56.ap-southeast-2.compute.amazonaws.com:~
$ ssh -i ~/.ssh/cubeanAWS.pem hadoop@ec2-52-65-19-56.ap-southeast-2.compute.amazonaws.com
```
Master with hadoop:

```sh
$ eval "$(ssh-agent -s)" && ssh-add cubeanAWS.pem
```

Get the IPs of the slave nodes:

```sh
$ hdfs dfsadmin -report | grep ^Name | cut -f2 -d: | cut -f2 -d' '

The log files are in /mnt/var/log/hadoop

#Change java version
#$ sudo /usr/sbin/alternatives --config java
#Change to root
#$ sudo -i

////Start master with hadoop user
(Once) $ cat cubeanAWS.pem >> ~/.ssh/authorized_keys
$ eval "$(ssh-agent -s)" && ssh-add cubeanAWS.pem
$ sudo /usr/lib/spark/sbin/start-master.sh

////Start slaves (use same node)
$ sudo ./start-slave.sh <MasterIP>:7077

////Test
$ spark-shell --master spark://<MasterIP>:7077
```

To launch a Spark application in cluster mode:

```sh
$ ./bin/spark-submit --class path.to.your.Class --master yarn --deploy-mode cluster [options] <app jar> [app options]
```

To launch a Spark application in client mode, do the same, but replace cluster with client. The following shows how you can run spark-shellin client mode:

```sh
$ sudo spark-shell --master yarn --deploy-mode cluster
```

The master URL passed to Spark can be in one of the following formats:

Master URL	Meaning

```
local	Run Spark locally with one worker thread (i.e. no parallelism at all).
local[K]	Run Spark locally with K worker threads (ideally, set this to the number of cores on your machine).
local[*]	Run Spark locally with as many worker threads as logical cores on your machine.
spark://HOST:PORT	Connect to the given Spark standalone cluster master. The port must be whichever one your master is configured to use, which is 7077 by default.
mesos://HOST:PORT	Connect to the given Mesos cluster. The port must be whichever one your is configured to use, which is 5050 by default. Or, for a Mesos cluster using ZooKeeper, use mesos://zk://.... To submit with --deploy-mode cluster, the HOST:PORT should be configured to connect to the MesosClusterDispatcher.
yarn	Connect to a YARN cluster in client or cluster mode depending on the value of --deploy-mode. The cluster location will be found based on the HADOOP_CONF_DIR or YARN_CONF_DIR variable.
```

Examples:

```sh
MASTER=yarn-client spark-shell


val file = sc.textFile("s3://support.elasticmapreduce/bigdatademo/sample/wiki")
 
val reducedList = file.map(l => l.split(" ")).map(l => (l(1), l(2).toInt)).reduceByKey(_+_, 3)
 
reducedList.cache
 
val sortedList = reducedList.map(x => (x._2, x._1)).sortByKey(false).take(50)
////////////////////////////////////////////////////////////////////////////////////////////////
MASTER=yarn-client spark-sql --executor-memory 4G

SET spark.sql.shuffle.partitions=10;
create external table wikistat (projectcode string, pagename string, pageviews int, pagesize int) ROW FORMAT DELIMITED FIELDS TERMINATED BY ' ' location 's3://support.elasticmapreduce/bigdatademo/sample/wiki';
CACHE TABLE wikistat;
select pagename, sum(pageviews) c from wikistat group by pagename order by c desc limit 10;


////////////////////////////////////////////////////////////////////////////////////////////////
package org.apache.spark.examples
import scala.math.random
import org.apache.spark._

/** Computes an approximation to pi */
object SparkPi {
  def main(args: Array[String]) {
    val conf = new SparkConf().setAppName("Spark Pi")
    val spark = new SparkContext(conf)
    val slices = if (args.length > 0) args(0).toInt else 2
    val n = math.min(100000L * slices, Int.MaxValue).toInt // avoid overflow
    val count = spark.parallelize(1 until n, slices).map { i =>
      val x = random * 2 - 1
      val y = random * 2 - 1
      if (x*x + y*y < 1) 1 else 0
    }.reduce(_ + _)
    println("Pi is roughly " + 4.0 * count / n)
    spark.stop()
  }
}
```

Name of interface URI

```
YARN ResourceManager
http://master-public-dns-name:8088/

YARN NodeManager
http://slave-public-dns-name:8042/

Hadoop HDFS NameNode
http://master-public-dns-name:50070/

Hadoop HDFS DataNode
http://slave-public-dns-name:50075/

Spark HistoryServer
http://master-public-dns-name:18080/

Zeppelin
http://master-public-dns-name:8890/

Hue
http://master-public-dns-name:8888/

ssh -i ~/.ssh/cubeanAWS.pem -N -L 8888:ec2-52-65-19-56.ap-southeast-2.compute.amazonaws.com:8888 hadoop@ec2-52-65-19-56.ap-southeast-2.compute.amazonaws.com

Ganglia
http://master-public-dns-name/ganglia/

HBase UI
http://master-public-dns-name:16010/
```

#### Parquet files

[How-to: Convert Text to Parquet in Spark to Boost Performance](https://developer.ibm.com/hadoop/2015/12/03/parquet-for-spark-sql/)

[Evolving Parquet as self-describing data format – New paradigms for consumerization of Hadoop data](https://mapr.com/blog/evolving-parquet-self-describing-data-format-new-paradigms-consumerization-hadoop-data/)


## Column Operations

### select multiple columns at once
```scala
val columns = df.columns
val colSelect = Seq("sales", "transaction_date")
val colNames = columns.intersect(colSelect).map(name => col(name))
df.select(colNames:_*).show
```

### extract day part
```scala
df.select("transaction_date").withColumn("year", year(df("transaction_date"))).show
df.select("transaction_date").withColumn("month", month(df("transaction_date"))).show
df.select("transaction_date").withColumn("week", weekofyear(df("transaction_date"))).show
df.select("transaction_date").withColumn("weekday", from_unixtime(unix_timestamp(df("transaction_date"), "yyyy-MM-dd"), "EEEEE")).show
```

*Examples*

```scala
df
.select("transaction_date")
.withColumn("year", year(df("transaction_date")))
.withColumn("month", month(df("transaction_date")))
.withColumn("week", weekofyear(df("transaction_date")))
.withColumn("weekday", from_unixtime(unix_timestamp(df("transaction_date"), "yyyy-MM-dd"), "EEEEE"))
.show

df
.select("transaction_date")
.withColumn("year", year(df("transaction_date")))
.withColumn("weekday", from_unixtime(unix_timestamp(df("transaction_date"), "yyyy-MM-dd"), "EEEEE"))
.select("year", "weekday")
.distinct
.sort("year", "weekday")
.show(100)
```

## Google Cloud

```shell
gcloud config set compute/zone asia-east1-c

gcloud compute copy-files ~/spark-warehouse/* <Spark cluster name>:~/spark-warehouse/
```
