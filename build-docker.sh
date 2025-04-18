#!/bin/bash

echo "================================="
echo "Docker Build Helper for Maguru"
echo "================================="

echo "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
  echo "Docker tidak berjalan. Silakan jalankan Docker Desktop terlebih dahulu."
  exit 1
fi

echo "Membersihkan container lama..."
docker-compose -f docker-compose.build.yml down 2>/dev/null

echo "Membuat file .env gabungan untuk build..."
cat .env .env.local .env.production.local > .env.build 2>/dev/null

echo "Memulai proses build..."
docker-compose -f docker-compose.build.yml up --build

echo "Build selesai!"
echo "Lihat hasil build di folder .next" 