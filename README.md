# Chat Yatri | Powered by Yatri Cloud

Chat Yatri is an advanced AI-powered chat interface developed by Yatri Cloud. It provides natural, context-aware conversations with lightning-fast responses and enterprise-grade security.

## Features

- **Natural Conversations**: Engage in fluid, context-aware conversations with advanced AI.
- **Lightning Fast**: Get instant responses powered by cutting-edge technology.
- **Secure & Private**: Your conversations are protected with enterprise-grade security.

## Benefits

- **User-Friendly Interface**: Easy to use and navigate.
- **High Availability**: Always available to assist you.
- **Customizable**: Tailor the chat experience to your needs.

## Setup Instructions

### Prerequisites

1. **Ubuntu**: Ensure your system is up to date and install npm.
    ```sh
    sudo apt update && sudo apt upgrade -y
    sudo apt install npm
    ```

2. **Ollama**: Install Ollama using snap.
    ```sh
    sudo snap install ollama
    ```

3. **Project Directory**: Navigate to the project directory and install dependencies.
    ```sh
    npm install
    node server/index.js
    npm run dev
    ```

### Running the Project

1. **Server**: Ensure the server is running on port 3000.
2. **Frontend**: Ensure the frontend is running on port 5173.
3. **Ollama**: Ensure Ollama is running on port 11434.

### Nginx Custom Domain Setup

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

## Additional Documentation

- [Ubuntu Setup](docs/ubuntu.md)
- [Ollama Setup](docs/ollama.md)
- [Nginx Setup](docs/nginx.md)
- [Connecting DeepSeek Ollama with the UI](docs/connect-ollama-ui.md)
- [Contributing](CONTRIBUTING.md)
  
### **Our Website:** [**Visit us**](https://yatricloud.com)


### **Like, Share & Subscribe Now**

* **Joining takes one minute and is beneficial for your career:** [**Subscribe Now**](https://www.youtube.com/@yatricloud?sub_confirmation=1)

* **Yatri Blog:** [**Read Now**](https://blog.yatricloud.com)
    
* **Let's build a community together:** [**Visit us**](https://linktr.ee/yatricloud)

### **Follow our Creators**

* [**Yatharth Chauhan on LinkedIn**](https://www.linkedin.com/in/yatharth-chauhan/)
    
* [**Nensi Ravaliya on LinkedIn**](https://www.linkedin.com/in/nencyravaliya28/)

### **Join Our Exclusive Community**

* **Telegram Community:** [**Join Now**](https://t.me/yatricloud)
    
* **WhatsApp Community:** [**Join Now**](https://chat.whatsapp.com/IkZeL8QnqzM1Scagxq5whu)

### **Follow us on Social Media**

* **Twitter:** [**Follow Now**](https://x.com/yatricloud)
    
* **Instagram:** [**Follow Now**](https://www.instagram.com/yatricloud)
    
* **WhatsApp Channel:** [**Follow Now**](https://whatsapp.com/channel/0029VakdAHIFHWq60yHA1Q0s)

