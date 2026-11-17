# Deployment runbook

How the Local Volunteer Platform is deployed by hand to the university EC2 instance, how to redeploy it, and what to check when something goes wrong.

## Target

| Item | Value |
| ---- | ----- |
| Instance | Sath_t3 (`i-0721a02c6362c2253`), t3.medium, ap-southeast-2 |
| OS | Ubuntu, user `ubuntu` |
| Instance profile | IFQ636-EC2-Role |
| Subnet | Public subnet, public IPv4 assigned |
| Key pair | `Sath_Ec2_t3medium` (kept in `~/.ssh`, permissions 600) |
| Inbound rules | SSH 22 and HTTP 80 from approved IPs only. No 0.0.0.0/0, and no rule for port 5001 |

The public IP changes on every stop and start. Use the current one from the EC2 console wherever this runbook says `<IP>`.

## How it fits together

- **nginx** listens on port 80. It serves the React build from `/var/www/lvp` and passes `/api/` to Node on `127.0.0.1:5001`. Config: `deploy/nginx/lvp.conf`, installed as `/etc/nginx/sites-available/lvp`.
- **PM2** runs the API as `lvp-api` from `~/local-volunteer-platform/backend`. `pm2 startup` and `pm2 save` make it start again on boot.
- **MongoDB Atlas** holds the data. The server's `backend/.env` holds the connection string and secrets, and is never committed.
- The frontend calls `/api` on the same host, so nothing needs changing when the IP changes.

## First-time setup

Run from your own machine unless noted.

1. **Connect:**
   ```bash
   ssh -i ~/.ssh/Sath_Ec2_t3medium.pem ubuntu@<IP>
   ```
2. **On the server, check the tools.** Node 22 comes from nvm. Install nginx with `sudo apt install nginx` and PM2 with `npm install -g pm2` if they are missing.
   ```bash
   source ~/.nvm/nvm.sh
   node -v
   which pm2 nginx git
   ```
3. **On the server, clone and build:**
   ```bash
   cd ~
   git clone https://github.com/sathprasad-create/local-volunteer-platform.git
   cd local-volunteer-platform/backend && npm ci --omit=dev
   cd ../frontend && npm ci && npm run build
   sudo mkdir -p /var/www/lvp
   sudo cp -r build/. /var/www/lvp/
   rm -rf node_modules
   ```
   Removing the frontend's `node_modules` after the build frees disk space; only the build is served.
4. **From your machine, copy the secrets file:**
   ```bash
   scp -i ~/.ssh/Sath_Ec2_t3medium.pem backend/.env ubuntu@<IP>:/home/ubuntu/local-volunteer-platform/backend/.env
   ```
   Then on the server: `chmod 600 ~/local-volunteer-platform/backend/.env`
5. **Atlas access list:** the instance's IP changes on restart, so the list allows `0.0.0.0/0` (decision D6). The app's database user is limited to read and write on `lvp`.
6. **On the server, start the API under PM2 and make it start on boot:**
   ```bash
   cd ~/local-volunteer-platform/backend
   pm2 start server.js --name lvp-api --cwd /home/ubuntu/local-volunteer-platform/backend
   sudo env PATH=$PATH:$(dirname $(which node)) $(which pm2) startup systemd -u ubuntu --hp /home/ubuntu
   pm2 save
   ```
7. **On the server, install the nginx site:**
   ```bash
   sudo cp ~/local-volunteer-platform/deploy/nginx/lvp.conf /etc/nginx/sites-available/lvp
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo ln -sf /etc/nginx/sites-available/lvp /etc/nginx/sites-enabled/lvp
   sudo nginx -t && sudo systemctl reload nginx
   ```
8. **Check:** open `http://<IP>/` in a browser and log in. `curl http://<IP>/api/opportunities` should return 401, which shows the API is answering through nginx.

## Redeploy after a merge to main

On the server:
```bash
source ~/.nvm/nvm.sh
cd ~/local-volunteer-platform
git checkout main && git pull
cd backend && npm ci --omit=dev && pm2 restart lvp-api
cd ../frontend && npm ci && npm run build && sudo cp -r build/. /var/www/lvp/ && rm -rf node_modules
```
Skip the frontend lines if only backend files changed, and the backend lines if only frontend files changed.

## Restart behaviour

After the instance is stopped and started:
- It gets a **new public IP**. Read it from the console.
- **PM2** starts `lvp-api` on boot, and **nginx** starts as a system service.
- The app works at `http://<new IP>/` with **no code or configuration change**.

This was tested on 17 Nov 2026: 3.27.71.86 became 3.25.52.164 and the app worked unchanged (SCRUM-78).

## Troubleshooting

| Symptom | Likely cause | Check or fix |
| ------- | ------------ | ------------ |
| SSH times out | Your IP is not in the inbound rules | Add SSH from My IP in the security group |
| Page does not load | Your IP is not allowed on port 80, or nginx is down | Security group; `systemctl status nginx` |
| 502 Bad Gateway | The API is not running | `pm2 ls`, `pm2 logs lvp-api` |
| API crashes on start with a MongoDB error | Atlas is refusing the connection | Atlas access list and the `MONGO_URI` user and password |
| `pm2: command not found` over SSH | nvm is not loaded in a non-login shell | Prefix with `source ~/.nvm/nvm.sh &&` |
| Refreshing a page gives 404 | nginx is not sending routes to index.html | The `try_files $uri /index.html;` line in the site config |
