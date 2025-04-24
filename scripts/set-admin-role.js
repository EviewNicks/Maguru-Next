/**
 * Script untuk mengatur user pertama sebagai admin
 * 
 * Cara penggunaan:
 * 1. Buat file .env.local dengan ADMIN_SETUP_KEY="setrole_secret_key_maguru_2025"
 * 2. Jalankan dengan: node scripts/set-admin-role.js
 */
require('dotenv').config();

// Gunakan built-in fetch untuk Node.js versi baru atau require node-fetch jika dibutuhkan
const fetch = global.fetch || require('node-fetch');

async function setAdminRole() {
  // Cek environment variables
  const setupKey = process.env.ADMIN_SETUP_KEY || "setrole_secret_key_maguru_2025";
  
  // Konfigurasi
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const email = 'eviewnicks@gmail.com'; // Email yang ingin dijadikan admin

  try {
    console.log(`Mengubah role user ${email} menjadi admin...`);

    // Panggil API untuk mengubah role
    const response = await fetch(`${API_URL}/api/admin/set-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role: 'admin',
        setupKey,
      }),
    });

    // Parse response
    const result = await response.json();

    if (response.ok) {
      console.log('✅ Sukses:', result.message);
      console.log('User details:', result.user);
    } else {
      console.error('❌ Error:', result.error);
      console.error('Details:', result.details || 'No details provided');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Jalankan fungsi
setAdminRole(); 