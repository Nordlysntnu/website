#!/usr/bin/env bash
# Copies the newest CMS backup from the VM to this computer, encrypted with a passphrase you choose.
# Run in Git Bash with the Nordlys SSH key loaded:  bash cms/scripts/pull-backup.sh [target-folder]
# Restore: see cms/docs/production.md ("Off-VM copies").
set -euo pipefail
host=${NORDLYS_VM:-ubuntu@nordlysntnu.no}
out=${1:-$HOME/NordlysBackups/cms}
keep=${NORDLYS_LOCAL_KEEP:-30}
if [ -z "${SSH_AUTH_SOCK:-}" ] && [ -S "$HOME/.ssh/nordlys-agent.sock" ]; then export SSH_AUTH_SOCK="$HOME/.ssh/nordlys-agent.sock"; fi
mkdir -p "$out"; chmod 700 "$out"
latest=$(ssh -o BatchMode=yes "$host" 'sudo ls -1 /var/backups/nordlys-cms | grep "^2" | sort | tail -n 1')
[ -n "$latest" ] || { echo "No backups found on the VM yet." >&2; exit 1; }
file="$out/nordlys-cms-$latest.tar.gz.enc"
if [ -e "$file" ]; then echo "Already have $file"; exit 0; fi
if [ -z "${NORDLYS_BACKUP_PASSPHRASE:-}" ]; then
  read -rsp "Backup passphrase (keep it in your password manager): " NORDLYS_BACKUP_PASSPHRASE; echo
fi
export NORDLYS_BACKUP_PASSPHRASE
ssh -o BatchMode=yes "$host" "sudo tar -C /var/backups/nordlys-cms -czf - '$latest'" \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt -pass env:NORDLYS_BACKUP_PASSPHRASE -out "$file.part"
# Prove the copy decrypts and is a complete archive before keeping it.
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -pass env:NORDLYS_BACKUP_PASSPHRASE -in "$file.part" | tar -tzf - | grep -q 'manifest.json'
mv "$file.part" "$file"
ls -1 "$out"/nordlys-cms-*.tar.gz.enc | sort | head -n "-$keep" | xargs -r rm -f --
echo "Saved $file"
