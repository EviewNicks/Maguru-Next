// features/module/services/moduleService.ts

// Tipe untuk modul
export interface Module {
  id: string
  title: string
  description: string
  totalPages: number
  estimatedTime: number
  pages: ModulePage[]
  quizAvailable: boolean
}

// Tipe untuk halaman modul
export interface ModulePage {
  id: string
  title: string
  content: string
  media?: string
  hasInteractiveElements: boolean
  requiredInteractions?: string[]
  pageNumber?: number
  isLastPage?: boolean
}

// Data dummy untuk modul
const DUMMY_MODULES: Module[] = [
  {
    id: "module-1",
    title: "Pengantar Pemrograman Web",
    description: "Mempelajari dasar-dasar pemrograman web, HTML, CSS, dan JavaScript.",
    totalPages: 5,
    estimatedTime: 30,
    quizAvailable: true,
    pages: [
      {
        id: "page-1",
        title: "Pengenalan HTML",
        content: `# Pengenalan HTML

HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web.

## Struktur Dasar HTML

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>Judul Halaman</title>
</head>
<body>
  <h1>Heading Utama</h1>
  <p>Paragraf teks.</p>
</body>
</html>
\`\`\`

## Elemen HTML

Elemen HTML didefinisikan oleh tag pembuka, konten, dan tag penutup:

- Tag pembuka: \`<tagname>\`
- Konten: Teks atau elemen lain
- Tag penutup: \`</tagname>\`

Contoh: \`<h1>Ini adalah heading</h1>\`

Coba klik tombol di bawah untuk melihat contoh kode HTML:

<button id="show-example">Lihat Contoh</button>
`,
        hasInteractiveElements: true,
        requiredInteractions: ["show-example", "scroll-to-bottom"]
      },
      {
        id: "page-2",
        title: "Pengenalan CSS",
        content: `# Pengenalan CSS

CSS (Cascading Style Sheets) digunakan untuk mendesain tampilan halaman web.

## Cara Menggunakan CSS

Ada tiga cara untuk menambahkan CSS:
1. Inline CSS
2. Internal CSS
3. External CSS

### Contoh CSS

\`\`\`css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  line-height: 1.6;
}
\`\`\`

Coba ubah warna teks dengan mengklik tombol di bawah:

<div id="color-demo" style="padding: 20px; background: #fff;">
  <p id="color-text">Teks ini akan berubah warna.</p>
  <button id="change-color">Ubah Warna</button>
</div>
`,
        hasInteractiveElements: true,
        requiredInteractions: ["change-color", "scroll-to-bottom"]
      },
      {
        id: "page-3",
        title: "Pengenalan JavaScript",
        content: `# Pengenalan JavaScript

JavaScript adalah bahasa pemrograman yang memungkinkan Anda mengimplementasikan fitur kompleks pada halaman web.

## Dasar JavaScript

\`\`\`javascript
// Variabel
let name = "John";
const age = 25;

// Fungsi
function greet() {
  return "Hello, " + name + "!";
}

// Kondisional
if (age >= 18) {
  console.log("Dewasa");
} else {
  console.log("Anak-anak");
}
\`\`\`

## DOM Manipulation

JavaScript dapat mengubah elemen HTML:

\`\`\`javascript
document.getElementById("demo").innerHTML = "Hello JavaScript!";
\`\`\`

Coba kalkulator sederhana:

<div id="calculator" style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
  <input type="number" id="num1" placeholder="Angka 1" />
  <input type="number" id="num2" placeholder="Angka 2" />
  <button id="calculate">Hitung</button>
  <p>Hasil: <span id="result">0</span></p>
</div>
`,
        hasInteractiveElements: true,
        requiredInteractions: ["calculate", "scroll-to-bottom"]
      },
      {
        id: "page-4",
        title: "Responsif Web Design",
        content: `# Responsif Web Design

Responsif web design membuat halaman web terlihat baik di semua perangkat.

## Media Queries

\`\`\`css
@media only screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}
\`\`\`

## Flexbox

Flexbox adalah metode layout yang memungkinkan elemen beradaptasi dengan berbagai ukuran layar:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
\`\`\`

Coba simulasi responsif:

<div id="responsive-demo">
  <div id="device-frame" style="border: 2px solid #333; width: 400px; height: 300px; overflow: hidden; margin: 0 auto;">
    <div id="demo-content" style="padding: 20px;">
      <h3>Contoh Konten</h3>
      <p>Ini adalah contoh konten responsif.</p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 10px;">
    <button id="mobile-view">Mobile</button>
    <button id="tablet-view">Tablet</button>
    <button id="desktop-view">Desktop</button>
  </div>
</div>
`,
        hasInteractiveElements: true,
        requiredInteractions: ["mobile-view", "tablet-view", "desktop-view", "scroll-to-bottom"]
      },
      {
        id: "page-5",
        title: "Ringkasan",
        content: `# Ringkasan Modul

Selamat! Anda telah menyelesaikan modul Pengantar Pemrograman Web.

## Apa yang telah Anda pelajari:

1. **HTML** - Struktur dasar halaman web
2. **CSS** - Mendesain tampilan halaman web
3. **JavaScript** - Menambahkan interaktivitas ke halaman web
4. **Responsif Web Design** - Membuat halaman web terlihat baik di semua perangkat

## Langkah Selanjutnya

Untuk memperdalam pemahaman Anda, cobalah untuk:

- Membuat proyek web sederhana
- Mempelajari framework front-end seperti React atau Vue
- Mempelajari pengembangan back-end

## Quiz

Sekarang Anda siap untuk mengambil quiz untuk menguji pemahaman Anda tentang materi yang telah dipelajari.

<button id="take-quiz">Mulai Quiz</button>
`,
        hasInteractiveElements: true,
        requiredInteractions: ["take-quiz"]
      }
    ]
  },
  {
    id: "module-2",
    title: "Dasar-dasar React",
    description: "Mempelajari konsep dasar React, komponen, props, dan state.",
    totalPages: 4,
    estimatedTime: 25,
    quizAvailable: true,
    pages: [
      {
        id: "page-1",
        title: "Pengenalan React",
        content: `# Pengenalan React

React adalah library JavaScript untuk membangun antarmuka pengguna.

## Keunggulan React

- **Deklaratif**: React membuat kode lebih mudah dibaca dan di-debug.
- **Berbasis Komponen**: Membangun UI yang kompleks dari komponen kecil dan terisolasi.
- **Belajar Sekali, Tulis Di Mana Saja**: React dapat digunakan untuk web, mobile, dan desktop.

## Contoh Komponen React Sederhana

\`\`\`jsx
import React from 'react';

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

export default Welcome;
\`\`\`

Coba klik tombol di bawah untuk melihat contoh komponen React:

<button id="show-react-example">Lihat Contoh</button>
`,
        hasInteractiveElements: true,
        requiredInteractions: ["show-react-example", "scroll-to-bottom"]
      },
      // ... halaman lainnya
    ]
  }
];

