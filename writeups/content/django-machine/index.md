---
title: "DJANGO Machine"
date: 2025-06-08
difficulty: "Medium"
tags: ["Windows", "Web", "Privilege Escalation"]
layout: writeup
description: "Detailed walkthrough of DJANGO machine exploitation featuring XAMPP stack and privilege escalation to SYSTEM"
---

# DJANGO Machine Write-up
**Target IP**: 10.150.150.212

## TL;DR
Successfully compromised a Windows 7 machine running XAMPP, escalated privileges to SYSTEM, and captured multiple flags through FTP enumeration, web application exploitation, and local privilege escalation.

## Machine Overview
| Detail | Value |
|--------|--------|
| Hostname | DJANGO |
| Operating System | Windows 7 Home Basic 7601 Service Pack 1 |
| Domain | PWNTILLDAWN |
| Architecture | x64 |

## Captured Flags
- FLAG11: `7a763d39f68ece1edd1037074ff8d129451af0b1`
- FLAG18: `ad1357d394eba91febe5a6d33dd3ec6dd0abc056`
- FLAG19: `a393b6fb540379e942b0010afa3058985fb8cec3`
- FLAG20: `a9435c140b6667cf2f24fcf6a9a1ea6b8574c3e7`

## Initial Reconnaissance

### Port Scan Results
```
21/tcp    - FTP
80/tcp    - HTTP (Apache 2.4.34)
135/tcp   - MSRPC
139/tcp   - NetBIOS
443/tcp   - HTTPS
445/tcp   - SMB
3306/tcp  - MySQL
8089/tcp  - Splunkd
49152-49158/tcp - MSRPC
```

### Initial Access Vector
1. **Anonymous FTP Access**
   - Anonymous FTP login was enabled
   - Retrieved critical files:
     - xampp-control.log
     - zen.txt
     - Found FLAG19 in /FLAG directory

2. **Web Enumeration**
   - Discovered multiple endpoints:
     - /cgi-bin/printenv.pl
     - /dashboard/phpinfo.php
     - /Webalizer/
     - /xampp/

## Exploitation Path

### 1. Credential Discovery
- Located XAMPP password file reference in xampp-control.log
- Retrieved passwords.txt through FTP
- Successfully accessed phpMyAdmin where FLAG18 was discovered

### 2. Web Application Exploitation
- Leveraged phpMyAdmin access to upload PHP webshell
- Executed commands via webshell: `http://10.150.150.212/shell.php?cmd=`
- Established reverse shell using Metasploit's web_delivery module

### 3. Post Exploitation
1. **Initial Access**
   - Gained meterpreter shell as limited user
   - System Information:
     ```
     OS: Windows 7 (6.1 Build 7601, SP1)
     Architecture: x64
     Domain: PWNTILLDAWN
     ```

2. **Privilege Escalation**
   - Used local exploit suggester to identify vulnerabilities
   - Successfully exploited using windows/local/tokenmagic
   - Elevated to NT AUTHORITY\SYSTEM

3. **Flag Collection**
   - FLAG20 found in C:\xampp
   - FLAG11 located in C:\Users\chuck.norris\Desktop
   
### System Access
Post exploitation revealed the following user accounts:
```
Administrator
chuck.norris
Guest
rambo
```

## Mitigation Recommendations

1. **FTP Security**
   - Disable anonymous FTP access
   - Implement strong authentication
   - Remove sensitive files from FTP root

2. **Web Application Security**
   - Remove unnecessary debug endpoints (phpinfo.php)
   - Implement proper access controls for phpMyAdmin
   - Regular security updates for XAMPP stack

3. **System Hardening**
   - Apply Windows security updates
   - Implement proper file permissions
   - Remove unnecessary services
   - Enable Windows Defender
   - Implement proper password policies

4. **Network Security**
   - Implement proper network segmentation
   - Restrict unnecessary open ports
   - Enable proper logging and monitoring

## Tools Used
- nmap
- Metasploit Framework
- FTP client
- Web browser
- curl

## Timeline
1. Initial Enumeration - Port scanning and service identification
2. FTP Exploitation - Anonymous access and file retrieval
3. Web Application Attack - PHP webshell upload
4. Shell Access - Reverse shell establishment
5. Privilege Escalation - SYSTEM access obtained
6. Post-Exploitation - Flag collection and system enumeration
