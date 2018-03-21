---
title: Monitor Memory and Disk Metrics for Amazon EC2 Linux Instance
date: 2017-11-02 14:04:36
tags:
- AWS
- DevOps
---

https://tecadmin.net/monitor-memory-disk-metrics-ec2-linux/#

<!-- More -->

```sh
sudo apt-get update
sudo apt-get -y install unzip libwww-perl libdatetime-perl

cd /opt
wget  http://aws-cloudwatch.s3.amazonaws.com/downloads/CloudWatchMonitoringScripts-1.2.1.zip
unzip CloudWatchMonitoringScripts-1.2.1.zip

cd /opt/aws-scripts-mon
cp awscreds.template awscreds.conf

vim awscreds.conf

// Then input your AWS key

// verify the connectivity between script and your AWS account.
./mon-put-instance-data.pl --mem-util --verify --verbose
```

The output will be something like below on successful verification.

```sh
Verification completed successfully. No actual metrics sent to CloudWatch.
```

Add next line in crontab

```sh
*/5 * * * * /opt/aws-scripts-mon/mon-put-instance-data.pl --mem-used-incl-cache-buff --mem-util --disk-space-util --disk-path=/ --from-cron
```

## View Metrics in CloudWatch

- Login AWS Dashboard
- Go to CloudWatch Service
- Click on Browse Metrics button
- Select Linux System under Custom Namespaces.

## Find Utilization Report Command Line

```sh
./mon-get-instance-stats.pl --recent-hours=24
```

