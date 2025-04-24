# Instruksi Mengubah Role User Menjadi Admin Menggunakan Curl

## Langkah-langkah

1. **Setup Endpoint**

   - Pastikan endpoint `/api/admin/set-role` telah dibuat dan berjalan

2. **Tambahkan ADMIN_SETUP_KEY di .env.local**

   ```
   ADMIN_SETUP_KEY="setrole_secret_key_maguru_2025"
   ```

3. **Jalankan Curl Command di Bawah Ini**

   Untuk Windows PowerShell:

   ```powershell
   $body = @{
     email = "eviewnicks@gmail.com"
     role = "admin"
     setupKey = "setrole_secret_key_maguru_2025"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/set-role" -Method Post -Body $body -ContentType "application/json"
   ```

   Untuk Command Prompt Windows:

   ```cmd
   curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"eviewnicks@gmail.com\",\"role\":\"admin\",\"setupKey\":\"setrole_secret_key_maguru_2025\"}" http://localhost:3000/api/admin/set-role
   ```

   Untuk Bash (Linux/Mac):

   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"eviewnicks@gmail.com","role":"admin","setupKey":"setrole_secret_key_maguru_2025"}' \
     http://localhost:3000/api/admin/set-role
   ```

## Catatan Penting

1. Ganti `eviewnicks@gmail.com` dengan email yang ingin dijadikan admin
2. Ganti `http://localhost:3000` dengan URL aplikasi jika tidak berjalan di localhost
3. Setelah mengubah role user menjadi admin, sebaiknya hapus ADMIN_SETUP_KEY dari .env.local
4. Metode ini hanya untuk setup awal admin, setelahnya gunakan sistem RBAC normal dengan login sebagai admin
