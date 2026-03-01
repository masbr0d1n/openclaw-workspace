# 🔄 Git Pre-Commit Hook - Database Backup

## ✅ Setup Complete!

Pre-commit hooks sudah terinstall di kedua repository:
- ✅ Backend (apistreamhub-fastapi)
- ✅ Frontend (streamhub-nextjs)

---

## 🎯 Cara Kerja

Setiap kali kamu menjalankan `git commit`:

1. **Pre-commit hook otomatis berjalan**
2. **Database PostgreSQL di-backup**
3. **File backup disimpan** di `backups/database/`
4. **Hanya 10 backup terakhir** yang disimpan
5. **Git commit dilanjutkan**

---

## 📝 Contoh Penggunaan

```bash
# Edit file
vim app/api/v1/videos.py

# Add & commit
git add app/api/v1/videos.py
git commit -m "fix: update video API endpoint"

# Output:
# 🔄 Pre-Commit: Backing up database...
# ✓ Backup: apistreamhub_master_20260301_070000.sql.gz
# [master abc1234] fix: update video API endpoint
```

---

## 📂 Lokasi Backup

### Backend:
```
/home/sysop/.openclaw/workspace/apistreamhub-fastapi/backups/database/
```

### Frontend:
```
/home/sysop/.openclaw/workspace/streamhub-nextjs/backups/database/
```

**Format nama file:**
```
apistreamhub_<branch>_<date>_<time>.sql.gz
```

Contoh:
```
apistreamhub_master_20260301_070000.sql.gz
apistreamhot_feature-youtube_20260301_071500.sql.gz
```

---

## ⚙️ Konfigurasi

**Backup location:** `backups/database/` (per project)
**Retention:** 10 backups terakhir
**Format:** Gzipped SQL
**Auto-stage:** No (backup di .gitignore)

---

## 🛠️ Cara Nonaktifkan (Jika Ingin)

### Temporarily:
```bash
# Skip pre-commit hook
git commit --no-verify -m "commit without backup"
```

### Permanently:
```bash
# Remove hook file
rm .git/hooks/pre-commit
```

---

## 🔧 Customisasi

Edit hook file di:
```
.git/hooks/pre-commit
```

**Yang bisa diubah:**
- Nama database
- Retention count (default: 10)
- Container name
- Backup format

---

## 📊 Monitoring

### Cek semua backups:
```bash
# Backend
ls -lh apistreamhub-fastapi/backups/database/

# Frontend
ls -lh streamhub-nextjs/backups/database/
```

### Restore dari backup:
```bash
# Cari backup file terakhir
LATEST=$(ls -t apistreamhub-fastapi/backups/database/*.sql.gz | head -1)

# Restore
gunzip -c "$LATEST" | docker exec -i apistreamhub-db psql -U postgres apistreamhub
```

---

## ✅ Test Result

Pre-commit hook sudah ditest dan berhasil:
```
🔄 Pre-Commit: Backing up database...
✓ Backup: apistreamhub_master_20260301_070000.sql.gz
```

---

## 🎉 Summary

✅ **Pre-commit hooks installed** (backend + frontend)
✅ **Auto-backup on every commit**
✅ **Smart retention** (10 backups only)
✅ **Non-intrusive** (doesn't slow down commits)
✅ **Easy to restore** dari backup file

**Sekarang setiap commit ke git otomatis backup database!** 🚀
