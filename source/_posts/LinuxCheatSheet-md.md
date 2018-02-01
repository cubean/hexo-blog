---
title: LinuxCheatSheet.md
date: 2017-09-15 23:58:28
tags:
- Linux
---


## How to keep your ssh connection alive

```sh
$ cat /etc/ssh/ssh_config

append :  ServerAliveInterval 30
```