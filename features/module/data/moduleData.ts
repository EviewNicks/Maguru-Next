// features/module/data/moduleData.ts
import { ModuleData } from '../types';

export const modules: ModuleData[] = [
  {
    id: 'module-1',
    title: 'Pengenalan Pemrograman Web',
    description: 'Modul ini akan mengenalkan Anda pada dasar-dasar pemrograman web, termasuk HTML, CSS, dan JavaScript.',
    pages: [
      {
        id: 'page-1-1',
        title: 'Apa itu Pemrograman Web?',
        content: `
# Apa itu Pemrograman Web?

Pemrograman web adalah proses pembuatan aplikasi atau situs web yang dapat diakses melalui internet menggunakan browser web. 
Pemrograman web melibatkan penggunaan berbagai bahasa pemrograman dan teknologi untuk membuat, mengelola, dan memelihara situs web.

## Komponen Utama Pemrograman Web

1. **Front-end Development**: Bagian yang dapat dilihat dan berinteraksi dengan pengguna.
2. **Back-end Development**: Bagian yang berjalan di server dan mengelola logika aplikasi.
3. **Database**: Penyimpanan data yang digunakan oleh aplikasi web.

Pada modul ini, kita akan fokus pada dasar-dasar front-end development.
        `,
        isLastPage: false,
        pageNumber: 1,
      },
      {
        id: 'page-1-2',
        title: 'HTML - Struktur Dasar Web',
        content: `
# HTML - Struktur Dasar Web

HTML (HyperText Markup Language) adalah bahasa markup standar yang digunakan untuk membuat struktur dasar halaman web. 
HTML menggunakan tag untuk mendefinisikan elemen-elemen pada halaman web.

## Contoh Struktur HTML Dasar

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Judul Halaman</title>
</head>
<body>
    <h1>Judul Utama</h1>
    <p>Ini adalah paragraf teks.</p>
</body>
</html>
\`\`\`

## Tag HTML Umum

- \`<html>\`: Elemen root dari halaman HTML
- \`<head>\`: Berisi meta-informasi tentang dokumen
- \`<title>\`: Mendefinisikan judul dokumen
- \`<body>\`: Berisi konten yang terlihat di browser
- \`<h1>\` hingga \`<h6>\`: Tag heading
- \`<p>\`: Tag paragraf
- \`<a>\`: Tag untuk hyperlink
- \`<img>\`: Tag untuk menampilkan gambar
        `,
        isLastPage: false,
        pageNumber: 2,
      },
      {
        id: 'page-1-3',
        title: 'CSS - Styling Halaman Web',
        content: `
# CSS - Styling Halaman Web

CSS (Cascading Style Sheets) adalah bahasa yang digunakan untuk mendeskripsikan tampilan dan format dokumen HTML. 
CSS memungkinkan kita untuk mengontrol warna, font, tata letak, dan aspek visual lainnya dari halaman web.

## Cara Menambahkan CSS

1. **Inline CSS**: Menggunakan atribut \`style\` pada elemen HTML.
2. **Internal CSS**: Menggunakan tag \`<style>\` di dalam dokumen HTML.
3. **External CSS**: Menggunakan file CSS terpisah yang dihubungkan ke HTML.

## Contoh CSS

\`\`\`css
/* External CSS */
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
    color: #666;
}
\`\`\`

## Selector CSS

- **Element Selector**: Memilih elemen berdasarkan nama tag (\`h1\`, \`p\`, dll).
- **Class Selector**: Memilih elemen dengan class tertentu (\`.class-name\`).
- **ID Selector**: Memilih elemen dengan ID tertentu (\`#id-name\`).
        `,
        isLastPage: false,
        pageNumber: 3,
      },
      {
        id: 'page-1-4',
        title: 'JavaScript - Membuat Web Interaktif',
        content: `
# JavaScript - Membuat Web Interaktif

JavaScript adalah bahasa pemrograman yang memungkinkan Anda menambahkan interaktivitas ke halaman web. 
Dengan JavaScript, Anda dapat memanipulasi elemen HTML, merespons tindakan pengguna, dan membuat konten dinamis.

## Cara Menambahkan JavaScript

1. **Inline JavaScript**: Menggunakan atribut event pada elemen HTML.
2. **Internal JavaScript**: Menggunakan tag \`<script>\` di dalam dokumen HTML.
3. **External JavaScript**: Menggunakan file JavaScript terpisah yang dihubungkan ke HTML.

## Contoh JavaScript Sederhana

\`\`\`javascript
// Menampilkan pesan alert saat tombol diklik
function showAlert() {
    alert("Halo! Ini adalah pesan dari JavaScript.");
}

// Mengubah teks elemen HTML
document.getElementById("demo").innerHTML = "Teks baru dari JavaScript";

// Menangani event
document.getElementById("myButton").addEventListener("click", function() {
    console.log("Tombol diklik!");
});     
\`\`\`

## Konsep Dasar JavaScript

- **Variabel dan Tipe Data**: \`var\`, \`let\`, \`const\`, string, number, boolean, dll.
- **Fungsi**: Blok kode yang dapat dipanggil untuk melakukan tugas tertentu.
- **Objek**: Koleksi properti dan metode.
- **Event**: Tindakan yang dapat dideteksi oleh JavaScript, seperti klik, hover, dll.
        `,
        isLastPage: false,
        pageNumber: 4,
      },
      {
        id: 'page-1-5',
        title: 'Rangkuman dan Langkah Selanjutnya',
        content: `
# Rangkuman dan Langkah Selanjutnya

Selamat! Anda telah menyelesaikan modul pengenalan pemrograman web. Mari kita rangkum apa yang telah kita pelajari:

## Rangkuman

1. **HTML**: Struktur dasar halaman web, menggunakan tag untuk mendefinisikan elemen.
2. **CSS**: Styling halaman web, mengontrol tampilan visual elemen HTML.
3. **JavaScript**: Menambahkan interaktivitas ke halaman web, memanipulasi elemen HTML, dan merespons tindakan pengguna.

## Langkah Selanjutnya

Untuk memperdalam pengetahuan Anda tentang pemrograman web, Anda dapat:

1. **Praktek Mandiri**: Coba buat halaman web sederhana menggunakan HTML, CSS, dan JavaScript.
2. **Pelajari Framework**: Eksplorasi framework populer seperti React, Vue, atau Angular untuk front-end, dan Express atau Django untuk back-end.
3. **Ikuti Kursus Lanjutan**: Lanjutkan dengan modul-modul berikutnya yang akan membahas topik lebih mendalam.

## Sumber Belajar Tambahan

- [MDN Web Docs](https://developer.mozilla.org/)
- [W3Schools](https://www.w3schools.com/)
- [freeCodeCamp](https://www.freecodecamp.org/)

Terima kasih telah mengikuti modul ini. Semoga sukses dalam perjalanan belajar pemrograman web Anda!
        `,
        isLastPage: true,
        pageNumber: 5,
      },
    ],
    totalPages: 5,
    progressPercentage: 0,
    isCompleted: false,
  },
  {
    id: 'module-2',
    title: 'Dasar-dasar React',
    description: 'Modul ini akan mengenalkan Anda pada dasar-dasar React, sebuah library JavaScript untuk membangun antarmuka pengguna.',
    pages: [
      {
        id: 'page-2-1',
        title: 'Pengenalan React',
        content: `
# Pengenalan React

React adalah library JavaScript yang dikembangkan oleh Facebook untuk membangun antarmuka pengguna (UI) yang interaktif dan efisien. 
React menggunakan pendekatan berbasis komponen, yang memungkinkan Anda membangun UI yang kompleks dari potongan-potongan kecil yang terisolasi.

## Keunggulan React

1. **Berbasis Komponen**: UI dibagi menjadi komponen-komponen yang dapat digunakan kembali.
2. **Virtual DOM**: Meningkatkan performa dengan meminimalkan manipulasi DOM langsung.
3. **Deklaratif**: Anda mendeskripsikan bagaimana UI seharusnya terlihat, React menangani pembaruan DOM.
4. **Ekosistem yang Kaya**: Didukung oleh banyak library dan tools.

## Sejarah Singkat React

React pertama kali diperkenalkan pada tahun 2013 dan sejak itu telah menjadi salah satu library front-end paling populer. 
React dikembangkan untuk mengatasi tantangan dalam membangun aplikasi dengan data yang berubah seiring waktu.
        `,
        isLastPage: false,
        pageNumber: 1,
      },
      {
        id: 'page-2-2',
        title: 'Komponen React',
        content: `
# Komponen React

Komponen adalah blok pembangun utama aplikasi React. Komponen memungkinkan Anda membagi UI menjadi bagian-bagian independen dan dapat digunakan kembali.

## Jenis Komponen React

1. **Functional Components**: Komponen yang didefinisikan sebagai fungsi JavaScript.
2. **Class Components**: Komponen yang didefinisikan sebagai class JavaScript.

## Contoh Functional Component

\`\`\`jsx
import React from 'react';

function Greeting(props) {
  return <h1>Halo, {props.name}!</h1>;
}

export default Greeting;
\`\`\`

## Contoh Class Component

\`\`\`jsx
import React, { Component } from 'react';

class Greeting extends Component {
  render() {
    return <h1>Halo, {this.props.name}!</h1>;
  }
}

export default Greeting;
\`\`\`

## Props dan State

- **Props**: Data yang diteruskan dari komponen induk ke komponen anak.
- **State**: Data yang dikelola oleh komponen itu sendiri dan dapat berubah seiring waktu.
        `,
        isLastPage: false,
        pageNumber: 2,
      },
      {
        id: 'page-2-3',
        title: 'JSX - JavaScript XML',
        content: `
# JSX - JavaScript XML

JSX adalah ekstensi sintaks untuk JavaScript yang direkomendasikan untuk digunakan dengan React. 
JSX memungkinkan Anda menulis struktur HTML-like di dalam JavaScript.

## Keunggulan JSX

1. **Sintaks Familiar**: Mirip dengan HTML, mudah dipahami.
2. **Ekspresi JavaScript**: Dapat menyisipkan ekspresi JavaScript di dalam JSX.
3. **Pencegahan Injeksi**: React DOM menghindari XSS (Cross-site Scripting) dengan escape otomatis.

## Contoh JSX

\`\`\`jsx
const element = <h1>Halo, Dunia!</h1>;

const name = 'John Doe';
const greeting = <h1>Halo, {name}!</h1>;

const list = (
  <ul>
    {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
\`\`\`

## JSX vs HTML

JSX sangat mirip dengan HTML, tetapi ada beberapa perbedaan:

1. **Atribut**: Menggunakan camelCase (misalnya, \`className\` bukan \`class\`).
2. **Self-closing Tags**: Harus memiliki slash penutup (misalnya, \`<img />\`).
3. **JavaScript Expressions**: Dapat menyisipkan ekspresi JavaScript di dalam kurung kurawal \`{}\`.
        `,
        isLastPage: true,
        pageNumber: 3,
      },
    ],
    totalPages: 3,
    progressPercentage: 0,
    isCompleted: false,
  },
];

export default modules;
