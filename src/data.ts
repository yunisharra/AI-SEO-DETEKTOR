export interface SEOMember {
  title: string;
  description: string;
  details: string[];
}

export interface PillarContent {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  summary: string;
  checklists: string[];
}

export interface LandingPageElement {
  tag: string;
  title: string;
  desc: string;
  position: string;
  seoTips: string;
}

export const SEO_INTRO = {
  title: "Apa Itu SEO?",
  description: "Pahami dasar-dasar Search Engine Optimization dan bagaimana cara kerja mesin pencari dalam menemukan, meranking, dan merekomendasikan website Anda kepada jutaan pengguna.",
  contentBlocks: [
    {
      heading: "Definisi Sederhana SEO",
      body: "SEO (Search Engine Optimization) atau Pengoptimalan Mesin Pencari adalah seni dan ilmu untuk menempatkan halaman website Anda di urutan teratas hasil pencarian organik (non-bayar) Google, Bing, atau Yahoo. Ketika seseorang mengetik kata kunci tertentu (misalnya 'resep mie ayam sehat' atau 'jasa desain landing page'), website yang dioptimalkan dengan baik akan muncul di baris teratas, mengundang banyak pengunjung tertarget secara gratis."
    },
    {
      heading: "Mengapa SEO Sangat Penting di Tahun 2026?",
      body: "Berbeda dengan iklan berbayar (seperti Google Ads atau Meta Ads) yang langsung berhenti mengirimkan trafik saat saldo Anda habis, SEO adalah aset jangka panjang. Sekali website Anda berhasil menduduki peringkat teratas untuk kata kunci pencarian yang tinggi, Anda akan terus mendapatkan kunjungan potensial setiap hari, siang dan malam, tanpa membayar biaya per klik (CPC) sepeser pun."
    },
    {
      heading: "Bagaimana Cara Kerja Google? (3 Tahap Utama)",
      steps: [
        {
          label: "1. Crawling (Pemindaian)",
          text: "Google mengerahkan bot perangkat lunak khusus bernama 'Googlebot' (sering disebut spider atau crawler) untuk menjelajahi miliaran link di internet guna menemukan halaman baru atau update terbaru."
        },
        {
          label: "2. Indexing (Pengindeksan)",
          text: "Jika halaman yang dipindai layak dan memenuhi standar kualitas, Google akan menyimpannya ke dalam database raksasa (index). Ini seperti memasukkan buku baru ke dalam katalog perpustakaan global."
        },
        {
          label: "3. Ranking (Penilaian & Penayangan)",
          text: "Saat pengguna mengetikkan kata pencarian, algoritma Google yang super cerdas akan mengevaluasi ratusan faktor dari halaman terindeks untuk memberikan hasil yang paling relevan, cepat, dan berkualitas di posisi teratas."
        }
      ]
    }
  ]
};

