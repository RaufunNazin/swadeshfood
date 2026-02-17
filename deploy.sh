#!/bin/bash

# 1. Build Frontend
echo "Building Frontend..."
cd /root/swadeshfood/frontend
npm run build

# 2. Deploy Frontend
echo "Deploying files to Nginx..."
sudo cp -r dist/* /var/www/swadeshfood/
sudo restorecon -Rv /var/www/swadeshfood

# 3. Restart Backend
echo "Restarting Backend Service..."
sudo systemctl restart swadesh.service

echo "Done! Check https://swadeshfood.app"