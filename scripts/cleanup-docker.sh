#!/bin/bash

# Script untuk membersihkan semua container dan image Docker
# Gunakan dengan hati-hati!

echo "Menghentikan semua container yang sedang berjalan..."
docker stop $(docker ps -aq) || true

echo "Menghapus semua container..."
docker rm $(docker ps -aq) || true

echo "Menghapus semua image yang tidak digunakan..."
docker image prune -af || true

echo "Membersihkan builder cache..."
docker builder prune -af || true

echo "Membersihkan volume yang tidak digunakan..."
docker volume prune -f || true

echo "Pembersihan Docker selesai!" 