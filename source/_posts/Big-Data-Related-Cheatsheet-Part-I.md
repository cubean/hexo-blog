---
title: Big Data Related Cheatsheet (Part I)
date: 2017-08-04 12:08:15
categories: Big data
tags:
- Big data
- Parquet file
- Bash
---

# Bash command

## use for loop to increase a dataset size

The bash command to simply increase a dataset size with parquet format.

```sh
$ for i in {10..20}; do cp ./part-r-00000-...snappy.parquet* ./part-r-000$i-...snappy.parquet;done
```

This will increase more repeated parts at the same dataset folder.

## use du to see files greater than a threshold size

You may also want to order by size, to easily find the biggest ones.

```sh
$ sudo du -h --threshold=1G / | sort -n

```
(Works on Ubuntu/Mint and a few other Linux distributions)


<!-- more -->

## Checking running port

```sh
$ sudo netstat -plnt
```