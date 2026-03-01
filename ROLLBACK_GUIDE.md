# Rollback Guide - StreamHub Repositories

## 📋 **Status Check - 6 Jam Terakhir**

### Backend: apistreamhub-fastapi

**Git Status:** ✅ Has version control

```bash
$ git log --since="6 hours ago"
# (no commits in 6 hours)
```

**Latest Commits:**
```
77c9586 - docs: add GitHub completion summary (5 days ago)
2eace7e - docs: add comprehensive README (5 days ago)
7676d58 - feat: FastAPI + PostgreSQL PoC (5 days ago)
```

**Conclusion:** 
❌ Tidak ada commit dalam 6 jam terakhir
✅ Semua perubahan sudah 5 days ago
✅ Perubahan hari ini tidak di-commit ke git

---

### Frontend: streamhub-nextjs

**Git Status:** ❌ No version control

```bash
$ git status
fatal: your current branch 'master' does not have any commits yet
```

**Conclusion:**
❌ Tidak ada git history sama sekali
❌ Tidak bisa rollback dengan git
❌ Perubahan hari ini tidak terlacak

---

## 🔄 **Opsi Rollback**

### Backend (apistreamhub-fastapi)

**Opsi 1: Rollback ke commit sebelumnya (5 days ago)**
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
git log --oneline -10  # Lihat commit history
git checkout <commit-hash>  # Rollback ke commit tertentu
```

**Opsi 2: Rollback file spesifik**
```bash
# Hapus file yang ditambah hari ini:
rm app/services/youtube_downloader.py
rm app/api/v1/youtube.py

# Restore file yang diubah:
git checkout app/main.py
git checkout requirements.txt

# Rebuild dan redeploy
docker build -t apistreamhub-api:rollback .
docker stop apistreamhub-api && docker rm apistreamhub-api
docker run -d --name apistreamhub-api -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://postgres:postgres@host.docker.internal:5434/apistreamhub" \
  -v apistreamhub-uploads:/app/uploads \
  --add-host host.docker.internal:host-gateway \
  apistreamhub-api:rollback
```

---

### Frontend (streamhub-nextjs)

**Opsi 1: Manual Revert (Tidak ada git)**

File yang ditambah hari ini - hapus:
```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
rm src/components/reference-modal.tsx
rm src/types/video.ts
rm src/app/api/youtube/search/route.ts
rm src/app/api/youtube/download/route.ts
```

File yang diubah hari ini - restore dari backup atau manual revert:
```bash
# src/app/dashboard/content/page.tsx
# Perlu restore ke versi sebelum perubahan YouTube
```

**Opsi 2: Git Init (Mulai version control sekarang)**
```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
git init
git add .
git commit -m "feat: Add YouTube Reference modal and import"
# Future rollbacks akan bisa dilakukan
```

**Opsi 3: Docker Image Rollback (Jika image lama masih ada)**
```bash
# Cek image yang tersedia:
docker images | grep streamhub-frontend

# Jika ada image sebelumnya:
# Misalnya: streamhub-frontend:previous-version
docker stop streamhub-test && docker rm streamhub-test
docker run -d --name streamhub-test -p 3000:3000 \
  -e BACKEND_API_URL="http://host.docker.internal:8001/api/v1" \
  --add-host host.docker.internal:host-gateway \
  streamhub-frontend:previous-version
```

---

## ⚠️ **Rekomendasi**

### Jika ingin rollback semua perubahan hari ini:

**Backend (Bisa dilakukan):**
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

# Hapus file YouTube yang ditambah:
rm app/services/youtube_downloader.py
rm app/api/v1/youtube.py

# Restore file yang di-modified:
git checkout app/main.py
git checkout requirements.txt

# Rebuild:
docker build -t apistreamhub-api:rollback .
docker stop apistreamhub-api && docker rm apistreamhub-api
docker run -d --name apistreamhub-api -p 8001:8000 \
  -e DATABASE_URL="postgresql+asyncpg://postgres:postgres@host.docker.internal:5434/apistreamhub" \
  -v apistreamhub-uploads:/app/uploads \
  --add-host host.docker.internal:host-gateway \
  apistreamhub-api:rollback
```

**Frontend (Perlu manual):**
```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs

# Hapus file yang ditambah:
rm -f src/components/reference-modal.tsx
rm -f src/types/video.ts
rm -f src/app/api/youtube/search/route.ts
rm -f src/app/api/youtube/download/route.ts

# Untuk src/app/dashboard/content/page.tsx
# Perlu revert manual (tidak ada backup)
# ATAU mulai git init sekarang untuk future rollback

# Rebuild:
docker build -t streamhub-frontend:rollback .
docker stop streamhub-test && docker rm streamhub-test
docker run -d --name streamhub-test -p 3000:3000 \
  -e BACKEND_API_URL="http://host.docker.internal:8001/api/v1" \
  --add-host host.docker.internal:host-gateway \
  streamhub-frontend:rollback
```

---

## 🎯 **Solusi Terbaik: Mulai Git Init Sekarang**

```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
git init
git add .
git commit -m "feat: YouTube integration with Reference modal and import"
```

**Keuntungan:**
- ✅ Semua perubahan sekarang terlacak
- ✅ Bisa rollback kapan saja
- ✅ History lengkap
- ✅ Branching untuk features

**Setelah git init, rollback jadi mudah:**
```bash
# Lihat history
git log --oneline -10

# Rollback ke commit sebelumnya
git checkout <commit-hash>

# Atau revert commit terakhir
git revert HEAD
```

---

## 📊 **Summary:**

| Repository | Git Available | Rollback Possible | Method |
|------------|---------------|-------------------|---------|
| Backend | ✅ Yes | ✅ Yes | git checkout atau manual |
| Frontend | ❌ No | ⚠️ Manual only | Hapus file + rebuild |

**Rekomendasi:** Mulai git init untuk frontend sekarang agar rollback di masa depan jadi mudah.
