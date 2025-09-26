IMPORTANT:
- Store SSH passwords securely. The example stores them in plain JSON for simplicity.
  In production, use encrypted secrets or SSH keys.
- On APs, configure sudoers to allow the SSH user to run the specific commands without password:
  e.g. create /etc/sudoers.d/ctrler with:
  youruser ALL=(ALL) NOPASSWD: /bin/systemctl restart hostapd, /bin/systemctl restart dnsmasq, /sbin/reboot
- Test each SSH command manually before using from the controller.
