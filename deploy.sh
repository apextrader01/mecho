#!/bin/bash
set -e

DOMAIN=${1:-"yourapp.in"}

echo "=========================================================="
echo "🚀 Deploying ShortEdge Super-App on Domain: $DOMAIN"
echo "=========================================================="

# 1. Update Submodules / Dependencies
echo "📦 Installing root & service dependencies..."
npm install

echo "📦 Setting up Server & Database..."
cd server
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run build
cd ..

echo "📦 Building User Web App..."
cd client
npm install
npm run build
cd ..

echo "📦 Building Vendor Portal..."
cd vendor
npm install
npm run build
cd ..

echo "📦 Building Admin Panel..."
cd admin
npm install
npm run build
cd ..

# 2. PM2 Process Management
echo "⚡ Starting all 4 services via PM2..."
pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js
pm2 save

# 3. Generate Nginx Virtual Host Configuration
echo "🌐 Writing Nginx configuration for $DOMAIN..."
sudo tee /etc/nginx/sites-available/shortedge > /dev/null <<EOF
# 1. User Web App ($DOMAIN)
server {
    listen 80;
    server_name $DOMAIN staging.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

# 2. Vendor Portal (partner.$DOMAIN)
server {
    listen 80;
    server_name partner.$DOMAIN staging-partner.$DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

# 3. Admin Panel (admin.$DOMAIN)
server {
    listen 80;
    server_name admin.$DOMAIN staging-admin.$DOMAIN;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

# 4. Backend API (api.$DOMAIN)
server {
    listen 80;
    server_name api.$DOMAIN staging-api.$DOMAIN;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Site in Nginx
sudo ln -sf /etc/nginx/sites-available/shortedge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "=========================================================="
echo "✅ Deployment Successful!"
echo "Next step: Run Certbot to activate free SSL for all 4 domains:"
echo "sudo certbot --nginx -d $DOMAIN -d partner.$DOMAIN -d admin.$DOMAIN -d api.$DOMAIN"
echo "=========================================================="
