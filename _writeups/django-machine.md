---
title: "DJANGO Machine"
date: 2025-06-09 11:46:00
difficulty: "Medium"
tags: ["Windows", "Web", "Privilege Escalation"]
layout: writeup
description: "Detailed walkthrough of DJANGO machine exploitation featuring XAMPP stack and privilege escalation to SYSTEM"
---

# DJANGO Machine Write-up

**Target IP:** 10.150.150.212

## TL;DR
Compromise of a Windows 7 XAMPP machine, privilege escalation to SYSTEM, and flag capture through FTP, web, and local exploitation.

## Machine Overview
| Key | Value |
|-----|-------|
| Hostname | DJANGO |
| OS | Windows 7 SP1 x64 |
| Domain | PWNTILLDAWN |

## Flags
- FLAG11: `7a763d39f68ece1edd1037074ff8d129451af0b1`
- FLAG18: `ad1357d394eba91febe5a6d33dd3ec6dd0abc056`
- FLAG19: `a393b6fb540379e942b0010afa3058985fb8cec3`
- FLAG20: `a9435c140b6667cf2f24fcf6a9a1ea6b8574c3e7`

## Steps
1. **Port Scan:** FTP, HTTP, HTTPS, SMB, MySQL, and others open.
2. **FTP:** Anonymous login, found logs/passwords/flag.
3. **Web Enum:** Found phpMyAdmin, uploaded shell, got reverse shell.
4. **Privilege Escalation:** Used tokenmagic, became SYSTEM.
5. **Collected Flags:** From FTP, user Desktop, XAMPP dir, etc.

## Mitigations
- Disable anonymous FTP.
- Remove sensitive files.
- Harden XAMPP and web admin areas.
- Patch Windows and restrict services.

---

*Written by Kaulik Makwana — Offensive Security Engineer & Penetration Tester*