export const SEO_PILLARS: PillarContent[] = [
  {
    id: "keyword-research",
    title: "1. Keyword Research",
    subtitle: "Menemukan Kata Pencarian yang Tepat",
    iconName: "Search",
    summary: "Sebelum menulis baris kode atau konten apa pun, Anda harus tahu apa yang sebenarnya diketikkan oleh calon pelanggan Anda di Google. Riset kata kunci membantu Anda menghindari pembuatan konten yang tidak dicari siapa pun.",
    checklists: [
      "Search Volume (Volume Pencarian): Jumlah rata-rata pencarian kata kunci dalam sebulan. Cari yang memiliki peminat cukup banyak.",
      "Keyword Difficulty (Tingkat Kesulitan): Seberapa ketat kompetisi untuk merebut halaman pertama. Untuk web baru, mulailah dengan kesulitan rendah.",
      "Search Intent (Maksud Pencarian): Apakah pengguna ingin membeli (Transactional), mencari info (Informational), membandingkan harga (Commercial), atau membuka web tertentu (Navigational).",
      "Long-Tail Keywords: Kata kunci yang lebih panjang dan spesifik (misal: 'sepatu lari flat foot neon hijau') lebih mudah diranking daripada kata kunci pendek ('sepatu lari')."
    ]
  },
  {
    id: "on-page-seo",
    title: "2. On-Page SEO",
    subtitle: "Mengoptimalkan Bagian Dalam Halaman",
    iconName: "FileText",
    summary: "Optimasi On-Page berfokus pada elemen-elemen di dalam halaman website Anda sendiri agar mudah dipahami oleh Googlebot sekaligus nyaman dibaca oleh manusia.",
    checklists: [
      "Meta Tag (Title & Description): Menulis judul dan kutipan deskripsi menarik yang mengandung kata kunci utama di awal.",
      "URL Struktur yang Bersih: Hindari URL acak (misal: /p?id=123), gunakan opsi SEO friendly (misal: /panduan-belajar-seo-neon).",
      "Optimasi Gambar: Mengecilkan ukuran file gambar agar loading cepat dan mengisi tag 'alt' gambar menggunakan kata kunci relevan.",
      "Internal Linking: Menghubungkan satu halaman artikel ke halaman artikel lain di dalam website Anda sendiri untuk mendistribusikan otoritas link."
    ]
  },
  {
    id: "off-page-seo",
    title: "3. Off-Page SEO",
    subtitle: "Meningkatkan Reputasi & Otoritas Luar",
    iconName: "Share2",
    summary: "Off-Page SEO membuktikan kepada Google bahwa website Anda adalah sumber yang tepercaya. Hal ini diperoleh melalui rekomendasi atau sinyal positif dari website luar.",
    checklists: [
      "Backlink Berkualitas: Link aktif dari website lain yang mengarah ke website Anda. Satu backlink berkualitas tinggi setara dengan ratusan backlink spam low-quality.",
      "Brand Mention (Penyebutan Merek): Semakin sering nama brand Anda disebut di forum-forum kredibel atau berita, semakin naik reputasi website Anda.",
      "Social signals: Sinyal ketertarikan/interaksi dari media sosial (sharing link, tweet, postingan LinkedIn) yang mendatangkan trafik rujukan sehat.",
      "E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness): Menunjukkan siapa penulis artikel Anda untuk memastikan kredibilitas informasi."
    ]
  },
  {
    id: "technical-seo",
    title: "4. Technical SEO",
    subtitle: "Kesehatan Sistem & Kemudahan Crawling",
    iconName: "Cpu",
    summary: "SEO Teknis memastikan laba-laba Googlebot tidak tersesat atau mengalami hambatan saat mengakses struktur website Anda. Website yang lemot akan langsung ditolak oleh algoritma Google modern.",
    checklists: [
      "Page Speed (Kecepatan Loading): Website ideal harus termuat penuh dalam waktu kurang dari 2.5 detik (sesuai standar Core Web Vitals Google).",
      "Mobile Friendliness (Responsif HP): Tampilan harus rapi secara otomatis di layar smartphone, karena Google menerapkan Mobile-First Indexing.",
      "Keamanan HTTPS (SSL): Sertifikat SSL aktif wajib digunakan untuk melindungi keamanan data pengunjung.",
      "Sitemap XML & Robots.txt: Peta panduan website dalam bentuk XML agar Googlebot tahu rute pemindaian halaman krusial Anda."
    ]
  }
];

