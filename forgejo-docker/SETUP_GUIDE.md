# FORGEJO SETUP GUIDE

## ✅ Current Status

**Forgejo Container:** Running
**URL:** http://localhost:3333
**SSH Port:** 2222
**Database:** PostgreSQL (forgejo-db)

---

## ⚠️ Manual Setup Required

Forgejo is running but needs initial setup through web UI.

---

## 📝 Setup Steps

### 1. Open Forgejo in Browser

```
http://localhost:3333
```

### 2. Initial Configuration

You should see either:
- **Installation page** (first time setup)
- **Login page** (if already configured)

#### If Installation Page:

**Database Settings:**
- Database Type: PostgreSQL
- Host: db:5432
- User: postgres
- Password: postgres
- Database Name: forgejo

**General Settings:**
- Forgejo Base URL: http://localhost:3333/
- Forgejo SSH Port: 2222
- Forgejo HTTP Port: 3000
- Server Domain: localhost

**Admin Account:**
- Username: admin
- Password: [choose strong password]
- Email: admin@localhost

Click "Install Forgejo"

#### If Login Page:

Login with credentials you created during installation.

---

### 3. Create Repository for apistreamhub-fastapi

**After login:**

1. Click **"+"** button (top right)
2. Select **"New Repository"**
3. Fill in:
   - **Repository name:** `apistreamhub-fastapi`
   - **Description:** `FastAPI + PostgreSQL PoC for StreamHub API`
   - **Visibility:** Private (or Public)
   - **Initialize:** Uncheck all options
4. Click **"Create Repository"**

---

### 4. Push Existing Project to Forgejo

**From terminal:**

```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Add Forgejo remote
git remote add forgejo http://localhost:3333/admin/apistreamhub-fastapi.git

# Push to Forgejo
git push forgejo master

# View result
open http://localhost:3333/admin/apistreamhub-fastapi
```

**Or push to all remotes:**

```bash
# Push to both GitHub and Forgejo
git push origin master
git push forgejo master
```

---

## 🔄 Setup Git for Both Remotes

### View Current Remotes
```bash
git remote -v
```

**Expected output:**
```
origin  https://github.com/masbr0d1n/apistreamhub-fastapi.git (fetch)
origin  https://github.com/masbr0d1n/apistreamhub-fastapi.git (push)
forgejo http://localhost:3333/admin/apistreamhub-fastapi.git (fetch)
forgejo http://localhost:3333/admin/apistreamhub-fastapi.git (push)
```

### Add Forgejo Remote (if not exists)
```bash
git remote add forgejo http://localhost:3333/admin/apistreamhub-fastapi.git
```

### Push to Both Remotes
```bash
# Push current branch
git push origin master
git push forgejo master

# Push all branches
git push --all origin
git push --all forgejo

# Push tags
git push --tags origin
git push --tags forgejo
```

---

## 🔐 Authentication

### HTTP Authentication
```bash
# When prompted, use Forgejo credentials
Username: admin
Password: [your Forgejo password]
```

### SSH Authentication (Recommended)

**Generate SSH key:**
```bash
ssh-keygen -t ed25519 -C "admin@localhost"
```

**Add SSH key to Forgejo:**
1. Go to http://localhost:3333/user/settings/keys
2. Click "Add Key"
3. Paste contents of `~/.ssh/id_ed25519.pub`
4. Click "Add Key"

**Test SSH connection:**
```bash
ssh -p 2222 git@localhost
```

**Update remote to SSH:**
```bash
git remote set-url forgejo ssh://git@localhost:2222/admin/apistreamhub-fastapi.git
```

---

## 📊 Repository Management

### Mirror GitHub Repository

After creating repository in Forgejo, mirror from GitHub:

**Via Web UI:**
1. Go to repository → Settings
2. Select "Repository Mirroring"
3. Add mirror URL: `https://github.com/masbr0d1n/apistreamhub-fastapi.git`
4. Enable mirroring

**Via CLI:**
```bash
# Clone from GitHub
git clone https://github.com/masbr0d1n/apistreamhub-fastapi.git

# Add Forgejo remote
cd apistreamhub-fastapi
git remote add forgejo ssh://git@localhost:2222/admin/apistreamhub-fastapi.git

# Push all to Forgejo
git push --all forgejo
git push --tags forgejo
```

---

## 🚀 Forgejo Actions (CI/CD)

Forgejo has built-in CI/CD called Forgejo Actions.

**Enable Actions:**
```yaml
# .forgejo/workflows/test.yml
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest
```

---

## 📱 Access Forgejo

### Web UI
- **URL:** http://localhost:3333
- **Admin:** http://localhost:3333/admin
- **Your Profile:** http://localhost:3333/admin

### Git URLs
- **HTTP:** http://localhost:3333/admin/apistreamhub-fastapi.git
- **SSH:** ssh://git@localhost:2222/admin/apistreamhub-fastapi.git

### API
- **Swagger:** http://localhost:3333/api/swagger
- **API Docs:** http://localhost:3333/api/docs

---

## 🛠️ Management

### Start Forgejo
```bash
cd /home/sysop/.openclaw/workspace/forgejo-docker
docker-compose up -d
```

### Stop Forgejo
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f forgejo
```

### Restart Services
```bash
docker-compose restart
```

---

## 🔒 Security Recommendations

1. ✅ Change default admin password
2. ✅ Create personal user account (don't use admin)
3. ✅ Setup SSH keys for git operations
4. ✅ Enable HTTPS for production
5. ✅ Change SECRET_KEY in docker-compose.yml
6. ✅ Backup data volume regularly

---

## 📦 Next Projects

After setting up apistreamhub-fastapi, you can create repositories for:
- Dashboard (Node.js dashboard)
- Twitter scraper (Puppeteer scripts)
- Automation scripts (cron jobs)
- Documentation (wiki, docs)

---

**Forgejo URL:** http://localhost:3333
**Status:** 🟢 Running - Ready for Setup!

**Questions? Check Forgejo docs:** https://forgejo.org/docs/
