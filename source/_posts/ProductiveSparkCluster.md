---
title: Productive Spark Cluster in YARN-Client Mode
date: 2018-02-20 12:41:07
tags: 
- Spark
- Hadoop
- Spark Job-server
- Big data
---

## I. Version and Environment

### 1. Spark, Yarn, HDFS

	[Spark and Hadoop Downloads](http://spark.apache.org/downloads.html)
	
	* Current: spark-2.2.0-bin-hadoop2.7.tgz
	* Latest: spark-2.3.0-bin-hadoop2.7.tgz

### 2. Spark Job Server
	
  [spark-jobserver github](https://github.com/spark-jobserver/spark-jobserver)

	### Understand Client and Cluster ModePermalink
	
	Spark jobs can run on YARN in two modes: cluster mode and client mode. Understanding the difference between the two modes is important for choosing an appropriate memory allocation configuration, and to submit jobs as expected.
	
	A Spark job consists of two parts: Spark Executors that run the actual tasks, and a Spark Driver that schedules the Executors.
	
	- Cluster mode: everything runs inside the cluster. You can start a job from your laptop and the job will continue running even if you close your computer. In this mode, the Spark Driver is encapsulated inside the YARN Application Master.
	
	- Client mode: the Spark driver runs on a client, such as your laptop. If the client is shut down, the job fails. Spark Executors still run on the cluster, and to schedule everything, a small YARN Application Master is created.
	
	Client mode is well suited for interactive jobs, but applications will fail if the client stops. For long running jobs, cluster mode is more appropriate.
	
	[Configuring Job Server for YARN in client mode with docker](https://github.com/spark-jobserver/spark-jobserver/blob/master/doc/yarn.md)
fxs-draganddrop	
	[Configuring Job Server for YARN cluster mode](https://github.com/spark-jobserver/spark-jobserver/blob/master/doc/cluster.md)
	
<!-- more -->

### 3. OS in AWS

- OS: RHEL-7.2_HVM-20161025-x86_64-1-Hourly2-GP2 - ami-91cdf0f2
- Disk: 200 GB in root and 1 TB in additional disk /dev/xvdb

*Common Steps*:

- Setup timezone

	```sh
	$ sudo timedatectl set-timezone Australia/Sydney
	```

### Reference Installation

	[Install, Configure, and Run Spark on Top of a Hadoop YARN Cluster](https://linode.com/docs/databases/hadoop/install-configure-run-spark-on-top-of-hadoop-yarn-cluster/)


## II. Building YARN-HDFS cluster servers

Setting up the common environment in both NameNode and DataNodes.

### 1. Mount 2nd EBS disk to HDFS folder

```sh
$ sudo fdisk -l
$ sudo mkfs.ext4 /dev/xvdb
$ sudo mkdir /hadoop
$ sudo vi /etc/fstab
/dev/xvdb      /hadoop         ext4    defaults,nofail 0 2

$ sudo mount -a
$ df -h

$ sudo rm -rf /hadoop/*
$ sudo mkdir -p /hadoop/dfs/data
```

### 2. Install Hadoop

```sh
cd /opt
curl -O http://apache.mirrors.ionfish.org/hadoop/common/hadoop-2.7.5/hadoop-2.7.5.tar.gz

tar xvf hadoop-2.7.5.tar.gz
ln -sfn hadoop-2.7.5 hadoop

// unlink hadoop (will release the symbol link)
```

### 3. bash environment changes

```
# vi ~/.bash_profile ( ~/.bashrc file as well )
	
export JAVA_HOME=/usr/java/default
export HADOOP_HOME=/opt/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export HADOOP_CONF_DIR=$HADOOP_HOME
export HADOOP_PREFIX=$HADOOP_HOME
export HADOOP_LIBEXEC_DIR=$HADOOP_HOME/libexec
export JAVA_LIBRARY_PATH=$HADOOP_HOME/lib/native:$JAVA_LIBRARY_PATH
export HADOOP_CONF_DIR=$HADOOP_PREFIX/etc/hadoop
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
```

### 4. Configuring Hadoop

```sh
cat /opt/hadoop/etc/hadoop/core-site.xml

   <property>
      <name>fs.default.name</name>
      <value>hdfs://<HDFS Namenode IP>:9000</value>
   </property>
   
   <property>
   		<name>hadoop.tmp.dir</name>
       <value>/hadoop/tmp</value>
   </property>

```

```sh
cat /opt/hadoop/etc/hadoop/hdfs-site.xml

   <property>
      <name>dfs.replication</name>
      <value>3</value>
   </property>
   <property>
      <name>dfs.name.dir</name>
      <value>file:///hadoop/dfs/name</value>
   </property>

   <property>
      <name>dfs.data.dir</name>
      <value>file:///hadoop/dfs/data</value>
   </property>
```

```sh
cat /opt/hadoop/etc/hadoop/mapred-site.xml
   <property>
      <name>mapreduce.framework.name</name>
      <value>yarn</value>
   </property>
```

```sh
cat /opt/hadoop/etc/hadoop/yarn-site.xml
   <property>
      <name>yarn.nodemanager.aux-services</name>
      <value>mapreduce_shuffle</value>
   </property>

<property>
    <name>yarn.resourcemanager.hostname</name>
    <value>NameNodeIP</value>
</property>
```

```sh
vi /opt/hadoop/etc/hadoop/slaves
```

> Reference settings

hadoop.tmp.dir (A base for other temporary directories) is property, that need to be set in core-site.xml, it is like export in linux

Ex:

```
<name>dfs.namenode.name.dir</name>
<value>file://${hadoop.tmp.dir}/dfs/name</value>
```

You can use reference of hadoop.tmp.dir in hdfs-site.xml like above

For more core-site.xml and hdfs-site.xml

There're three HDFS properties which contain hadoop.tmp.dir in their values

- dfs.name.dir: directory where namenode stores its metadata, with default value ${hadoop.tmp.dir}/dfs/name.

- dfs.data.dir: directory where HDFS data blocks are stored, with default value ${hadoop.tmp.dir}/dfs/data.

- fs.checkpoint.dir: directory where secondary namenode store its checkpoints, default value is ${hadoop.tmp.dir}/dfs/namesecondary


### 5. Running Hadoop-YARN

In namenode server

```sh
# Format NameNode
/opt/hadoop/bin/hadoop namenode -format
```

```sh
/opt/hadoop/sbin/start-dfs.sh
```

```
/opt/hadoop/sbin/start-yarn.sh
```

To check if hadoop dfs is up and running go to http://<NameNode IP>:50070/dfshealth.html


## III. Building Spark cluster servers

### 1. In all nodes, need to add domain names in /etc/hosts

### 2. Setup master node

On master server:

- Install Spark

```sh

cd /opt
curl -O http://d3kbcqa49mib13.cloudfront.net/spark-2.2.0-bin-hadoop2.7.tgz
tar xvf spark-2.2.0-bin-hadoop2.7.tgz
ln -sfn spark-2.2.0-bin-hadoop2.7 spark
```

- change spark-defaults.conf

```sh
$ cp /opt/spark/conf/spark-defaults.conf.template /opt/spark/conf/spark-defaults.conf
$ vim /opt/spark/conf/spark-defaults.conf 
 spark.master                     spark://<Master IP>:7077
 spark.eventLog.enabled           true
```

- Setup slave nodes

```sh
vim /opt/spark/conf/slaves

# A Spark Worker will be started on each of the machines listed below.
<Slave IPs>
```

- Copy all to slave nodes

```sh
scp -r /opt/hadoop /opt/spark <Slave IP>:/opt/
```

### 3. Start Spark cluster

```sh
/opt/spark/sbin/start-all.sh
```

To check if Spark Cluster is up and running http://<Master IP>:8080/


## IV. Install Docker

### 1. Mount 2nd EBS disk to docker folder:

```sh
$ sudo fdisk -l
$ sudo mkfs.ext4 /dev/xvdb
$ sudo mkdir -p /var/lib/docker
$ sudo vi /etc/fstab
/dev/xvdb      /var/lib/docker         ext4    defaults,nofail 0 2

$ sudo mount -a
$ df -h

$ sudo rm -rf /var/lib/docker/*

```

### 2. Install Docker community version

Then install docker-ce, docker-py(required by docker login)

In AWS linux (RHEL):

```sh
sudo yum install docker
sudo service docker start
sudo service docker status

sudo usermode -aG docker ec2-user

cd spark-jobserver
sbt docker
```

### 3. [Optional] Install Ansible

```sh
$ curl -O https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
$ sudo yum -y localinstall epel-release-latest-7.noarch.rpm
$ sudo yum -y install python-pip
$ sudo pip install --upgrade pip

$ sudo pip install ansible

$ sudo pip install datadog
$ sudo yum -y install git
```

## V. Run spark-job-server

### 1. Spark job-server docker config

spark-jobserver/job-server/config/docker.conf

Default, using spark local mode.
In prod, we are using yarn-client mode. Give parameters thought job-server interface.

```sh

# Template for Spark Job Server Docker config
# You can easily override the spark master through SPARK_MASTER env variable
#
# Spark Cluster / Job Server configuration
spark {
  # spark.master will be passed to each job's JobContext
  # local[...], yarn, mesos://... or spark://...
  master = "local[*]"
  master = ${?SPARK_MASTER}

  # client or cluster deployment
  submit.deployMode = "client"

  # Default # of CPUs for jobs to use for Spark standalone cluster
  job-number-cpus = 8

  jobserver {
    port = 8090
    jobdao = spark.jobserver.io.JobSqlDAO

    context-per-jvm = false

    // for client calling timeout. Cubean added at Sat 28 Oct 2017
    short-timeout = 600s

    # Default client mode will start up a new JobManager int local machine
    # You can use mesos-cluster mode with REMOTE_JOBSERVER_DIR and MESOS_SPARK_DISPATCHER
    # environment value set in xxxx.sh file to launch JobManager in remote node
    # Mesos will take responsibility to offer resource to the JobManager process
    driver-mode = client

    sqldao {
      # Directory where default H2 driver stores its data. Only needed for H2.
      rootdir = /database

      # Full JDBC URL / init string.  Sorry, needs to match above.
      # Substitutions may be used to launch job-server, but leave it out here in the default or tests won't pass
      jdbc.url = "jdbc:h2:file:/database/h2-db"
    }
  }

  # predefined Spark contexts
  # contexts {
  #   my-low-latency-context {
  #     num-cpu-cores = 1           # Number of cores to allocate.  Required.
  #     memory-per-node = 512m         # Executor memory per node, -Xmx style eg 512m, 1G, etc.
  #   }
  #   # define additional contexts here
  # }

  # universal context configuration.  These settings can be overridden, see README.md
  context-settings {
    num-cpu-cores = 15           # Number of cores to allocate.  Required.
    memory-per-node = 40G         # Executor memory per node, -Xmx style eg 512m, #1G, etc.

    spark.ui.enabled = true
    spark.ui.port = 4040

    #spark.yarn.preserve.staging.files = true
    #spark.serializer = org.apache.spark.serializer.KryoSerializer
    #spark.sql.parquet.output.committer.class = org.apache.spark.sql.parquet.DirectParquetOutputCommitter
    #spark.sql.parquet.compression.codec = snappy
    #spark.scheduler.mode = FAIR

    #spark.driver.extraClassPath = "/etc/hadoop/conf:/etc/hive/conf:/usr/lib/hadoop/*:/usr/lib/hadoop-hdfs/*:/usr/lib/hadoop-yarn/*:/usr/lib/hadoop-lzo/lib/*:/usr/share/aws/aws-java-sdk/*:/usr/share/aws/emr/emrfs/conf:/usr/share/aws/emr/emrfs/lib/*:/usr/share/aws/emr/emrfs/auxlib/*"
    #spark.driver.extraLibraryPath = "/usr/lib/hadoop/lib/native:/usr/lib/hadoop-lzo/lib/native"
    #spark.executor.extraClassPath = "/etc/hadoop/conf:/etc/hive/conf:/usr/lib/hadoop/*:/usr/lib/hadoop-hdfs/*:/usr/lib/hadoop-yarn/*:/usr/lib/hadoop-lzo/lib/*:/usr/share/aws/aws-java-sdk/*:/usr/share/aws/emr/emrfs/conf:/usr/share/aws/emr/emrfs/lib/*:/usr/share/aws/emr/emrfs/auxlib/*"
    #spark.executor.extraLibraryPath = "/usr/lib/hadoop/lib/native:/usr/lib/hadoop-lzo/lib/native"

    # spark.eventLog.enabled = true
    # spark.eventLog.dir = "hdfs://<interal ip>:9000/tmp/spark-events"

    # It is still possible to construct the UI of an application through Spark’s history server,
    # provided that the application’s event logs exist.
    # You can start the history server by executing:
    # ./sbin/start-history-server.sh

    # spark.history.fs.logDirectory = "hdfs://<interal ip>:9000/tmp/spark-events"
    # spark.yarn.historyServer.address = "<interal ip>:18080"
    # spark.history.ui.port = 18080 #default 18080
    # spark.history.fs.cleaner.enabled    = true # default is false
    # spark.history.fs.cleaner.interval    1d
    # spark.history.fs.cleaner.maxAge    7d
    # spark.history.fs.numReplayThreads    # Default = 25% of available cores

    # spark.shuffle.service.enabled = true

    spark.driver.extraJavaOptions = "-Duser.timezone=Australia/Sydney -Dlog4j.configuration=log4j2.xml"

    spark.executor.extraJavaOptions = "-Duser.timezone=Australia/Sydney -Dlog4j.configuration=log4j2.xml"

    #spark.dynamicAllocation.enabled = true
    #spark.default.parallelism = 200
    #passthrough {
      #spark.sql.parquet.output.committer.class = org.apache.spark.sql.parquet.DirectParquetOutputCommitter
      #mapreduce.fileoutputcommitter.marksuccessfuljobs = false
    #}

    spark.driver.port=6000
    spark.blockManager.port=6100
    spark.port.maxRetries=16 #default 16

    # in case spark distribution should be accessed from HDFS (as opposed to being installed on every mesos slave)
    # spark.executor.uri = "hdfs://namenode:8020/apps/spark/spark.tgz"

    # uris of jars to be loaded into the classpath for this context. Uris is a string list, or a string separated by commas ','
    # dependent-jar-uris = ["file:///some/path/present/in/each/mesos/slave/somepackage.jar"]

    # If you wish to pass any settings directly to the sparkConf as-is, add them here in passthrough,
    # such as hadoop connection settings that don't use the "spark." prefix
    passthrough {
      #es.nodes = "192.1.1.1"
    }
  }

  # This needs to match SPARK_HOME for cluster SparkContexts to be created successfully
  home = "/spark"
}

deploy {
  manager-start-cmd = "app/manager_start.sh"
}

spray.can.server {
  # uncomment the next lines for making this an HTTPS example
  # Converting PEM-format keys to JKS format:
  # https://docs.oracle.com/cd/E35976_01/server.740/es_admin/src/tadm_ssl_convert_pem_to_jks.html
  # ssl-encryption = on
  # path to keystore
  # keystore = "/some/path/sjs.jks"
  # keystorePW = "changeit"

  # see http://docs.oracle.com/javase/7/docs/technotes/guides/security/StandardNames.html#SSLContext for more examples
  # typical are either SSL or TLS
  encryptionType = "SSL"
  keystoreType = "JKS"
  # key manager factory provider
  provider = "SunX509"
  # ssl engine provider protocols
  enabledProtocols = ["SSLv3", "TLSv1"]

  idle-timeout = 600 s # default is 60s
  request-timeout = 300 s # default is 40s

  pipelining-limit = 2 # for maximum performance (prevents StopReading / ResumeReading messages to the IOBridge)
  # Needed for HTTP/1.0 requests with missing Host headers
  default-host-header = "spray.io:8765"

  # Increase this in order to upload bigger job jars
  parsing.max-content-length = 2g
}

# Note that you can use this file to define settings not only for job server,
# but for your Spark jobs as well.  Spark job configuration merges with this configuration file as defaults.
```

### 2. Spark local-standalone mode

```sh
sudo docker run -d -p 8090:8090 -p 6000-6015:6000-6015 -p 6100-6115:6100-6115 <ORG>/spark-jobserver

// curl -X DELETE "127.0.0.1:8090/contexts/test-context"

curl -X POST "127.0.0.1:8090/contexts/test-context"

curl -X GET "127.0.0.1:8090/contexts"

// Get a jar package for testing

// Upload a test jar
curl --data-binary @job-server-tests_2.11-0.8.1.jar 127.0.0.1:8090/jars/test

// Using sync and get result immediately
curl -d "input.string = a b c a b see" "<Master IP>:8090/jobs?appName=test&classPath=spark.jobserver.WordCountExample&context=test-context&sync=true"

curl -d "sql = \"select * from addresses limit 10\"" '<Master IP>:8090/jobs?appName=test&classPath=spark.jobserver.SqlTestJob&context=test-context&sync=true'

```
### 3. Spark standalone mode

- Start Spark job-server docker

```sh
sudo docker run -d -p 8090:8090 -p 4040-4055:4040-4055 -p 6000-6015:6000-6015 -p 6100-6115:6100-6115 -e SPARK_MASTER=spark://<Master IP>:7077 <ORG>/spark-jobserver

// Get docker ip address
sudo docker inspect 1afe8695c688 // (jobserver container id 172.17.0.2)

```

- Running Spark-SQL Query 

```sh
curl -i -d "" 'localhost:8090/contexts/test-context?spark.scheduler.mode=FAIR&spark.driver.host=<Master IP>&spark.driver.bindAddress=172.17.0.2&spark.driver.port=6000&spark.blockManager.port=6100&spark.ui.port=4050&spark.sql.crossJoin.enabled=true&num-cpu-cores=45&memory-per-node=60G'

curl -X GET "127.0.0.1:8090/contexts"

// curl -X DELETE "127.0.0.1:8090/contexts/test-context"

// Download job-server-tests_2.11/0.8.1/job-server-tests_2.11-0.8.1.jar

// Upload a test jar
curl --data-binary @job-server-tests_2.11-0.8.1.jar 127.0.0.1:8090/jars/test

// Using sync and get result immediately
curl -d "input.string = a b c a b see" "<Master IP>:8090/jobs?appName=test&classPath=spark.jobserver.WordCountExample&context=test-context&sync=true"

```

- Running Spark-SQL Query which enables Spark-SQL and Hive support

```sh

// Create a SparkSession context which enables Spark-SQL and Hive support
curl -i -d "" 'http://localhost:8090/contexts/sql-context?spark.scheduler.mode=FAIR&spark.driver.host=<Master IP>&spark.driver.bindAddress=172.17.0.2&spark.driver.port=6000&spark.blockManager.port=6100&spark.ui.port=4050&spark.sql.crossJoin.enabled=true&num-cpu-cores=45&memory-per-node=60G&context-factory=spark.jobserver.context.SessionContextFactory'

curl -d "sql = \"select * from addresses limit 10\"" '<Master IP>:8090/jobs?appName=test&classPath=spark.jobserver.SqlTestJob&context=sql-context&sync=true'

```
### Additional parameters - https://spark.apache.org/docs/latest/job-scheduling.html

- Setting Fair mode with pools’ properties

```sh
// Assuming sc is your SparkContext variable
sc.setLocalProperty("spark.scheduler.pool", "production")

spark.scheduler.pool = "production"
spark.scheduler.allocation.file = "$SPARK_HOME_PATH/conf/fairscheduler.xml"

<?xml version="1.0"?>
<allocations>
  <pool name="production">
    <schedulingMode>FAIR</schedulingMode>
    <weight>1</weight>
    <minShare>2</minShare>
  </pool>
  <pool name="test">
    <schedulingMode>FIFO</schedulingMode>
    <weight>2</weight>
    <minShare>3</minShare>
  </pool>
</allocations>
```

- max-jobs-per-context

```sh
// The default is 8 which probably translates to about 6 concurrent jobs.
spark.jobserver.max-jobs-per-context=10
```


## VI. Network Configuration

If we need to deploy the bigdata platform to a network stricted environment.

[Network configuration for Spark](https://www.ibm.com/support/knowledgecenter/en/SSCTFE_1.1.0/com.ibm.azk.v1r1.azka100/topics/azkic_t_confignetwork.htm)

![alt text](https://www.ibm.com/support/knowledgecenter/SSCTFE_1.1.0/com.ibm.azk.v1r1.azka100/images/spark-ports.gif)

### Exposed ports

- Application ports: 
	* 443 (HTTPS)
	* 22 (SSH)
	* 3306 (MySQL)

- Spark ports: [Configuration](https://spark.apache.org/docs/latest/configuration.html)
	* 4040-4055 (spark.ui.port)
	* 7077 (SPARK_MASTER_PORT)
	* 8080(spark.master.ui.port) 
	* 8081 (spark.worker.ui.port)
	* 18080(spark.history.ui.port) 
	* 6000-6015(spark.driver.port) 
	* 6100-6115(spark.blockManager.port / [spark.blockManager.port (no need)])

- Spark Job-server: [spark-jobserver github](https://github.com/spark-jobserver/spark-jobserver)
	* 8090 (job-server UI) 
 
- Hadoop: [hdfs-default.xml](https://hadoop.apache.org/docs/r2.7.5/hadoop-project-dist/hadoop-hdfs/hdfs-default.xml)
	* 50010 dfs.datanode.address
	* 50020 dfs.datanode.ipc.address
	* 50070 dfs.namenode.http-address
	* 50075 dfs.datanode.http.address

	* 50470 dfs.namenode.https-address
	* 50475 dfs.datanode.https.address
	
	* 50090 dfs.namenode.secondary.http-address
	* 50091 dfs.namenode.secondary.https-address
	* 50100 dfs.namenode.backup.address
	* 50105 dfs.namenode.backup.http-address
	* 9000 fs.default.name for hdfs file system in /opt/hadoop/etc/hadoop/core-site.xml
	* 8020 could be used as fs.default.name

- Mapred ports: [mapred-default.xml](https://hadoop.apache.org/docs/r2.7.5/hadoop-mapreduce-client/hadoop-mapreduce-client-core/mapred-default.xml)
	* 10020 mapreduce.jobhistory.address
	* 19888 mapreduce.jobhistory.webapp.address
	* 10033 mapreduce.jobhistory.admin.address
	
	* 50030 mapreduce.jobtracker.http.address
	* 50060 mapreduce.tasktracker.http.address

- Yarn ports: [yarn-default.xml](https://hadoop.apache.org/docs/r2.7.5/hadoop-yarn/hadoop-yarn-common/yarn-default.xml)
	* 8030 yarn.resourcemanager.scheduler.address
	* 8031 yarn.resourcemanager.resource-tracker.address
	* 8032 yarn.resourcemanager.address
	* 8033 yarn.resourcemanager.admin.address
	* 8040 yarn.nodemanager.localizer.address
	* 8042 yarn.nodemanager.webapp.address
	* 8088 yarn.resourcemanager.webapp.address
	* 8090 yarn.resourcemanager.webapp.https.address

- Other ports: 
	* 49707 (tcp/udp)
	* 2122 (tcp/udp)


### Add all nodes domain names to /etc/hosts

### Checking LISTEN ports

```sh
$ netstat -aunpt | grep java

tcp        0      0 0.0.0.0:50010           0.0.0.0:*               LISTEN      9773/java
tcp        0      0 0.0.0.0:50075           0.0.0.0:*               LISTEN      9773/java
tcp        0      0 127.0.0.1:40893         0.0.0.0:*               LISTEN      9773/java
tcp        0      0 0.0.0.0:50020           0.0.0.0:*               LISTEN      9773/java
tcp        0      0 <localIP>:<randomPort>  <namenodePort>:9000     ESTABLISHED 9773/java

$ ps aux | grep 9773
<username>+   9773  0.0  0.5 2913968 382280 ?      Sl   Feb07  37:52 /usr/java/default/bin/java -Dproc_datanode -Xmx1000m -Djava.net.preferIPv4Stack=true -...Dhadoop.security.logger=ERROR,RFAS -Dhadoop.security.logger=ERROR,RFAS -Dhadoop.security.logger=ERROR,RFAS -Dhadoop.security.logger=INFO,RFAS org.apache.hadoop.hdfs.server.datanode.DataNode
<username>+  72466  0.0  0.0 112652   972 pts/0    S+   15:58   0:00 grep --color=auto 9773

```