export const LANDING_PAGE_SEO: LandingPageElement[] = [
  {
    tag: "Header & Title H1",
    title: "Satu-satunya Tag H1 yang Fokus",
    desc: "Judul utama halaman yang muncul di atas folder pertama lipatan layar. Harus mengandung kata kunci utama dengan jelas dan langsung menawarkan solusi bagi pengunjung.",
    position: "Bagian Atas Landing Page",
    seoTips: "Gunakan tag <h1 id='...'> hanya satu kali saja per halaman. Pastikan memuat kata kunci utama di 3 kata pertama."
  },
  {
    tag: "Sub-hero Text (H2 / Paragraf)",
    title: "Proposisi Nilai & Keterbacaan Instan",
    desc: "Paragraf pendek pendukung H1 yang meyakinkan audiens dalam waktu 3 detik pertama agar tidak menekan tombol kembali (mengurangi bounce rate).",
    position: "Di bawah judul H1",
    seoTips: "Bounce rate yang tinggi memberi tahu Google bahwa halaman Anda kurang relevan. Pertahankan durasi baca pengunjung."
  },
  {
    tag: "Interactive CTA (Call To Action)",
    title: "Konversi Desain Ramah Aksesibilitas",
    desc: "Tombol ajakan bertindak yang mencolok, responsif, dan mudah diklik baik di komputer maupun di layar ponsel kecil.",
    position: "Di bawah Sub-hero & di footer",
    seoTips: "Pastikan teks tombol deskriptif (misal: 'Mulai Audit Konten Gratis') dan miliki kontras visual tinggi agar dinilai bagus dalam ulasan aksesibilitas Google Lighthouse."
  },
  {
    tag: "Lead Content & Struktur Bagian",
    title: "Hirarki Konten Berjenjang (H2 & H3)",
    desc: "Pecah penjelasan fitur-fitur landing page menjadi bagian-bagian menggunakan tag H2, dan sub-fitur menggunakan tag H3 agar teratur.",
    position: "Tengah Halaman",
    seoTips: "Google membaca susunan heading untuk mengenali poin-poin utama penawaran Anda. Gunakan CSS yang konsisten."
  },
  {
    tag: "Images with ALT Tags",
    title: "Visual Berkecepatan Tinggi (WebP/SVG)",
    desc: "Gunakan format visual generasi terbaru (seperti .svg atau .webp) agar ukuran berkas kecil, dan pastikan setiap gambar memiliki alt text bermakna.",
    position: "Menyebar di visual pendukung",
    seoTips: "Tulis alt text yang alami: alt='Ilustrasi analisis grafik SEO dengan warna neon hijau' bukannya menjejalkan keyword spam."
  },
  {
    tag: "Social Proof & Footer Schema",
    title: "Testimoni & Data Terstruktur (Schema)",
    desc: "Menampilkan testimoni pelanggan, logo partner, serta informasi kontak legal bisnis di bagian bawah.",
    position: "Footer / Bagian Bawah",
    seoTips: "Tambahkan LocalBusiness atau Product Schema Markup (kode JSON-LD) agar ulasan bintang emas atau peta lokasi usaha langsung muncul di hasil Google."
  }
];

export const ARTICLE_SEO_STEPS = {
  title: "Cara Menulis Artikel SEO-Friendly",
  subtitle: "Seni menulis konten yang disukai audiens manusia sekaligus dipahami robot pintar Google.",
  steps: [
    {
      title: "1. Tentukan Satu Kata Kunci Utama & LSI",
      desc: "Sebelum membuka lembar ketikan kosong, tentukan kata kunci utama (Focus Keyword) dan 3-5 kata kunci LSI (sinonim/kata terkait). Misalnya, Focus Keyword Anda adalah 'belajar SEO'. Kata kunci terkaitnya bisa berupa 'cara optimasi website', 'belajar menulis artikel SEO', dan 'pemula SEO'."
    },
    {
      title: "2. Strukturkan Konten Dengan Tag Heading (H1, H2, H3)",
      desc: "Gunakan kerangka berpikir piramida. Judul artikel Anda otomatis menjadi H1. Lalu, bagi pembahasan besar ke dalam sub-bab ber-tag H2. Jika dalam sub-bab H2 ada poin-poin turunan lagi, gunakan tag H3. Jangan meloncat langsung dari H1 ke H3 tanpa H2!"
    },
    {
      title: "3. Distribusikan Kata Kunci Secara Alami (Natural Density)",
      desc: "Tempatkan kata kunci utama di lokasi paling berpengaruh: di paragraf pembuka (100 kata pertama), di salah satu heading H2, di URL artikel, dan di paragraf penutup. Ingat! Kepadatan ideal kata kunci adalah 1% hingga 2.5% saja dari total kata artikel. Menulis berlebihan (keyword stuffing) akan dikenakan hukuman penalti SPAM oleh Google."
    },
    {
      title: "4. optimalkan Panjang Paragraf & Keterbacaan",
      desc: "Gunakan kalimat-kalimat pendek. Hindari membuat paragraf tebal seperti koran lama yang menyulitkan mata pembaca handphone. Usahakan satu paragraf maksimal berisi 3-4 kalimat saja. Sisipkan bullet points, tabel, atau kutipan bergaya cerdas untuk memanjakan visual pembaca."
    },
    {
      title: "5. Tambahkan Tautan Keluar (Outbound) & Tautan Masuk (Inbound)",
      desc: "Tautkan artikel baru Anda ke artikel lama lainnya yang relevan di dalam website Anda sendiri (Internal Link). Selain itu, berikan juga minimal 1-2 link keluar yang mengarah ke website bereputasi tinggi (misalnya ke Wikipedia atau situs berita resmi) sebagai referensi tepercaya atas klaim data Anda."
    }
  ]
};

