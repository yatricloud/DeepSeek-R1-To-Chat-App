# Ubuntu Setup Guide

This guide provides step-by-step instructions for setting up the Chat Yatri project on an Ubuntu system.

## Prerequisites

1. **Update and Upgrade System**: Ensure your system is up to date.
    ```sh
    sudo apt update && sudo apt upgrade -y
    ```

2. **Install npm**: Install npm package manager.
    ```sh
    sudo apt install npm
    ```

## Project Setup

1. **Navigate to Project Directory**: Go to the project directory.
    ```sh
    cd /path/to/project
    ```

2. **Install Dependencies**: Install the required dependencies.
    ```sh
    npm install
    ```

3. **Start the Server**: Start the server.
    ```sh
    node server/index.js
    ```

4. **Run the Development Server**: Run the development server.
    ```sh
    npm run dev
    ```

## Ports to Check

- **Server**: Ensure the server is running on port 3000.
- **Frontend**: Ensure the frontend is running on port 5173.
- **Ollama**: Ensure Ollama is running on port 11434.

## Nginx Custom Domain Setup

1. **Install Nginx**:
    ```sh
    sudo apt install -y nginx
    ```

2. **Configure Nginx**:
    ```sh
    sudo nano /etc/nginx/sites-available/chatgpt.yatricloud.com
    ```

3. **Install Certbot**:
    ```sh
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d chatgpt.yatricloud.com
    ```

4. **Nginx Configuration**:
    ```nginx
    server {
        listen 443 ssl;
        server_name chat.yatricloud.com;

        location / {
            proxy_pass http://localhost:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # SSE specific configurations
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
            proxy_buffering off;
            proxy_cache off;
            chunked_transfer_encoding off;
        }

        ssl_certificate /etc/letsencrypt/live/chat.yatricloud.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/chat.yatricloud.com/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    }

    server {
        listen 80;
        server_name chat.yatricloud.com;
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }
    ```

5. **Test Nginx Configuration**:
    ```sh
    sudo nginx -t
    ```

6. **Restart Nginx**:
    ```sh
    sudo systemctl restart nginx
    ```
