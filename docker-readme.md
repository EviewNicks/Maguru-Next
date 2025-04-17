# Optimasi Build Docker dengan BuildKit dan Docker Bake

## Penggunaan Docker BuildKit

[Docker BuildKit](https://docs.docker.com/build/buildkit/) adalah mesin build generasi baru yang menawarkan performa dan fitur lebih baik dibandingkan builder Docker tradisional. Beberapa keunggulan utama:

- Build paralel yang meningkatkan kecepatan
- Caching yang lebih baik
- Secret mounting yang aman
- Output yang lebih informatif

### Cara Menggunakan BuildKit

Anda dapat menggunakan BuildKit dengan menjalankan script yang sudah didefinisikan di package.json:

```bash
# Untuk membangun aplikasi development
npm run app:docker:buildkit

# Untuk membangun aplikasi production
npm run build:docker:buildkit
```

Atau Anda bisa menggunakan variabel lingkungan langsung:

```bash
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose build app
```

## Penggunaan Docker Bake

[Docker Bake](https://docs.docker.com/build/bake/) adalah teknologi yang memungkinkan pengelolaan multiple build dengan lebih efisien. Ini sangat berguna untuk:

- Menjalankan beberapa build secara bersamaan
- Mendefinisikan target build yang berbeda
- Menggunakan caching antar build
- Parameterisasi build

### Cara Menggunakan Docker Bake

Konfigurasi Bake sudah didefinisikan dalam file `docker-bake.hcl`. Anda dapat menjalankan perintah berikut:

```bash
# Membangun semua target (app, builder, dan test)
npm run build:bake

# Membangun hanya target app
npm run build:bake:app

# Membangun hanya target builder
npm run build:bake:builder
```

Atau gunakan perintah Docker langsung:

```bash
# Membangun semua target
docker buildx bake -f docker-bake.hcl

# Membangun grup development
docker buildx bake -f docker-bake.hcl development

# Membangun grup production
docker buildx bake -f docker-bake.hcl production
```

## Tips Optimasi Build

1. **Gunakan BuildKit Cache**:
   BuildKit menyimpan cache dengan lebih efisien, mengurangi waktu build secara signifikan pada build berikutnya.

2. **Strategi Layer yang Tepat**:
   Pastikan layer yang jarang berubah diletakkan di atas Dockerfile untuk memaksimalkan caching.

3. **Gunakan .dockerignore**:
   File .dockerignore yang sudah dikonfigurasi membantu mengurangi ukuran build context.

4. **Multiple Stage Build**:
   Dockerfile sudah menggunakan multiple stage build untuk mengurangi ukuran image final.

## Perbandingan Performa

| Metode Build       | Waktu Build Pertama | Build Berikutnya |
| ------------------ | ------------------- | ---------------- |
| Docker Tradisional | ~10 menit           | ~5 menit         |
| Docker BuildKit    | ~7 menit            | ~2 menit         |
| Docker Bake        | ~6 menit            | ~1 menit         |

> Waktu yang ditampilkan adalah perkiraan dan dapat bervariasi tergantung pada spesifikasi mesin dan jaringan.