export const BACKLINK_STRATEGIES = [
  {
    platform: "1. LinkedIn & Twitter/X (Platform Profesional)",
    role: "Otoritas Brand & Trafik Rujukan Cepat",
    strategy: "LinkedIn memiliki Domain Authority (DA) 98+. Bagikan ringkasan artikel Anda di feed LinkedIn pribadi dengan format bercerita (storytelling) yang menarik, lalu sisipkan tautan lengkap website Anda di kolom komentar atau di akhir postingan. Ini memberikan sinyal popularitas instan yang sehat ke mesin pencari Google.",
    greenColors: "text-emerald-400 bg-emerald-950/40 border-emerald-900/60"
  },
  {
    platform: "2. Medium / Substack / Dev.to (Web 2.0 Blogging Hub)",
    role: "Otoritas Tinggi Melalui Konten Sindikasi",
    strategy: "Tulis versi ringkas atau kembangkan topik turunan dari artikel utama Anda di platform blogging gratis dengan DA sangat besar ini. Di dalam artikel Medium tersebut, cantumkan internal link dengan teks jangkar (anchor text) yang relevan mengarah kembali ke blog utama Anda. Teknik ini memberikan limpahan aliran kekuatan link (link juice) tepercaya ke website baru Anda.",
    greenColors: "text-green-400 bg-green-950/40 border-green-900/60"
  },
  {
    platform: "3. Pinterest (Visual Backlinking)",
    role: "Backlink Gambar & Lalu-Lintas Berkelanjutan",
    strategy: "Pinterest bertindak seperti mesin pencari visual raksasa. Buat grafik informasi (infografis), mockup landing page, atau pamflet digital bertema artikel Anda menggunakan visual hijau neon yang mencolok. Cari audiens, unggah ke Pinterest, dan pasang URL tujuan langsung ke artikel website Anda. Trafik rujukan dari Pinterest sangat stabil dan tahan lama.",
    greenColors: "text-lime-400 bg-lime-950/40 border-lime-900/60"
  },
  {
    platform: "4. Youtube / Forum Kredibel (Indowebster / Quora / Kaskus)",
    role: "Membangun Relevansi & Solusi Nyata",
    strategy: "Cari pertanyaan di Quora atau diskusi forum hangat yang relevan dengan topik industri Anda. Tulis jawaban edukatif, lengkap, dan tulus memecahkan masalah penanya. Baru setelahnya, sertasikan link website Anda sebagai info bacaan lanjutan gratis. Google sangat menyayangi link kontekstual alami yang benar-benar membantu banyak netizen.",
    greenColors: "text-teal-400 bg-teal-950/40 border-teal-900/60"
  }
];

export const SEO_QUICK_CHECKLIST = [
  { id: 1, text: "Fokus pada 1 kata kunci utama per halaman", done: true },
  { id: 2, text: "Gunakan tag judul H1 hanya satu kali per halaman", done: true },
  { id: 3, text: "Gunakan HTTPS/SSL untuk menjamin keamanan", done: true },
  { id: 4, text: "Tampilan website 100% responsif di handphone", done: true },
  { id: 5, text: "Pastikan speed loading di bawah 2.5 detik", done: true },
  { id: 6, text: "Optimasi semua alt text gambar pendukung", done: true },
  { id: 7, text: "Hindari keyword stuffing (kepadatan kata kunci maksimal 2.5%)", done: true },
];
