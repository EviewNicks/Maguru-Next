# Dokumentasi Migrasi Format Role

**Status**: Draft  
**Penulis**: Tim Backend  
**Terakhir Diperbarui**: 24 April 2025

## Ringkasan

Dokumen ini menjelaskan proses migrasi format penyimpanan role dari format Clerk `publicMetadata` ke tabel database `User` di Maguru. Migrasi ini akan meningkatkan kinerja, keamanan, dan konsistensi penggunaan role di seluruh aplikasi.

## Timeline Migrasi

- **24 April 2025**: Dokumentasi dan rencana migrasi
- **5 Juni 2025**: Email notifikasi ke seluruh tim developer
- **10 Juni 2025**: Deployment fitur backward compatibility
- **7 Juli 2025**: Penghentian format lama (deadline)
- **14 Juli 2025**: Penghapusan kode backward compatibility

## Format Role Saat Ini (Deprecated)

Format role lama menyimpan informasi role user di `publicMetadata` Clerk:

```typescript
// Format lama (akan dihentikan 7 Juli 2025)
const user = {
  id: 'user_123',
  publicMetadata: {
    role: 'admin', // atau "mahasiswa"
  },
}

// Cara akses lama
const role = user.publicMetadata?.role || 'mahasiswa'
```

Kelemahan format ini:

1. Menyebabkan query tambahan ke Clerk untuk setiap pemeriksaan role
2. Tidak konsisten dengan struktur data user lainnya di aplikasi
3. Tidak terhubung dengan database lokal, menyebabkan duplikasi data

## Format Role Baru

Format baru menyimpan role di tabel `User` dan disinkronkan dengan Clerk:

```typescript
// Format baru
const user = {
  id: 'user_123',
  role: 'admin', // atau "mahasiswa" (dari database)
}

// Cara akses baru
const role = user.role || 'mahasiswa'
```

Keuntungan format baru:

1. Lebih cepat (data langsung dari database)
2. Konsisten dengan model data lainnya
3. Mendukung caching untuk performa lebih baik
4. Satu sumber kebenaran (database lokal)

## Petunjuk Migrasi untuk Developer

### 1. Perubahan pada Client-Side

Ganti kode yang menggunakan format lama:

```typescript
// SEBELUM
const { user } = useUser()
const role = user?.publicMetadata?.role || 'mahasiswa'

// SESUDAH
const { user } = useUser()
const [role, setRole] = useState('mahasiswa')

useEffect(() => {
  if (user?.id) {
    // Ambil role dari endpoint baru
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setRole(data.role))
  }
}, [user?.id])
```

### 2. Perubahan pada Server-Side

Ganti kode yang menggunakan format lama:

```typescript
// SEBELUM
const { userId } = auth()
const user = await clerkClient.users.getUser(userId)
const role = user.publicMetadata?.role || 'mahasiswa'

// SESUDAH
const { userId } = auth()
const user = await prisma.user.findUnique({
  where: { clerkUserId: userId },
  select: { role: true },
})
const role = user?.role || 'mahasiswa'

// ATAU gunakan helper function
import { getUserRole } from '@/lib/cache'
const role = await getUserRole(userId)
```

### 3. Penggunaan Helper Function Backward Compatibility

Untuk masa transisi, gunakan helper function:

```typescript
import { getRoleWithCompat } from '@/lib/auth'

// Fungsi ini akan bekerja dengan kedua format
const role = getRoleWithCompat(user)
```

## Deteksi Penggunaan Format Lama

Selama masa transisi, format lama masih didukung tetapi akan menyebabkan warning:

1. Response API akan menyertakan pesan warning:

   ```json
   {
     "data": {...},
     "_warning": "DEPRECATED: Role dari publicMetadata akan dihentikan pada 7 Juli 2025",
     "_migration": "Lihat docs/auth/role-format-migration.md"
   }
   ```

2. Warning di console pada environment development

3. Log penggunaan di Sentry untuk monitoring

## FAQ

### Apa yang terjadi jika saya tidak melakukan migrasi sebelum 7 Juli?

Setelah 7 Juli 2025, akses ke role melalui `publicMetadata` tidak akan lagi berfungsi. Semua aplikasi yang masih menggunakan format lama akan mengalami error atau menggunakan role default 'mahasiswa'.

### Bagaimana cara memastikan aplikasi saya menggunakan format baru?

Jalankan test dengan fitur warning deprecation enabled di environment pengembangan. Lihat log untuk menemukan penggunaan format lama.

### Apakah ada tools untuk membantu migrasi?

Ya, kami menyediakan script `npm run check:role-format` yang dapat memindai codebase untuk menemukan penggunaan format lama.

## Kontak

Jika memiliki pertanyaan tentang migrasi ini, hubungi:

- Tim Backend - backend@maguru.com
- Tim DevOps - devops@maguru.com