// Fungsi untuk mengambil semua modul
export const fetchModules = async (): Promise<Module[]> => {
  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mengembalikan data dummy
  return DUMMY_MODULES;
};

// Fungsi untuk mengambil modul berdasarkan ID
export async function fetchModuleById(moduleId: string): Promise<Module | null> {
  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mencari modul berdasarkan ID
  const foundModule = DUMMY_MODULES.find(m => m.id === moduleId);
  
  if (!foundModule) {
    return null;
  }
  
  return foundModule;
};

// Fungsi untuk mengambil halaman modul berdasarkan ID modul dan nomor halaman
export const fetchModulePage = async (
  moduleId: string, 
  pageNumber: number
): Promise<ModulePage | null> => {
  // Simulasi delay jaringan
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mencari modul berdasarkan ID
  const foundModule = DUMMY_MODULES.find(m => m.id === moduleId);
  
  if (!foundModule) {
    return null;
  }
  
  // Mencari halaman berdasarkan nomor halaman
  const pageIndex = pageNumber - 1;
  const foundPage = foundModule.pages[pageIndex];
  
  if (!foundPage) {
    return null;
  }
  
  return foundPage;
};

// Fungsi untuk menyimpan progres modul
export const saveModuleProgress = (
  moduleId: string, 
  data: { 
    currentPage: number, 
    completedPages: number[], 
    interactionsCompleted: Record<string, string[]> 
  }
): void => {
  try {
    localStorage.setItem(`module_progress_${moduleId}`, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error saving module progress:", error);
  }
};

// Fungsi untuk mengambil progres modul
export const getModuleProgress = (moduleId: string): {
  currentPage: number,
  completedPages: number[],
  interactionsCompleted: Record<string, string[]>
} | null => {
  try {
    const storedProgress = localStorage.getItem(`module_progress_${moduleId}`);
    
    if (!storedProgress) {
      return null;
    }
    
    return JSON.parse(storedProgress);
  } catch (error) {
    console.error("Error getting module progress:", error);
    return null;
  }
};
