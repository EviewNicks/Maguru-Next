#!/bin/bash

# Script untuk menjalankan build Next.js dengan Docker
# Mengatasi masalah permission dan dependency pada prisma

echo "🚀 Memulai proses build dengan Docker..."

# Membersihkan folder .next jika ada
if [ -d ".next" ]; then
  echo "🧹 Membersihkan folder .next sebelumnya..."
  rm -rf .next
fi

# Membuat folder .next dengan permission yang benar
mkdir -p .next
chmod 777 .next

# Jalankan docker-compose build
echo "🏗️ Menjalankan build dalam container Docker..."
docker-compose -f docker-compose.build.yml up --build

# Periksa status build
if [ -d ".next/standalone" ]; then
  echo "✅ Build berhasil! Folder .next sudah dibuat."
  echo "🔍 Anda dapat menjalankan 'npm start' untuk memulai aplikasi."
else
  echo "❌ Build gagal atau tidak lengkap. Periksa log untuk informasi lebih lanjut."
  exit 1
fi

echo "🎉 Proses build selesai!" 