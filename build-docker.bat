@echo off
echo =================================
echo Docker Build Helper for Maguru
echo =================================

echo Checking Docker status...
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo Docker tidak berjalan. Mencoba memulai Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Menunggu Docker Desktop siap (60 detik)...
    timeout /t 60 /nobreak > nul
)

echo Membersihkan container lama...
docker-compose -f docker-compose.build.yml down 2>nul

echo Membuat file .env gabungan untuk build...
copy .env+.env.local+.env.production.local .env.build > nul 2>&1

echo Memulai proses build...
docker-compose -f docker-compose.build.yml up --build

echo Build selesai!
echo Lihat hasil build di folder .next
pause 