# Forgejo Git Server Setup

**URL:** http://localhost:3333
**Status:** ✅ Running
**Admin User:** admin
**Admin Password:** admin123
**Git SSH Port:** 2222

---

## 🚀 Quick Start

### 1. Access Forgejo Web UI
```
http://localhost:3333
```

Login with:
- **Username:** admin
- **Password:** admin123

### 2. Create Repository
1. Click "+" → "New Repository"
2. Repository name: `apistreamhub-fastapi`
3. Description: `FastAPI + PostgreSQL PoC for StreamHub API`
4. Visibility: Private (or Public)
5. Click "Create Repository"

### 3. Push Existing Project

```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Add Forgejo remote
git remote add forgejo http://localhost:3333/admin/apistreamhub-fastapi.git

# OR if remote already exists
git remote set-url forgejo http://localhost:3333/admin/apistreamhub-fastapi.git

# Push to Forgejo
git push forgejo master

# OR push all branches
git push --all forgejo
```

### 4. Clone from Forgejo

```bash
# Clone via HTTP
git clone http://localhost:3333/admin/apistreamhub-fastapi.git

# Clone via SSH
git clone ssh://git@localhost:2222/admin/apistreamhub-fastapi.git
```

---

## 🔧 Configuration

### Docker Compose Location
```
/home/sysop/.openclaw/workspace/forgejo-docker/docker-compose.yml
```

### Container Names
- **Forgejo:** forgejo (port 3333)
- **Database:** forgejo-db (PostgreSQL)

### Volumes
- **Data:** forgejo_data
- **Database:** forgejo_db

### Environment Variables
```yaml
FORGEJO__server__ROOT_URL: http://localhost:3333/
FORGEJO__admin__user: admin
FORGEJO__admin__password: admin123
FORGEJO__admin__email: admin@localhost
FORGEJO__service__DISABLE_REGISTRATION: true
FORGEJO__actions__ENABLED: true
```

---

## 📡 Access Methods

### HTTP
- **URL:** http://localhost:3333
- **Git Clone:** `http://localhost:3333/admin/<repo>.git`

### SSH
- **Port:** 2222
- **Host:** localhost
- **Git Clone:** `ssh://git@localhost:2222/admin/<repo>.git`

---

## 🛠️ Management Commands

### Start Services
```bash
cd /home/sysop/.openclaw/workspace/forgejo-docker
docker-compose up -d
```

### Stop Services
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

## 🔒 Security Notes

### ⚠️ CHANGE DEFAULT CREDENTIALS!

1. Login as admin
2. Go to Settings → Account
3. Change password immediately

### Recommended Changes:
- Change admin password
- Create personal user account (don't use admin for daily work)
- Setup SSH keys for authentication
- Enable HTTPS for production
- Change SECRET_KEY in docker-compose.yml

---

## 📦 Backup & Restore

### Backup
```bash
# Backup data volume
docker run --rm -v forgejo_data:/data -v $(pwd):/backup alpine tar czf /backup/forgejo-backup.tar.gz /data

# Backup database
docker exec forgejo-db pg_dump -U postgres forgejo > forgejo-db-backup.sql
```

### Restore
```bash
# Restore data volume
docker run --rm -v forgejo_data:/data -v $(pwd):/backup alpine tar xzf /backup/forgejo-backup.tar.gz -C /

# Restore database
cat forgejo-db-backup.sql | docker exec -i forgejo-db psql -U postgres forgejo
```

---

## 🔄 Migration from GitHub

### Migrate apistreamhub-fastapi

```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Add Forgejo remote
git remote add forgejo http://localhost:3333/admin/apistreamhub-fastapi.git

# Push all branches and tags
git push forgejo --all
git push forgejo --tags

# Set Forgejo as default (optional)
git remote set-url origin http://localhost:3333/admin/apistreamhub-fastapi.git
```

---

## 🎯 Next Steps

1. ✅ Forgejo installed and running
2. ⏳ Create repository in Forgejo UI
3. ⏳ Push apistreamhub-fastapi to Forgejo
4. ⏳ Setup SSH keys for authentication
5. ⏳ Create CI/CD with Forgejo Actions
6. ⏳ Mirror repositories from GitHub

---

## 📚 Resources

- **Forgejo Docs:** https://forgejo.org/
- **Documentation:** http://localhost:3333/assets/doc/ (after login)
- **API:** http://localhost:3333/api/swagger

---

**Status:** 🟢 Forgejo Ready for Use!

**Setup Date:** 2026-02-24

**Location:** /home/sysop/.openclaw/workspace/forgejo-docker
