---
title: CarbonData Examples in Spark 2.2 with Yarn
date: 2018-02-27 17:37:59
tags: 
- HDFS
- Big data
- Parquet file
---

Apache CarbonData is an indexed columnar data format for fast analytics on big data platform, e.g. Apache Hadoop, Apache Spark, etc.

I build up several examples combining the offical docs and real productive environment. 

<!-- more -->

## Prepare CarbonData lib

[Installation and building CarbonData](https://github.com/apache/carbondata/tree/master/build)

## Start Spark shell

```sh
# cd git/CarbonData
# /opt/spark/bin/spark-shell --jars carbondata_2.11-1.4.0-SNAPSHOT-shade-hadoop2.7.2.jar --driver-memory 10G --executor-memory 15G --executor-cores 10
```

## Reading CSV file with CarbonSession

[Quick Start and Create CSV files](https://carbondata.apache.org/quick-start-guide.html)

### Create a CarbonSession:

```sh
scala> 
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.CarbonSession._
val carbon = SparkSession.builder().config(sc.getConf).getOrCreateCarbonSession("hdfs://<HDFS IP>:9000/user/cubean/sample", "./carbon.metastore")

```
NOTE: By default metastore location is pointed to ../carbon.metastore, user can provide own metastore location to CarbonSession like SparkSession.builder().config(sc.getConf) .getOrCreateCarbonSession("<hdfs store path>", "<local metastore path>")

### Create table

```sh
scala>carbon.sql("CREATE TABLE IF NOT EXISTS test_table(id string, name string, city string, age Int) STORED BY 'carbondata'")
```

### Loading Data (CSV file) to a Table

```sh
LOAD DATA [LOCAL] INPATH 'folder_path' INTO TABLE [db_name.]table_name OPTIONS(property_name=property_value, ...)
```

```sh
scala> carbon.sql("LOAD DATA INPATH 'hdfs://<HDFS IP>:9000/user/cubean/sample/sample.csv' INTO TABLE test_table")
```

### Query Data from a Table

```sh
scala>carbon.sql("SELECT * FROM test_table").show()

scala>carbon.sql("SELECT city, avg(age), sum(age) FROM test_table GROUP BY city").show()
```

## Traditional Spark Session

### Show schema of sample_table

```sh
scala> val df = spark.read.parquet("hdfs://<HDFS IP>:9000/user/cubean/spark-warehouse/sample_dataset_parquet")

scala> df.printSchema
root
 |-- household_key: string (nullable = true)
 |-- basket_id: string (nullable = true)
 |-- product_id: string (nullable = true)
 |-- transaction_date: date (nullable = true)
 |-- department: string (nullable = true)
 |-- brand: string (nullable = true)
 |-- age_desc: string (nullable = true)
 |-- income_desc: string (nullable = true)
 |-- homeowner_desc: string (nullable = true)
 |-- household_size_desc: string (nullable = true)
 |-- price: double (nullable = true)
 |-- discount: double (nullable = true)
 |-- transaction_time: string (nullable = true)
 |-- commodity: string (nullable = true)
 |-- household_type: string (nullable = true)
 |-- household_size: string (nullable = true)
 |-- quantity: integer (nullable = true)
 |-- sales: double (nullable = true)
```

Ready code for create sample_table table mannually

```sh
// Create table
carbon.sql("CREATE TABLE IF NOT EXISTS sample_table(household_key string, basket_id string, product_id string, transaction_date Date, department string, brand string, age_desc string, income_desc string, homeowner_desc string, household_size_desc string, price double, discount double, transaction_time string, commodity string, household_type string, household_size string, quantity int, sales double) STORED BY 'carbondata'")
```

## Save carbon data file from parquet files

[Example](https://github.com/apache/carbondata/blob/master/examples/spark2/src/main/scala/org/apache/carbondata/examples/CarbonDataFrameExample.scala)

```sh
import java.io.File

import org.apache.spark.sql.{SaveMode, SparkSession}

import org.apache.carbondata.core.constants.CarbonCommonConstants
import org.apache.carbondata.core.util.CarbonProperties

val warehouse = "hdfs://<HDFS IP>:9000/user/cubean/spark-warehouse/sample_dataset_parquet"
val storeLocation = "hdfs://<HDFS IP>:9000/user/cubean/carbondata-warehouse"

CarbonProperties.getInstance().addProperty(CarbonCommonConstants.CARBON_TIMESTAMP_FORMAT, "yyyy/MM/dd")

import org.apache.spark.sql.CarbonSession._

val carbon = SparkSession.builder().config(sc.getConf).config("spark.sql.warehouse.dir", warehouse).getOrCreateCarbonSession(storeLocation, "./carbon.metastore")

carbon.sparkContext.setLogLevel("ERROR")


// Writes Dataframe to CarbonData file:
import spark.implicits._

val df = carbon.read.parquet(warehouse)

// Saves dataframe to carbondata file
df.write.format("carbondata").option("tableName", "sample_table").option("compress", "true").option("tempCSV", "false").mode(SaveMode.Overwrite).save()

// Query in a hot table
carbon.sql(""" SELECT * FROM sample_table """).show()
```

## Query from carbon data files

### Loading cold carbon data into a Table

```sh
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.CarbonSession._

val storeLocation = "hdfs://<HDFS IP>:9000/user/cubean/carbondata-warehouse"

val carbon = SparkSession.builder().config(sc.getConf).getOrCreateCarbonSession(storeLocation, "./carbon.metastore")

// read carbon data by data source API
val cdf = carbon.read.format("carbondata").option("tableName", "sample_table").load(storeLocation)
```


### Query from a Table in carbon session

```sh
carbon.sql(""" SELECT * FROM sample_table """).show()

carbon.sql("SELECT commodity, avg(price) as avg_price, sum(sales) FROM sample_table GROUP BY commodity order by avg_price desc").show()
```