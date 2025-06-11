# Script PowerShell untuk membersihkan semua container dan image Docker
# Gunakan dengan hati-hati!

Write-Host "Menghentikan semua container yang sedang berjalan..." -ForegroundColor Yellow
docker stop $(docker ps -aq) 2>$null

Write-Host "Menghapus semua container..." -ForegroundColor Yellow
docker rm $(docker ps -aq) 2>$null

Write-Host "Menghapus semua image yang tidak digunakan..." -ForegroundColor Yellow
docker image prune -af

Write-Host "Membersihkan builder cache..." -ForegroundColor Yellow
docker builder prune -af

Write-Host "Membersihkan volume yang tidak digunakan..." -ForegroundColor Yellow
docker volume prune -f

Write-Host "Pembersihan Docker selesai!" -ForegroundColor Green 