/**
 * Script untuk mengatur user pertama sebagai admin
 *
 * Cara penggunaan:
 * 1. Pastikan ada env variable ADMIN_SETUP_KEY di .env
 * 2. Jalankan dengan: npx ts-node scripts/set-admin-role.ts
 */
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function setAdminRole() {
  // Cek environment variables
  if (!process.env.ADMIN_SETUP_KEY) {
    console.error('Error: ADMIN_SETUP_KEY tidak ditemukan di file .env')
    process.exit(1)
  }

  // Konfigurasi
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const email = 'eviewnicks@gmail.com' // Email yang ingin dijadikan admin
  const setupKey = process.env.ADMIN_SETUP_KEY

  try {
    console.log(`Mengubah role user ${email} menjadi admin...`)

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
    })

    // Parse response
    const result = await response.json()

    if (response.ok) {
      console.log('✅ Sukses:', result.message)
      console.log('User details:', result.user)
    } else {
      console.error('❌ Error:', result.error)
      console.error('Details:', result.details || 'No details provided')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Jalankan fungsi
setAdminRole()
