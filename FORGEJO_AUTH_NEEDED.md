╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              ⚠️ FORGEJO AUTHENTICATION FAILED ⚠️                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Problem:
  Git push ke Forgejo gagal karena password salah.

Status Saat Ini:
  ✅ Backend (apistreamhub-fastapi) - Sudah committed & pushed
  ✅ Frontend (streamhub-nextjs) - Sudah committed, belum pushed
  ❌ Forgejo auth failed - Password incorrect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 SOLUSI:

Opsi 1: Manual Push dengan Password yang Benar

1. Buka terminal:
   cd /home/sysop/.openclaw/workspace/streamhub-nextjs

2. Push dengan password:
   git push http://sysop:<PASSWORD>@localhost:3333/sysop/streamhub-nextjs.git master
   
   Ganti <PASSWORD> dengan password Forgejo yang benar untuk user sysop.

Opsi 2: Setup SSH Key (Recommended)

1. Generate SSH key (jika belum ada):
   ssh-keygen -t ed25519 -C "sysop@localhost"

2. Copy public key:
   cat ~/.ssh/id_ed25519.pub

3. Buka Forgejo: http://localhost:3333
   - Login sebagai sysop
   - Settings → SSH Keys → Add Key
   - Paste public key → Add Key

4. Update git remote ke SSH:
   cd /home/sysop/.openclaw/workspace/streamhub-nextjs
   git remote set-url forgejo git@localhost:3333:sysop/streamhub-nextjs.git
   git push -u forgejo master

Opsi 3: Menggunakan Personal Access Token

1. Buka Forgejo: http://localhost:3333
   - Login sebagai sysop
   - Settings → Applications → Generate New Token
   - Name: git-push
   - Scope: repo (full control)
   - Copy token

2. Push dengan token:
   cd /home/sysop/.openclaw/workspace/streamhub-nextjs
   git push http://sysop:<TOKEN>@localhost:3333/sysop/streamhub-nextjs.git master
   
   Ganti <TOKEN> dengan token yang digenerate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CURRENT STATUS:

Repository              | Committed | Pushed | Forgejo URL
------------------------|-----------|--------|-----------------------------
apistreamhub-fastapi    | ✅ Yes    | ✅ Yes | http://localhost:3333/sysop/..
streamhub-nextjs        | ✅ Yes    | ❌ No  | http://localhost:3333/sysop/..

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Silakan pilih salah satu opsi di atas untuk menyelesaikan push frontend.

Rekomendasi: Opsi 2 (SSH Key) - lebih aman dan tidak perlu password setiap kali push.

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║         ⏳ FRONTEND PENDING AUTHENTICATION SETUP ⏳                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
