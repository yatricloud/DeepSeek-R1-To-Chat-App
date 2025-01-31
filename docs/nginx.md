# Nginx Custom Domain Setup Guide

This guide provides step-by-step instructions for setting up Nginx with a custom domain for the Chat Yatri project.

## Prerequisites

1. **Install Nginx**: Install Nginx on your server.
    ```sh
    sudo apt install -y nginx
    ```

2. **Install Certbot**: Install Certbot for SSL certificate management.
    ```sh
    sudo apt install certbot python3-certbot-nginx -y
    ```

## Nginx Configuration

1. **Create Nginx Configuration File**: Create a new Nginx configuration file for your domain.
    ```sh
    sudo nano /etc/nginx/sites-available/chatgpt.yatricloud.com
    ```

2. **Add Configuration**: Add the following configuration to the file.
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

3. **Enable Configuration**: Enable the new configuration by creating a symbolic link.
    ```sh
    sudo ln -s /etc/nginx/sites-available/chatgpt.yatricloud.com /etc/nginx/sites-enabled/
    ```

4. **Obtain SSL Certificate**: Use Certbot to obtain an SSL certificate for your domain.
    ```sh
    sudo certbot --nginx -d chatgpt.yatricloud.com
    ```

5. **Test Nginx Configuration**: Test the Nginx configuration for syntax errors.
    ```sh
    sudo nginx -t
    ```

6. **Restart Nginx**: Restart Nginx to apply the changes.
    ```sh
    sudo systemctl restart nginx
    ```

## Additional Information

For more details on configuring and using Nginx, refer to the official Nginx documentation.
