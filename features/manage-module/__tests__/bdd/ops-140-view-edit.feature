Feature: Mode View dan Edit
  Sebagai pengguna admin
  Saya ingin dapat melihat dan mengedit halaman modul
  Agar saya dapat mengelola konten modul dengan mudah

  Scenario: Melihat halaman modul
    Given saya berada di halaman modul dengan ID "module-123"
    And halaman memiliki pageId "page-456"
    When halaman dimuat dengan mode "view"
    Then saya melihat konten halaman dalam format yang mudah dibaca
    And saya melihat tombol edit di sudut kanan bawah

  Scenario: Mengedit halaman modul
    Given saya berada di halaman modul dengan ID "module-123"
    And halaman memiliki pageId "page-456"
    When saya mengklik tombol edit
    Then URL berubah ke mode "edit"
    And saya melihat editor rich text dengan toolbar
    And saya melihat tombol save di sudut kanan bawah

  Scenario: Menyimpan perubahan dan kembali ke mode view
    Given saya berada di halaman modul dalam mode edit
    When saya membuat perubahan pada konten
    And saya mengklik tombol save
    Then perubahan disimpan ke server
    And URL berubah ke mode "view"
    And saya melihat notifikasi sukses
    And saya melihat konten yang diperbarui dalam mode view 