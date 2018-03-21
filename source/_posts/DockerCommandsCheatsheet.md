---
title: Docker Commands Cheatsheet
date: 2018-03-21 13:48:05
tags:
- Docker
- DevOps
---

## Install Docker

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


## Docker commands

### basic operations

```sh

// Show running container
// docker container ls
docker ps

// Show the log of some container
docker logs --tail 200 -f annadocker_redis_1
// docker logs -f 50bb80ac53ec

// ssh into a docker container
sudo docker exec -it annadocker_redis_1

// Run a command inner docker container
sudo docker exec -it annadocker_redis_1 redis-cli FLUSHALL

// Stop a container
docker stop 50bb80ac53ec


// List all docker images
docker images

// Remove all images with tag = <none>
docker rmi $(docker images -f "dangling=true" -q)

// List all exited containers
docker ps -aq -f status=exited

// Remove stopped containers
docker ps -aq --no-trunc | xargs docker rm

// Remove containers created before a specific container
docker ps --before a1bz3768ez7g -q | xargs docker rm

```
<!-- more -->

### Update docker volumn

```sh
sudo rm -rf  /var/lib/docker/volumes/spark-warehouse/_data/<dataset_name>
sudo cp -r ~/spark-warehouse/<dataset_name> /var/lib/docker/volumes/spark-warehouse/_data/
```

### Build Docker image from Dockerfile

```sh
docker build -t dockerRepo/docker-base:sbt-0.13.15-scala-2.11.11-openjdk-8u151 .
docker images
docker ps
docker run -it -d --name mydocker  dockerRepo/docker-base:cubean-docker bash

// ssh into docker
docker exec -it 612341ad46a1 bash

docker login
docker push dockerRepo/docker-base:sbt-0.13.15-scala-2.11.11-openjdk-8u151
```

### Docker image save and copy

You will need to save the docker image as a tar file:

```sh
docker save -o <save image to path> <image name>

// example:
docker save -o docker_imges/spark-job-server.tar velvia/spark-jobserver:0.8.0-SNAPSHOT.mesos-1.0.0.spark-2.2.0.scala-2.11.jdk-8-jdk
```

Then copy your image to a new system with regular file transfer tools such as cp or scp. After that you will have to load the image into docker:

```sh
docker load -i <path to image tar file>
```

PS: You may need to sudo all commands.

### Docker network

- build bridge

```sh
docker network inspect bridge

docker network create --driver=bridge -o "com.docker.network.bridge.host_binding_ipv4"="172.31.16.240" -o "com.docker.network.bridge.default_bridge"="true" -o "com.docker.network.bridge.enable_icc"="true" docker_gwbridge

docker network rm docker_gwbridge

docker run --network=docker_gwbridge -d -p 8090:8090 -p 6000-6015:6000-6015 -e SPARK_MASTER=spark://172.31.21.233:7077 velvia/spark-jobserver:0.8.0-SNAPSHOT.mesos-1.0.0.spark-2.2.0.scala-2.11.jdk-8-jdk
```
