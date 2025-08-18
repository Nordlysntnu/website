set -e
cd /home/nordlys/services/website
git pull
npm run build
sudo systemctl restart website
