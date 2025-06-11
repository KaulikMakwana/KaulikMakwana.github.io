---
layout: writeup
title: "Vega Machine Writeup"
date: 2025-06-10
platform: PwnTillDawn
---

# Vega Machine Writeup

## Machine Overview
- **IP Address**: 10.150.150.222
- **Difficulty**: Medium
- **Flags Found**: 3 (FLAG40, FLAG41, FLAG42)

## Initial Enumeration

### Port Scanning

Initial port scan using Nmap revealed several open ports:

```bash
$ nmap --min-rate 10000 -p- 10.150.150.212
```

Key ports discovered:
- 22/tcp: SSH (OpenSSH 7.6p1)
- 80/tcp: HTTP (Apache 2.4.29)
- 8089/tcp: Splunkd httpd
- 10000/tcp: Webmin (MiniServ 1.941)

Detailed scan performed for better service enumeration:
```bash
$ sudo nmap -sSV -sC -A -T4 -v 10.150.150.222 -oA SCAN
```

### Web Enumeration

Directory enumeration was performed using dirsearch:
```bash
$ dirsearch -u http://10.150.150.222/ -t 10 -i 200
```

Notable findings:
- `/.bash_history` file exposed
- `/admin` - Magneto admin panel
- `/soap/` directory
- Various GraphQL endpoints

HTTP enumeration using Nmap scripts:
```bash
$ sudo nmap -sT -p80 -sV --script=http-enum  --script-args='basepath=/' -v 10.150.150.222
```

## Initial Access

### Credential Discovery
--> Examining the exposed `.bash_history` file revealed database credentials:
```bash
$ mysql -u vega --password=puplfiction1994
```

### SSH Access
The discovered credentials (with slight modification) allowed SSH access:
- Username: vega
- Password: pulpfiction1994 (note: changed from puplfiction1994)

--> This access provided FLAG41.

## Privilege Escalation

### Sudo Rights
Checking sudo privileges revealed full sudo access:
```bash
$ sudo -l
  User vega may run the following commands on vega:
     (ALL : ALL) ALL
```

### Root Access
Obtained root access using:
```bash
$ sudo su
```
Root access allowed retrieval of FLAG42 from `/root/FLAG42.txt`

## Flags Found

1. FLAG40: `3e11129fe2d30563999cd1d5602a1f7eb90e2176`
2. FLAG41: `91061fbccf2238f04fff4d0553732616b98bcd54`
3. FLAG42: `95beef4e71ae3a503282ac54acb6d9cdc547f8c8`

## Key Takeaways

1. Exposed `.bash_history` file led to initial access - highlighting the importance of cleaning up sensitive files
2. Simple password pattern modification was needed (puplfiction -> pulpfiction)
3. Full sudo access made privilege escalation straightforward
4. Multiple services running including Webmin and Splunk could have provided alternative attack paths

## Remediation Steps

1. Remove or secure `.bash_history` file
2. Implement proper file permissions
3. Restrict sudo access to only necessary commands
4. Implement proper password policies
5. Consider removing unnecessary services (Webmin, Splunk) if not required
