#!/bin/sh
# Runs as nordlys-cms from nordlys-cms-backup.service while the CMS is stopped.
set -eu
root=/var/backups/nordlys-cms
keep=${CMS_BACKUP_KEEP:-14}
dest="$root/$(date -u +%Y%m%dT%H%M%SZ)"
node scripts/backup.mjs "$dest" --stopped
# Keep the newest $keep backups on the VM. Off-VM copies are pulled by scripts/pull-backup.sh.
ls -1d "$root"/2*/ 2>/dev/null | sort | head -n "-$keep" | xargs -r rm -rf --
echo "Backup written to $dest"
