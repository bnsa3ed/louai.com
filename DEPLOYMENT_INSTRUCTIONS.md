# Deployment Instructions for bnsaied.com

## ✅ Deployment Status

The website has been successfully deployed to the server at `143.198.86.109`.

**Deployment Location:** `/var/www/bnsaied.com`

**Nginx Configuration:** `/etc/nginx/sites-available/bnsaied.com` (enabled)

---

## 🌐 Domain DNS Configuration Instructions

To link `bnsaied.com` to your website, you need to configure DNS records with your domain registrar. Follow these steps:

### Step 1: Access Your Domain Registrar

Log in to your domain registrar (where you purchased `bnsaied.com`). Common registrars include:
- GoDaddy
- Namecheap
- Cloudflare
- Google Domains
- etc.

### Step 2: Configure DNS Records

Add or update the following DNS records:

#### A Record (IPv4)
- **Type:** A
- **Name/Host:** `@` (or leave blank, or `bnsaied.com`)
- **Value/Points to:** `143.198.86.109`
- **TTL:** 3600 (or default)

#### A Record for WWW (optional but recommended)
- **Type:** A
- **Name/Host:** `www`
- **Value/Points to:** `143.198.86.109`
- **TTL:** 3600 (or default)

#### AAAA Record (IPv6) - Optional
**Note:** IPv6 is completely optional. Your website will work perfectly fine with just IPv4. Only add this if you've enabled IPv6 on your droplet and have an IPv6 address.

If your server supports IPv6, you can also add:
- **Type:** AAAA
- **Name/Host:** `@`
- **Value/Points to:** `[Your IPv6 address]`
- **TTL:** 3600

### Step 3: Wait for DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally. Typically:
- **Minimum:** 5-15 minutes
- **Average:** 1-4 hours
- **Maximum:** 24-48 hours

You can check DNS propagation using:
- https://dnschecker.org
- https://www.whatsmydns.net

### Step 4: Verify DNS is Working

Once DNS has propagated, test with:
```bash
# Check if domain points to correct IP
nslookup bnsaied.com
# or
dig bnsaied.com
```

The result should show: `143.198.86.109`

---

## 🔒 SSL Certificate Setup (After DNS is Configured)

Once your domain is pointing to the server, you can set up SSL/HTTPS:

### Step 1: Install Certbot (if not already installed)
```bash
ssh root@143.198.86.109
apt update
apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain SSL Certificate
```bash
certbot --nginx -d bnsaied.com -d www.bnsaied.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Step 3: Verify SSL Certificate
Certbot will automatically update your nginx configuration. Test it:
```bash
nginx -t
systemctl reload nginx
```

### Step 4: Test HTTPS
Visit `https://bnsaied.com` in your browser to verify SSL is working.

### Step 5: Auto-Renewal (Already Configured)
Certbot sets up automatic renewal. You can test it with:
```bash
certbot renew --dry-run
```

---

## 🔄 Updating the Website

To update the website in the future:

### Option 1: Manual Upload
```bash
# On your local machine
cd /Users/mohamedsaied/Documents/bnsaied.com
tar -czf /tmp/bnsaied-update.tar.gz --exclude='.git' --exclude='node_modules' --exclude='.DS_Store' .
scp /tmp/bnsaied-update.tar.gz root@143.198.86.109:/tmp/

# On the server
ssh root@143.198.86.109
cd /var/www/bnsaied.com
tar -xzf /tmp/bnsaied-update.tar.gz
chown -R www-data:www-data /var/www/bnsaied.com
rm /tmp/bnsaied-update.tar.gz
```

### Option 2: Using Git (if you set up a repository)
```bash
ssh root@143.198.86.109
cd /var/www/bnsaied.com
git pull
chown -R www-data:www-data /var/www/bnsaied.com
```

---

## 📋 Server Information

- **Server IP:** 143.198.86.109
- **Web Server:** Nginx
- **Website Path:** `/var/www/bnsaied.com`
- **Nginx Config:** `/etc/nginx/sites-available/bnsaied.com`
- **User:** www-data

---

## ⚠️ Important Notes

1. **Existing Apps:** The server hosts other applications (ahmadsaadai.com, dalilklibrary.com). The bnsaied.com configuration is separate and won't affect them.

2. **Firewall:** Ensure port 80 (HTTP) and 443 (HTTPS) are open in your server's firewall.

3. **Backup:** Always backup before making changes:
   ```bash
   cp /etc/nginx/sites-available/bnsaied.com /etc/nginx/sites-available/bnsaied.com.backup
   ```

4. **Testing:** Test nginx configuration before reloading:
   ```bash
   nginx -t
   ```

---

## 🐛 Troubleshooting

### Website not loading?
1. Check DNS propagation: `nslookup bnsaied.com`
2. Check nginx status: `systemctl status nginx`
3. Check nginx logs: `tail -f /var/log/nginx/error.log`
4. Verify file permissions: `ls -la /var/www/bnsaied.com`

### SSL certificate issues?
1. Check certificate: `certbot certificates`
2. Test renewal: `certbot renew --dry-run`
3. Check nginx config: `nginx -t`

### Permission issues?
```bash
chown -R www-data:www-data /var/www/bnsaied.com
chmod -R 755 /var/www/bnsaied.com
```

---

## ✅ Next Steps

1. ✅ Website deployed to server
2. ⏳ Configure DNS records (see Step 2 above)
3. ⏳ Wait for DNS propagation
4. ⏳ Set up SSL certificate (see SSL section above)
5. ✅ Website will be live at https://bnsaied.com

---

**Questions or Issues?** Check the troubleshooting section or review nginx logs.

