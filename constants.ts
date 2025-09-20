import { FormField, SelectOptions, GObject, Subject, Location, Action, ManualFormData, StopMotionFormData } from './types';

export const bodyShapeOptions = [
    { value: 'Ectomorph (Ramping & Kurus)', label: 'Ectomorph (Ramping & Kurus)' },
    { value: 'Mesomorph (Atletis & Berotot)', label: 'Mesomorph (Atletis & Berotot)' },
    { value: 'Endomorph (Cenderung Berisi)', label: 'Endomorph (Cenderung Berisi)' },
    { value: 'Jam Pasir (Pinggang Ramping)', label: 'Jam Pasir (Pinggang Ramping)' },
    { value: 'Persegi Panjang (Lurus)', label: 'Persegi Panjang (Lurus)' },
    { value: 'Segitiga (Bentuk Pir)', label: 'Segitiga (Bentuk Pir)' },
    { value: 'Segitiga Terbalik (Bahu Lebar)', label: 'Segitiga Terbalik (Bahu Lebar)' },
    { value: 'Kurus', label: 'Kurus' },
    { value: 'Gemuk', label: 'Gemuk' },
    { value: 'Tinggi & Langsing', label: 'Tinggi & Langsing' },
    { value: 'Pendek & Mungil', label: 'Pendek & Mungil' },
];

export const actionLibraryOptions = [
    // ... (Content from original source)
    {
        genre: 'Aksi & Petualangan',
        actions: [
            'Karakter berlari cepat melewati kerumunan pasar yang padat sambil dikejar.',
            'Sebuah ledakan besar terjadi di latar belakang, karakter melompat menghindar dengan pecahan kaca beterbangan.',
            'Adu tembak intens di sebuah gudang terbengkalai, peluru memantul dari kontainer besi.',
            'Karakter melompati atap gedung satu ke gedung lainnya saat matahari terbenam.',
            'Perkelahian tangan kosong yang brutal di gang sempit saat hujan deras.',
            'Mengendarai mobil dengan kecepatan tinggi di jalanan kota yang padat, menghindari lalu lintas.',
            'Karakter memanjat tebing curam tanpa alat bantu, angin kencang menerpa wajahnya.',
            'Menjinakkan bom dengan keringat dingin bercucuran saat waktu tersisa 10 detik.',
        ]
    },
    {
        genre: 'Superhero',
        actions: [
            'Karakter melesat terbang ke langit, memecah awan.',
            'Superhero melayang di atas kota, jubahnya berkibar ditiup angin.',
            'Mendarat dengan benturan keras di aspal, menciptakan kawah kecil.',
            'Menembakkan sinar energi dari mata atau tangan saat melayang.',
            'Terbang dengan kecepatan super di antara gedung-gedung pencakar langit.',
            'Mengangkat mobil atau objek berat lainnya sambil melayang di udara.',
        ]
    },
    {
        genre: 'Koreografi Pertarungan',
        actions: [
            'Adu tendangan cepat dan tangkisan tangan dalam gaya silat.',
            'Karakter menggunakan pisau untuk menangkis serangan, diakhiri dengan kuncian.',
            'Perkelahian di lorong sempit, menggunakan dinding untuk memantul dan menyerang.',
            'Gerakan akrobatik mengelak dari serangan, diakhiri dengan tendangan memutar di udara.',
            'Karakter menjatuhkan lawan dengan teknik bantingan judo yang presisi.',
            'Pertarungan jarak dekat yang intens menggunakan siku dan lutut (gaya Muay Thai).',
            'Karakter melucuti senjata lawan dalam gerakan CQC (Close Quarters Combat) yang cepat dan efisien.',
            'Adu pedang yang intens di atas jembatan sempit, bilah pedang beradu menciptakan percikan api.',
            'Karakter menghancurkan meja kayu untuk dijadikan senjata darurat.',
            'Satu karakter melawan banyak musuh sekaligus, menggunakan gerakan memutar untuk menyerang ke segala arah.',
            'Pukulan brutal yang mematahkan tulang, diikuti dengan bantingan keras ke lantai.',
            'Menggunakan teknik kuncian sendi (joint lock) untuk melumpuhkan lawan tanpa membunuhnya.',
        ]
    },
    {
        genre: 'Alam Sinematik',
        actions: [
            'Sapuan ombak perlahan di tepi pantai saat matahari terbenam.',
            'Daun-daun maple berguguran dengan anggun di hutan musim gugur.',
            'Sinar matahari menembus kanopi hutan lebat, menciptakan pilar-pilar cahaya.',
            'Kepingan salju turun dengan lembut di malam yang hening.',
            'Tetesan embun pagi berkilauan di atas jaring laba-laba.',
            'Aliran sungai yang deras melewati bebatuan di pegunungan.',
            'Padang rumput bergoyang ditiup angin sepoi-sepoi di bawah langit biru.',
            'Kilat menyambar di kejauhan saat badai mendekat.'
        ]
    },
     {
        genre: 'Horor & Thriller',
        actions: [
            'Karakter berjalan perlahan di koridor rumah sakit jiwa yang gelap hanya dengan cahaya senter yang berkedip-kedip.',
            'Pintu terbanting menutup dengan sendirinya di belakang karakter, meninggalkan kegelapan total.',
            'Sebuah bayangan humanoid yang panjang dan kurus bergerak cepat di sudut mata karakter.',
            'Karakter bersembunyi di bawah tempat tidur, menahan napas sambil mendengar langkah kaki yang diseret mendekat.',
            'Menemukan tulisan "LARI" di cermin kamar mandi yang berembun, yang ditulis dari sisi lain.',
            'TV tiba-tiba menyala dengan gambar statis dan suara bisikan yang tidak jelas.',
            'Karakter menoleh ke belakang dan melihat sosok mengerikan berdiri diam di ujung lorong, lalu menghilang saat lampu berkedip.',
            'Berlari ketakutan melewati hutan berkabut di tengah malam, dengan suara ranting patah di belakangnya.',
        ]
    },
    {
        genre: 'Drama & Romantis',
        actions: [
            'Dua karakter bertatapan intens di tengah hujan, wajah mereka basah oleh air mata dan air hujan.',
            'Karakter menangis tersedu-sedu sambil memeluk sebuah foto lama yang sudah pudar.',
            'Sebuah pelukan perpisahan yang emosional di stasiun kereta yang ramai, saat kereta mulai bergerak.',
            'Karakter tertawa lepas bersama pasangannya di taman bunga saat senja.',
            'Menulis surat perpisahan dengan tangan gemetar dan berlinang air mata di meja kayu tua.',
            'Karakter menjatuhkan cangkir kopi hingga pecah berkeping-keping setelah mendengar berita mengejutkan melalui telepon.',
            'Berjalan sendirian di sepanjang pantai saat matahari terbenam, ombak menyapu jejak kakinya.',
            'Pertengkaran hebat yang berakhir dengan salah satu karakter membanting pintu dan pergi.',
        ]
    },
    {
        genre: 'Misteri & Investigasi',
        actions: [
            'Detektif menemukan petunjuk tersembunyi di balik sebuah lukisan tua yang berdebu.',
            'Menyorotkan senter ke peta kuno di atas meja, mengikuti jejak misterius dengan jarinya.',
            'Menginterogasi saksi dengan tatapan tajam di sebuah ruangan remang-remang yang penuh asap rokok.',
            'Membuka laci rahasia di perpustakaan dan menemukan sebuah buku harian tua yang terikat kulit.',
            'Menyatukan sobekan-sobekan foto di atas meja untuk mengungkap wajah sang pelaku.',
            'Karakter menyelinap masuk ke kantor yang gelap, mencari dokumen di lemari arsip.',
            'Menggunakan kaca pembesar untuk memeriksa detail kecil di tempat kejadian perkara.',
            'Menemukan pesan rahasia yang ditulis dengan tinta tak terlihat di selembar kertas kosong.',
        ]
    },
    {
        genre: 'Komedi',
        actions: [
            'Karakter terpeleset kulit pisang dan jatuh dengan gerakan slow-motion yang dramatis.',
            'Mencoba memasak pancake dan secara tidak sengaja melemparkannya hingga menempel di langit-langit.',
            'Karakter secara tidak sengaja memakai dua sepatu yang berbeda jenis ke sebuah pertemuan penting.',
            'Reaksi wajah yang berlebihan saat mencoba makanan yang sangat asam, bibir mengerut.',
            'Terjebak dalam situasi canggung dengan calon mertua, sambil mencoba menyembunyikan seekor kucing di dalam jaket.',
            'Berusaha keras menyembunyikan hadiah ulang tahun yang besar di belakang punggungnya.',
            'Tarian aneh dan lucu di dalam lift saat mengira tidak ada yang melihat, lalu pintu terbuka.',
            'Karakter berbicara dengan mulut penuh makanan saat mencoba memberikan pidato penting.',
        ]
    },
    {
        genre: 'Sci-Fi & Fantasi',
        actions: [
            'Karakter mengaktifkan pedang laser (lightsaber) dengan suara mendesis di tengah hujan asteroid.',
            'Sebuah portal magis berwarna ungu terbuka di dinding, memperlihatkan dunia fantasi yang subur.',
            'Karakter mengangkat sebuah mobil dengan kekuatan telekinesis, matanya bersinar biru.',
            'Mengendarai pesawat luar angkasa melewati cincin planet yang berkilauan.',
            'Transformasi menyakitkan menjadi manusia serigala di bawah cahaya bulan purnama.',
            'Berinteraksi dengan antarmuka holografik 3D yang melayang di udara.',
            'Merapal mantra sihir dengan gerakan tangan yang rumit, menciptakan bola api di telapak tangannya.',
            'Menemukan artefak kuno yang bersinar dengan energi misterius, menyebabkan tanah di sekitarnya melayang.',
        ]
    }
];

export const subjectFormFields: FormField[] = [
    { label: 'Detail Subjek', type: 'heading' },
    { label: 'Nama', name: 'name', type: 'text', required: true, tooltip: "Nama panggilan atau sebutan untuk subjek ini. Akan digunakan untuk referensi." },
    { label: 'Gender', name: 'gender', type: 'text', tooltip: "Contoh: Laki-laki, Perempuan, Non-biner." },
    { label: 'Usia', name: 'age', type: 'number', tooltip: "Usia subjek dalam tahun. Mempengaruhi penampilan fisik." },
    { label: 'Negara', name: 'country', type: 'text', tooltip: "Asal negara subjek dapat mempengaruhi penampilan dan pakaian." },
    { label: 'Rincian Fisik', type: 'heading' },
    { label: 'Tinggi Badan', name: 'height', type: 'text', tooltip: "Tinggi badan subjek. Contoh: 175 cm, 'Tinggi'." },
    { label: 'Berat Badan', name: 'weight', type: 'text', tooltip: "Berat badan subjek. Contoh: 70 kg, 'Ramping'." },
    { label: 'Bentuk Tubuh', name: 'bodyShape', type: 'select', options: bodyShapeOptions, defaultOption: "Pilih Bentuk Tubuh", tooltip: "Pilih bentuk tubuh yang paling mendekati deskripsi subjek Anda." },
    { label: 'Deskripsi Wajah & Ekspresi', name: 'faceDescription', type: 'textarea', placeholder: 'Contoh: Wajah oval dengan rahang tegas, tatapan mata yang tajam...', tooltip: "Jelaskan detail wajah seperti bentuk, mata, hidung, dan ekspresi dominan." },
    { label: 'Deskripsi Rambut', name: 'hairDescription', type: 'textarea', placeholder: 'Contoh: Rambut panjang bergelombang berwarna cokelat gelap...', tooltip: "Jelaskan gaya, warna, dan kondisi rambut subjek." },
    { label: 'Deskripsi Pakaian & Alas Kaki', name: 'clothingDescription', type: 'textarea', placeholder: 'Contoh: Mengenakan kaos putih pudar dengan celana jeans biru...', tooltip: "Deskripsikan pakaian yang dikenakan subjek dari atas hingga bawah, termasuk gaya dan kondisi." },
    { label: 'Deskripsi Aksesori', name: 'accessoryDescription', type: 'textarea', placeholder: 'Contoh: Memakai gelang emas sederhana di pergelangan tangan kiri...', tooltip: "Sebutkan aksesori yang dikenakan subjek, seperti perhiasan, topi, atau tas." },
];

export const objectFormFields: FormField[] = [
    { label: 'Identifikasi Objek', type: 'heading' },
    { label: 'Nama Objek', name: 'name', type: 'text', required: true, tooltip: "Nama yang jelas dan deskriptif untuk objek ini. Contoh: 'Pedang Kuno Bercahaya'." },
    { label: 'Kategori', name: 'category', type: 'text', placeholder: 'Contoh: Kendaraan, Perabotan, Elektronik', tooltip: "Kategori umum dari objek. Contoh: Senjata, Perabotan, Alat Elektronik." },
    { label: 'Era / Gaya Desain', name: 'era_style', type: 'text', placeholder: 'Contoh: Antik, Modern, Futuristik, Steampunk', tooltip: "Tentukan periode waktu atau gaya visual objek, seperti 'Victoria', 'Cyberpunk', atau 'Art Deco'." },
    
    { label: 'Atribut Fisik', type: 'heading' },
    { label: 'Warna Dominan', name: 'mainColor', type: 'text', tooltip: "Warna yang paling menonjol pada objek." },
    { label: 'Warna Sekunder', name: 'secondaryColor', type: 'text', tooltip: "Warna tambahan atau aksen pada objek." },
    { label: 'Bahan Utama', name: 'material', type: 'text', placeholder: 'Contoh: Kayu Jati, Baja Tahan Karat, Kaca', tooltip: "Material utama akan sangat mempengaruhi penampilan dan refleksi cahaya objek." },
    { label: 'Tekstur Permukaan', name: 'texture', type: 'text', placeholder: 'Contoh: Halus mengkilap, Kasar berkarat, Berbulu', tooltip: "Rasakan permukaan objek. Contoh: Halus, Kasar, Berkarat, Berbulu." },
    { label: 'Kondisi', name: 'condition', type: 'select', options: [
        { value: 'Baru', label: 'Baru / Sempurna' },
        { value: 'Sedikit Usang', label: 'Sedikit Usang' },
        { value: 'Usang / Tua', label: 'Usang / Tua' },
        { value: 'Rusak', label: 'Rusak / Patah' },
        { value: 'Misterius', label: 'Misterius / Aneh' }
    ], defaultOption: 'Pilih Kondisi Objek', tooltip: "Kondisi objek akan menambah detail cerita pada prompt." },
    { label: 'Ukuran Relatif', name: 'size', type: 'text', placeholder: 'Contoh: Sebesar genggaman tangan, 2 meter, Raksasa', tooltip: "Ukuran objek relatif terhadap lingkungan atau manusia. Contoh: 'Sebesar genggaman tangan', 'Setinggi mobil'." },
    { label: 'Bentuk Dasar', name: 'shape', type: 'text', placeholder: 'Contoh: Kotak, Bulat, Tidak Beraturan', tooltip: "Bentuk geometris dasar dari objek. Contoh: Bulat, Kotak, Silinder, Tidak Beraturan." },

    { label: 'Fungsional & Interaktif', type: 'heading' },
    { label: 'Fungsi Utama', name: 'function', type: 'text', placeholder: 'Contoh: Untuk menulis, sebagai alat transportasi', tooltip: "Tujuan atau kegunaan utama dari objek ini." },
    { label: 'Bagian Interaktif', name: 'interactiveParts', type: 'text', placeholder: 'Contoh: Tombol, layar sentuh, gagang pintu', tooltip: "Bagian dari objek yang dapat berinteraksi, seperti tombol, tuas, atau layar." },
    { label: 'Status Saat Ini', name: 'currentState', type: 'text', placeholder: 'Contoh: Menyala, mati, terbuka, tertutup', tooltip: "Status atau kondisi operasional objek saat ini. Contoh: Menyala, Terbuka, Rusak." },

    { label: 'Detail Atmosferik', type: 'heading' , tooltip: "Detail ini membantu AI memahami bagaimana objek berinteraksi dengan lingkungan sekitarnya."},
    { label: 'Cahaya yang Dipancarkan', name: 'emittedLight', type: 'text', placeholder: 'Contoh: Tidak ada, cahaya neon biru redup', tooltip: "Jelaskan cahaya yang mungkin dipancarkan oleh objek, termasuk warna dan intensitasnya." },
    { label: 'Suara yang Dihasilkan', name: 'emittedSound', type: 'text', placeholder: 'Contoh: Hening, dengungan pelan, detak jam', tooltip: "Jelaskan suara yang mungkin dihasilkan objek, bahkan jika itu adalah keheningan." },

    { label: 'Deskripsi Tambahan', type: 'heading' },
    { label: 'Ciri Khas / Keunikan', name: 'uniqueFeatures', type: 'textarea', placeholder: 'Contoh: Ada ukiran naga di sisinya, retakan di sudut kiri atas', tooltip: "Jelaskan detail spesifik yang membuat objek ini unik. Ini sangat membantu AI dalam visualisasi." },
    { label: 'Sejarah / Latar Belakang Singkat', name: 'history', type: 'textarea', placeholder: 'Contoh: Benda ini adalah warisan turun-temurun', tooltip: "Latar belakang singkat atau cerita asal-usul objek yang dapat menambah konteks." },
];

export const locationFormFields: FormField[] = [
    { label: 'Detail Lokasi', type: 'heading' },
    { label: 'Nama Lokasi', name: 'name', type: 'text', required: true, placeholder: 'Contoh: Ruang Takhta Kastil Gotik', tooltip: "Nama yang deskriptif dan imajinatif untuk lokasi. Contoh: 'Pasar Malam Cyberpunk'." },
    { label: 'Atmosfer / Suasana', name: 'atmosphere', type: 'text', placeholder: 'Contoh: Megah, Gelap, Misterius', tooltip: "Deskripsikan perasaan atau mood dari lokasi ini." },
    { label: 'Elemen Kunci', name: 'keyElements', type: 'textarea', placeholder: 'Contoh: Jendela kaca patri besar, pilar batu, singgasana berukir', tooltip: "Sebutkan elemen-elemen penting yang mendefinisikan lokasi ini, misal: 'singgasana emas, jendela kaca patri, pilar-pilar batu raksasa'." },
];

export const actionFormFields: FormField[] = [
    { label: 'Detail Aksi', type: 'heading' },
    { label: 'Deskripsi Aksi', name: 'name', type: 'textarea', required: true, placeholder: 'Contoh: Karakter melompati atap gedung...', tooltip: "Tuliskan deskripsi aksi yang sinematik, contoh: 'Karakter melompati atap gedung saat matahari terbenam.'" },
    { label: 'Genre', name: 'genre', type: 'select', options: actionLibraryOptions.map(g => ({ value: g.genre, label: g.genre })), defaultOption: 'Pilih Genre', tooltip: "Pilih genre yang paling sesuai untuk mengkategorikan aksi ini." },
];

export const initialSubjectFormData: Omit<Subject, 'id'> = {
    name: '', gender: '', age: '', country: '',
    faceDescription: '', hairDescription: '',
    clothingDescription: '', accessoryDescription: '',
    height: '', weight: '', bodyShape: ''
};

export const initialObjectFormData: Omit<GObject, 'id'> = {
    name: '', category: '', era_style: '',
    mainColor: '', secondaryColor: '', material: '', texture: '',
    condition: '', size: '', shape: '',
    function: '', interactiveParts: '', currentState: '',
    emittedLight: '', emittedSound: '',
    uniqueFeatures: '', history: ''
};

export const initialLocationFormData: Omit<Location, 'id'> = {
    name: '', atmosphere: '', keyElements: '',
};

export const initialActionFormData: Omit<Action, 'id'> = {
    name: '', genre: '',
};

export const createInitialManualFormData = (): Omit<ManualFormData, 'scene'> & { scene: Omit<ManualFormData['scene'], 'id'> & { id?: string } } => ({
    visualStyle: '', mood: '', lighting: '', cameraTypeAndLens: '', typeShot: '', 
    location: { name: '', atmosphere: '', keyElements: '' }, 
    time: '', weather: '', additionalVisualDetails: '',
    mainCharacterId: '', supportingCharacterIds: [], extrasDescription: '',
    scene: { duration: '', description: '', cameraMovement: '', animationFx: '', cgiFx: '', sceneSequence: [], objects: [] },
});

export const createInitialStopMotionFormData = (): Omit<StopMotionFormData, 'actions'> & { actions: Omit<StopMotionFormData['actions'][0], 'id'>[] } => ({
    visualStyle: '', mood: '', 
    location: { name: '', atmosphere: '', keyElements: '' }, 
    time: '', weather: '', mainCharacterId: '',
    actions: [{ description: '', duration: '2', cameraMovement: '' }]
});

export const cameraTypeAndLensOptions: SelectOptions = [
    {
        label: "Kamera Sinema Digital",
        options: [
            { value: "ARRI Alexa Mini LF with Signature Prime 50mm lens", label: "ARRI Alexa Mini LF (Sinematik Klasik)" },
            { value: "RED Komodo 6K with Canon CN-E 35mm lens", label: "RED Komodo 6K (Indie & Aksi)" },
            { value: "Sony VENICE 2 with Angenieux Optimo 24-290mm zoom lens", label: "Sony VENICE 2 (Produksi Besar & Zoom)" },
        ]
    },
    {
        label: "Kamera Mirrorless & DSLR",
        options: [
            { value: "Sony A7S III with G-Master 24-70mm lens", label: "Sony A7S III (Low-Light & Cepat)" },
            { value: "Canon EOS R5 with RF 50mm f/1.2 lens", label: "Canon EOS R5 (Artistik & Bokeh)" },
        ]
    },
    {
        label: "Gaya Spesifik & Vintage",
        options: [
            { value: "16mm Arriflex film camera with vintage Cooke lens", label: "16mm Film Camera (Nostalgia & Retro)" },
            { value: "8mm Kodak film camera", label: "8mm Film Camera (Gaya Home Video)" },
            { value: "DJI Ronin 4D (Gimbal Camera)", label: "DJI Ronin 4D (Gerakan Super Mulus)" },
        ]
    },
    {
        label: "Lensa & Gaya Spesifik",
        options: [
             { value: "Shot with a fisheye lens, creating a wide, distorted, hemispherical image", label: "Lensa Fisheye (Distorsi Lebar)" }
        ]
    }
];

export const angleShotOptions: SelectOptions = [
    { value: 'Eye-Level Shot', label: 'Eye-Level Shot (Normal)' },
    { value: 'High-Angle Shot', label: 'High-Angle Shot (Dari Atas)' },
    { value: 'Low-Angle Shot', label: 'Low-Angle Shot (Dari Bawah)' },
    { value: 'Dutch Angle / Canted Angle', label: 'Dutch Angle (Miring)' },
    { value: 'Over-the-Shoulder Shot', label: 'Over-the-Shoulder Shot' },
    { value: 'Point of View (POV) Shot', label: 'Point of View (POV) Shot' },
];

export const typeShotOptions: SelectOptions = [
    {
        label: "Wide Shots (Establishing)",
        options: [
            { value: 'Extreme Wide Shot', label: 'Extreme Wide Shot (Menunjukkan skala besar)' },
            { value: 'Long Shot / Wide Shot', label: 'Long Shot / Wide Shot (Menunjukkan seluruh subjek & lingkungan)' },
            { value: 'Full Shot', label: 'Full Shot (Menunjukkan seluruh tubuh karakter)' },
        ]
    },
    {
        label: "Medium Shots (Interaction)",
        options: [
            { value: 'Medium Long Shot / Cowboy Shot', label: 'Medium Long Shot (Dari atas kepala hingga paha)' },
            { value: 'Medium Shot', label: 'Medium Shot (Dari atas kepala hingga pinggang)' },
            { value: 'Medium Close-Up', label: 'Medium Close-Up (Dari atas kepala hingga dada)' },
        ]
    },
    {
        label: "Close-Up Shots (Emotion & Detail)",
        options: [
            { value: 'Close-Up', label: 'Close-Up (Hanya wajah)' },
            { value: 'Extreme Close-Up', label: 'Extreme Close-Up (Detail spesifik, misal: mata)' },
            { value: 'Insert Shot', label: 'Insert Shot (Detail objek penting)' },
        ]
    }
];

export const languageOptions: SelectOptions = [
    { value: 'Indonesia', label: 'Indonesia' }, { value: 'Inggris', label: 'Inggris' },
    { value: 'Jepang', label: 'Jepang' }, { value: 'Korea', label: 'Korea' },
    { value: 'Tanpa Bahasa', label: 'Tanpa Bahasa (Hanya Gerakan)' },
];

export const emotionAndIntonationOptions: SelectOptions = [
    {
        label: "Emosi Positif",
        options: [
            { value: "Gembira (Joyful)", label: "Gembira (Joyful): Penuh semangat dan tawa." },
            { value: "Bersemangat (Excited)", label: "Bersemangat (Excited): Cepat, antusias, dan penuh energi." },
            { value: "Tenang & Bahagia (Content)", label: "Tenang & Bahagia (Content): Lembut, santai, dan penuh kepuasan." },
            { value: "Penuh Harap (Hopeful)", label: "Penuh Harap (Hopeful): Optimistis dan ringan." },
            { value: "Terkejut & Senang (Pleasantly Surprised)", label: "Terkejut & Senang (Pleasantly Surprised): Nada sedikit naik dengan rasa tak percaya yang positif." },
            { value: "Menggoda (Flirtatious/Teasing)", label: "Menggoda (Flirtatious/Teasing): Main-main dan sedikit berbisik." }
        ]
    },
    {
        label: "Emosi Negatif",
        options: [
            { value: "Marah & Membentak (Angry/Shouting)", label: "Marah & Membentak (Angry/Shouting): Keras, cepat, dan tegas." },
            { value: "Frustrasi (Frustrated)", label: "Frustrasi (Frustrated): Sedikit menggeram, nada tertekan." },
            { value: "Sedih & Terisak (Sad/Sobbing)", label: "Sedih & Terisak (Sad/Sobbing): Lambat, suara bergetar, dan pecah." },
            { value: "Putus Asa (Desperate)", label: "Putus Asa (Desperate): Cepat, memohon, dengan nada tinggi." },
            { value: "Takut & Terengah-engah (Fearful/Gasping)", label: "Takut & Terengah-engah (Fearful/Gasping): Berbisik, cepat, dan napas tersengal-sengal." },
            { value: "Cemas & Gugup (Anxious/Nervous)", label: "Cemas & Gugup (Anxious/Nervous): Suara sedikit bergetar, tempo tidak beraturan." }
        ]
    },
    {
        label: "Netral & Informatif",
        options: [
            { value: "Normal & Datar (Neutral/Flat)", label: "Normal & Datar (Neutral/Flat): Tanpa emosi yang jelas, seperti membaca berita." },
            { value: "Penasaran & Bertanya (Curious/Questioning)", label: "Penasaran & Bertanya (Curious/Questioning): Nada naik di akhir kalimat." },
            { value: "Berbisik (Whispering)", label: "Berbisik (Whispering): Sangat pelan dan lirih." },
            { value: "Tegas & Memerintah (Authoritative/Commanding)", label: "Tegas & Memerintah (Authoritative/Commanding): Jelas, kuat, dan tidak ragu-ragu." },
            { value: "Menjelaskan (Explanatory)", label: "Menjelaskan (Explanatory): Tempo sedang, artikulasi jelas." }
        ]
    },
    {
        label: "Kompleks & Subtil",
        options: [
            { value: "Sarkastik (Sarcastic)", label: "Sarkastik (Sarcastic): Nada yang berlawanan dengan arti kata." },
            { value: "Sinis (Cynical)", label: "Sinis (Cynical): Sedikit mengejek dan tidak percaya." },
            { value: "Ragu-ragu (Hesitant)", label: "Ragu-ragu (Hesitant): Lambat, dengan banyak jeda singkat." },
            { value: "Lelah & Menghela Napas (Tired/Sighing)", label: "Lelah & Menghela Napas (Tired/Sighing): Lambat, nada rendah, dan terdengar berat." },
            { value: "Misterius (Mysterious)", label: "Misterius (Mysterious): Berbisik dengan tempo lambat." }
        ]
    }
];

export const moodOptions: SelectOptions = [
    { value: 'Bahagia', label: 'Bahagia' },
    { value: 'Sedih', label: 'Sedih' },
    { value: 'Tegang', label: 'Tegang' },
    { value: 'Misterius', label: 'Misterius' },
    { value: 'Romantis', label: 'Romantis' },
    { value: 'Horor', label: 'Horor' },
    { value: 'Komedi', label: 'Komedi' },
    { value: 'Aksi', label: 'Aksi' },
    { value: 'Petualangan', label: 'Petualangan' },
    { value: 'Fantasi', label: 'Fantasi' },
    { value: 'Ilmiah', label: 'Ilmiah' }
];

export const fullCameraMovementOptions: SelectOptions = [
    {
        label: "Orbit / Arcs",
        options: [
            { value: "Matrix-style bullet time 360 orbit, camera rotates smoothly around the subject in slow motion, continuous cinematic motion, no static angles.", label: "Orbit Bullet Time (Gaya Matrix)" },
            { value: "Camera orbiting 180° from left to right around the subject, maintaining medium close-up focus.", label: "Orbit 180° Mengelilingi Subjek" },
            { value: "Full 360-degree orbit around the character, starting from front view -> circling smoothly -> ending back view.", label: "Orbit 360° Penuh Mengelilingi Karakter" },
            { value: "Arc shot moving from right to left around the subject.", label: "Arc Left (Busur ke Kiri)" },
            { value: "Arc shot moving from left to right around the subject.", label: "Arc Right (Busur ke Kanan)" },
            { value: "Lazy Susan shot, camera rotating on a turntable platform around a central object.", label: "Lazy Susan (Platform Berputar)" },
            { value: "Overhead orbit circling above the character, bird’s-eye 360 rotation.", label: "Orbit Overhead 360°" }
        ]
    },
    {
        label: "Tracking / Follow",
        options: [
            { value: "Tracking shot following the character from behind at walking pace, handheld feel, smooth cinematic motion.", label: "Tracking Mengikuti dari Belakang" },
            { value: "Camera tracks alongside the subject as it moves, low angle capturing motion in detail.", label: "Tracking di Samping Subjek" },
            { value: "Dolly tracking forward with the character, keeping subject centered in frame, shallow depth of field.", label: "Dolly Tracking Maju Bersama Karakter" },
            { value: "Precise head tracking shot, camera follows the subject's head movements perfectly.", label: "Head Tracking (Mengikuti Kepala)" },
            { value: "Incline shot, camera moving up or down on a tilted surface or track.", label: "Incline Shot (Jalur Miring)" },
        ]
    },
    {
        label: "Crane / Jib / Boom",
        options: [
            { value: "Camera crane up from ground level to high bird’s-eye view, smooth rising motion.", label: "Crane Naik (Dari Bawah ke Atas)" },
            { value: "Boom down shot, descending from top view to close-up of the subject’s face.", label: "Boom Turun (Dari Atas ke Close-Up)" },
            { value: "Sweeping crane motion from left to right, capturing entire environment dynamically.", label: "Crane Menyapu (Kiri ke Kanan)" },
            { value: "Crane shot passing directly over the subject's head.", label: "Crane Over The Head (Melewati Atas Kepala)" },
            { value: "Jib up, the camera arm smoothly moves upwards.", label: "Jib Up (Lengan Jib Naik)" },
            { value: "Jib down, the camera arm smoothly moves downwards.", label: "Jib Down (Lengan Jib Turun)" },
        ]
    },
    {
        label: "Dolly Shots",
        options: [
            { value: "Super dolly in, a very fast and dramatic dolly move towards the subject.", label: "Super Dolly In (Dolly Cepat Masuk)" },
            { value: "Super dolly out, a very fast and dramatic dolly move away from the subject.", label: "Super Dolly Out (Dolly Cepat Keluar)" },
            { value: "Double dolly shot, using two dollies simultaneously for complex parallel movements.", label: "Double Dolly (Dua Dolly)" },
        ]
    },
    {
        label: "Zoom Techniques",
        options: [
            { value: "Dolly zoom on character’s face: camera moves forward while background pulls back, creating dramatic warped perspective.", label: "Dolly Zoom (Efek Vertigo)" },
            { value: "Slow push-in on subject’s face, intense emotional close-up.", label: "Slow Push-In (Zoom Masuk Lambat)" },
            { value: "Pull-out wide shot from character to reveal entire environment.", label: "Pull-Out (Zoom Keluar Lebar)" },
            { value: "Eating zoom, a specific quick zoom in on a character while they are eating.", label: "Eating Zoom (Zoom Saat Makan)" },
            { value: "Yo-yo zoom, a rapid zoom in and out effect.", label: "Yo-Yo Zoom (Zoom Masuk-Keluar Cepat)" },
            { value: "Extreme zoom-in, seemingly going inside a character's mouth.", label: "Mouth In (Zoom Ekstrem ke Mulut)" },
            { value: "Hyper zoom-in passing through an object like a car window into an interior close-up.", label: "Hyper Zoom-In (Menembus Objek)" },
        ]
    },
    {
        label: "Pan & Tilt",
        options: [
            { value: "Slow pan left across the crowded street, revealing subject step by step.", label: "Pan Lambat (Mengungkap Subjek)" },
            { value: "Tilt up from the object's base to the top, cinematic reveal motion.", label: "Tilt Naik (Reveal Objek)" },
            { value: "Whip pan quickly left to right, creating energetic transition.", label: "Whip Pan (Transisi Cepat)" }
        ]
    },
    {
        label: "Handheld / Dynamic",
        options: [
            { value: "Shaky handheld camera, close-up on character, raw documentary feel.", label: "Handheld Goyang (Gaya Dokumenter)" },
            { value: "Dynamic shoulder-cam style movement following fast running through a crowd.", label: "Shoulder-Cam Dinamis (Mengikuti Lari)" },
            { value: "Slight camera wiggle or shake, adding a subtle sense of instability or realism.", label: "Wiggle (Goyangan Kecil)" },
            { value: "Fast camera whip/push-in, simulating a 'buckle up' sensation for high impact.", label: "Buckle Up (Gerakan Cepat & Kencang)" },
            { value: "Snorricam shot, camera fixed on the actor's body, making them static while the background moves.", label: "Snorricam (Kamera di Tubuh Aktor)" },
        ]
    },
    {
        label: "Overhead / Drone / Aerial",
        options: [
            { value: "Top-down overhead shot of the scene, static aerial perspective.", label: "Top-Down Shot (Statis dari Atas)" },
            { value: "Drone shot rising upward, revealing entire environment below.", label: "Drone Naik (Reveal Lingkungan)" },
            { value: "Aerial pullback, an aerial camera moving backwards to reveal more of the scene.", label: "Aerial Pullback (Mundur dari Udara)" },
            { value: "FPV drone shot, fast and agile first-person view from a drone, navigating through tight spaces.", label: "FPV Drone (Sudut Pandang Drone)" },
        ]
    },
    {
        label: "Vehicle Shots",
        options: [
            { value: "Dynamic car chasing sequence, camera follows closely with fast pans and tracks.", label: "Car Chasing (Kejar-kejaran Mobil)" },
            { value: "Car grip shot, camera mounted on the vehicle showing its movement from its perspective.", label: "Car Grip (Kamera di Mobil)" },
            { value: "Fast-paced road rush, low angle, creating a sense of high speed on the road.", label: "Road Rush (Sensasi Kecepatan)" },
        ]
    },
    {
        label: "Stylistic & Glamour",
        options: [
            { value: "Glamour shot, slow, smooth, and elegant camera movement, often for products or fashion.", label: "Glam Shot (Gaya Glamor)" },
            { value: "Hero cam, dramatic low-angle shot that makes the character look heroic.", label: "Hero Cam (Sudut Pandang Pahlawan)" },
            { value: "Behind-the-scenes (BTS) style, giving a documentary, making-of feel.", label: "BTS (Behind The Scenes) Style" },
            { value: "Hyperlapse, a timelapse with significant camera movement over a long distance.", label: "Hyperlapse" },
            { value: "3D rotation effect, camera appears to rotate around an object or scene in 3D space.", label: "3D Rotation" },
            { value: "Slo-mo, an extremely slow and smooth camera movement, emphasizing fine details in the scene", label: "Slo-mo (Gerakan Lambat)" },
        ]
    },
    {
        label: "Special FX & Technical",
        options: [
            { value: "Time freeze bullet time: camera rotates 360 around subject while environment is frozen mid-air.", label: "Time Freeze Bullet Time" },
            { value: "POV (point of view) shot: camera as character’s eyes.", label: "POV (Sudut Pandang Karakter)" },
            { value: "Object POV shot, showing the scene from the perspective of an inanimate object.", label: "Object POV (Sudut Pandang Objek)" },
            { value: "Camera passes through an object (like a wall or window) to enter or exit a scene.", label: "Through Object In / Out (Menembus Objek)" },
            { value: "Specialized timelapse focused on glamour, a person, or a landscape.", label: "Specialized Timelapse (Glam/Human/Landscape)" },
            { value: "Robotic arm shot, extremely precise and dynamic camera movement around the subject.", label: "Robotic Arm Shot" },
            { value: "Rack focus, shifting focus smoothly from one subject to another in the frame.", label: "Rack Focus (Perpindahan Fokus)" },
        ]
    }
];

export const motionEffectOptions: SelectOptions = [
    {
        label: "Aksi & Pertarungan",
        options: [
            { value: 'Bullet Time', label: 'Bullet Time (Gerak lambat ikonik saat peluru melesat)' },
            { value: 'Muzzle Flash & Sparks', label: 'Kilatan Moncong Senjata & Percikan Api' },
            { value: 'Explosion Compositing', label: 'Komposisi Ledakan (Api, asap, dan puing-puing)' },
            { value: 'Glass Shatter Simulation', label: 'Simulasi Kaca Pecah' },
            { value: 'Smoke Trails', label: 'Jejak Asap (Dari roket atau kendaraan cepat)' },
            { value: 'Fight FX Enhancement', label: 'Peningkatan Efek Pertarungan (Pukulan & tendangan)' },
            { value: 'Car Destruction Rig', label: 'Rig Penghancuran Mobil (Penyok, goresan, pecah)' },
            { value: 'Blood Spray', label: 'Semprotan Darah (Realistis atau bergaya)' },
            { value: 'Efek Benturan & Pukulan (Debu, percikan energi)', label: 'Efek Benturan & Pukulan (Debu, percikan energi)' },
            { value: 'Jejak Gerakan Cepat (Motion Trails)', label: 'Jejak Gerakan Cepat (Motion Trails)' },
            { value: 'Efek Slow-Motion pada Momen Kunci', label: 'Efek Slow-Motion pada Momen Kunci' },
            { value: 'Efek Getaran Kamera saat Pukulan Mendarat', label: 'Efek Getaran Kamera saat Pukulan Mendarat' },
            { value: 'Sword Sparks & Clashes', label: 'Percikan Pedang (Saat pedang beradu)' },
            { value: 'Ricocheting Bullets', label: 'Peluru Memantul (Efek peluru memantul dari permukaan)' },
            { value: 'Environmental Damage', label: 'Kerusakan Lingkungan (Dinding retak, tanah hancur akibat benturan)' },
            { value: 'Flying Debris', label: 'Puing-puing Berterbangan (Dari ledakan atau kehancuran)' },
            { value: 'Energy Shield Effect', label: 'Efek Perisai Energi (Saat menahan serangan)' },
        ]
    },
    {
        label: "Sci-Fi & Fantasi",
        options: [
            { value: 'Energy Beams & Blasts', label: 'Sinar & Ledakan Energi' },
            { value: 'Magical Spell Effects (Auras, Sparks)', label: 'Efek Mantra Sihir (Aura, Percikan)' },
            { value: 'Holographic Interface Display', label: 'Tampilan Antarmuka Holografik' },
            { value: 'Teleportation / Warping Effect', label: 'Efek Teleportasi / Warping' },
            { value: 'Force Field Simulation', label: 'Simulasi Medan Gaya' },
            { value: 'Light Speed / Hyperspace Jump', label: 'Efek Kecepatan Cahaya / Lompatan Hyperspace' },
        ]
    },
    {
        label: "Alam & Lingkungan",
        options: [
            { value: 'Atmospheric Fog/Mist', label: 'Kabut / Embun Atmosferik' },
            { value: 'Rain & Water Splashes', label: 'Hujan & Cipratan Air' },
            { value: 'Falling Leaves / Snow', label: 'Daun / Salju Berjatuhan' },
            { value: 'Lens Flare (Anamorphic, Natural)', label: 'Lens Flare (Anamorphic, Natural)' },
            { value: 'Dust Particles in Light Rays', label: 'Partikel Debu di Sinar Cahaya' },
        ]
    },
     {
        label: "Gaya & Transisi",
        options: [
            { value: 'Light Leaks Transition', label: 'Transisi Kebocoran Cahaya (Light Leaks)' },
            { value: 'Glitch & Digital Distortion', label: 'Efek Glitch & Distorsi Digital' },
            { value: 'Film Grain Overlay', label: 'Lapisan Butiran Film (Film Grain)' },
            { value: 'Old Film / VHS Look', label: 'Tampilan Film Tua / VHS' },
            { value: 'Motion Blur (Radial, Directional)', label: 'Motion Blur (Radial, Directional)' },
            { value: 'Low shutter speed effect, creating intentional motion blur and light trails', label: 'Efek Shutter Speed Rendah (Motion Blur)' },
            { value: 'Datamosh', label: 'Datamosh' },
            { value: 'Double Exposure', label: 'Double Exposure (Eksposur Ganda)' },
            { value: 'Collage', label: 'Collage (Kolase)' },
            { value: 'Roll Transition', label: 'Roll Transition (Transisi Gulir)' },
            { value: 'Paparazzi', label: 'Paparazzi (Efek Kilatan Kamera)' },
        ]
    },
    {
        label: "Gerakan Dramatis & Zoom",
        options: [
            { value: 'Earth Zoom Out', label: 'Earth Zoom Out (Zoom Mundur dari Bumi)' },
            { value: 'Eyes In', label: 'Eyes In (Zoom ke Mata)' },
            { value: 'Mouth In', label: 'Mouth In (Zoom ke Mulut)' },
            { value: 'Crash Zoom In + Face Punch', label: 'Crash Zoom In + Pukulan Wajah' },
            { value: 'Look, BOOM!', label: 'Look, BOOM! (Lihat, lalu ledakan)' },
            { value: 'Face Punch', label: 'Face Punch (Pukulan Wajah)' },
            { value: 'Fast Sprint', label: 'Fast Sprint (Lari Cepat)' },
        ]
    },
    {
        label: "Efek Karakter Unik",
        options: [
            { value: 'Ahegao', label: 'Ahegao' },
        ]
    }
];

export const cgiOptions: SelectOptions = [
     {
        label: "Simulasi Fisika & Alam",
        options: [
            { value: 'Pyro Simulation (Api, Asap, Ledakan)', label: 'Simulasi Pyro (Api, Asap, Ledakan)' },
            { value: 'Fluid Simulation (Air, Lava, Cairan Kental)', label: 'Simulasi Cairan (Air, Lava, dll.)' },
            { value: 'Particle System (Hujan, Salju, Debu, Percikan Sihir)', label: 'Sistem Partikel (Hujan, Debu, Sihir)' },
            { value: 'Aerodynamic Simulation (Angin, Turbulensi Udara)', label: 'Simulasi Aerodinamis (Angin, Turbulensi)' },
            { value: 'Cloth Simulation (Jubah, Bendera, Pakaian Berkibar)', label: 'Simulasi Kain (Jubah, Bendera)' },
            { value: 'Rigid Body Dynamics (Puing-puing, Bangunan Runtuh)', label: 'Dinamika Benda Kaku (Puing-puing Runtuh)' },
        ]
    },
    {
        label: "Karakter & Makhluk",
        options: [
            { value: '3D Character Integration', label: 'Integrasi Karakter 3D' },
            { value: 'Digital Doubles', label: 'Pemeran Pengganti Digital (Digital Doubles)' },
            { value: 'Creature Animation (Naga, Monster, Alien)', label: 'Animasi Makhluk (Naga, Monster)' },
            { value: 'Crowd Simulation', label: 'Simulasi Kerumunan (Crowd)' },
            { value: 'Digital Makeup & Prosthetics', label: 'Rias Wajah & Prostetik Digital' },
            { value: 'Black Tears', label: 'Black Tears (Air Mata Hitam)' },
            { value: 'Giant Grab', label: 'Giant Grab (Cengkeraman Raksasa)' },
            { value: 'Hair Style', label: 'Hair Style (Gaya Rambut Animasi)' },
            { value: 'Head Off', label: 'Head Off (Kepala Lepas)' },
            { value: 'Horror Face', label: 'Horror Face (Wajah Mengerikan)' },
            { value: 'Monstrosity', label: 'Monstrosity (Perubahan Jadi Monster)' },
            { value: 'Oni Mask', label: 'Oni Mask (Topeng Oni)' },
            { value: 'Shadow', label: 'Shadow (Bayangan Hidup)' },
            { value: 'Spiders from Mouth', label: 'Spiders from Mouth (Laba-laba dari Mulut)' },
            { value: 'Sunglasses', label: 'Sunglasses (Kacamata Hitam Animasi)' },
            { value: 'Tattoo Animation', label: 'Tattoo Animation (Animasi Tato)' },
            { value: 'Visor X', label: 'Visor X (Pelindung Mata X)' },
        ]
    },
    {
        label: "Lingkungan & Set Extension",
        options: [
            { value: 'Matte Painting & Set Extension', label: 'Matte Painting & Perluasan Set' },
            { value: '3D Environment Creation (Kota, Planet Asing)', label: 'Pembuatan Lingkungan 3D (Kota, Planet)' },
            { value: 'Sky Replacement', label: 'Penggantian Langit (Sky Replacement)' },
            { value: 'Full CG Shot', label: 'Shot Penuh CGI' },
            { value: 'Aquarium', label: 'Aquarium (Efek di dalam Akuarium)' },
            { value: 'Garden Bloom', label: 'Garden Bloom (Taman Mekar)' },
            { value: 'Live Concert', label: 'Live Concert (Suasana Konser)' },
            { value: 'Starship Troopers', label: 'Starship Troopers (Gaya Adegan Perang)' },
        ]
    },
    {
        label: "Elemen & Cuaca",
        options: [
            { value: 'Sand Storm', label: 'Sand Storm (Badai Pasir)' },
            { value: 'Air Element', label: 'Air Element (Elemen Udara)' },
            { value: 'Color Rain', label: 'Color Rain (Hujan Warna-warni)' },
            { value: 'Cotton Cloud', label: 'Cotton Cloud (Awan Kapas)' },
            { value: 'Earth Element', label: 'Earth Element (Elemen Tanah)' },
            { value: 'Fire Element', label: 'Fire Element (Elemen Api)' },
            { value: 'Flood', label: 'Flood (Banjir)' },
            { value: 'Freezing', label: 'Freezing (Membeku)' },
            { value: 'Northern Lights', label: 'Northern Lights (Aurora)' },
            { value: 'Water Element', label: 'Water Element (Elemen Air)' },
        ]
    },
    {
        label: "Ledakan & Kehancuran",
        options: [
            { value: 'Building Explosion', label: 'Building Explosion (Ledakan Gedung)' },
            { value: 'Car Explosion', label: 'Car Explosion (Ledakan Mobil)' },
            { value: 'Car Chasing + Building Explosion', label: 'Car Chasing + Building Explosion' },
            { value: 'Clone Explosion', label: 'Clone Explosion (Ledakan Klon)' },
            { value: 'Disintegration', label: 'Disintegration (Hancur Lebur)' },
            { value: 'Explosion', label: 'Explosion (Ledakan Umum)' },
            { value: 'Firework', label: 'Firework (Kembang Api)' },
            { value: 'Head Explosion', label: 'Head Explosion (Ledakan Kepala)' },
            { value: 'Plasma Explosion', label: 'Plasma Explosion (Ledakan Plasma)' },
            { value: 'Powder Explosion', label: 'Powder Explosion (Ledakan Bubuk)' },
            { value: 'Atomic', label: 'Atomic (Ledakan Atom)' },
        ]
    },
    {
        label: "Kekuatan Super & Sihir",
        options: [
            { value: 'Angel Wings', label: 'Angel Wings (Sayap Malaikat)' },
            { value: 'Fire Breathe', label: 'Fire Breathe (Napas Api)' },
            { value: 'Flame On', label: 'Flame On (Tubuh Terbakar Api)' },
            { value: 'Flying + Set on Fire', label: 'Flying + Set on Fire (Terbang Sambil Terbakar)' },
            { value: 'Hero Flight', label: 'Hero Flight (Penerbangan Pahlawan)' },
            { value: 'Innerlight', label: 'Innerlight (Cahaya dari Dalam)' },
            { value: 'Invisible', label: 'Invisible (Tak Terlihat)' },
            { value: 'Levitation', label: 'Levitation (Melayang)' },
            { value: 'Luminous Gaze', label: 'Luminous Gaze (Tatapan Bercahaya)' },
            { value: 'Portal', label: 'Portal (Gerbang Dimensi)' },
            { value: 'Saint Glow', label: 'Saint Glow (Cahaya Suci)' },
            { value: 'Set on Fire', label: 'Set on Fire (Terbakar)' },
            { value: 'Soul Jump', label: 'Soul Jump (Lompatan Jiwa)' },
            { value: 'Thunder God', label: 'Thunder God (Dewa Petir)' },
            { value: 'Thunder God + Levitation', label: 'Thunder God + Levitation' },
            { value: 'Thunder God + Turning Metal', label: 'Thunder God + Turning Metal' },
        ]
    },
    {
        label: "Transformasi & Morphing",
        options: [
            { value: 'Animalization', label: 'Animalization (Berubah jadi Hewan)' },
            { value: 'Gas Transformation', label: 'Gas Transformation (Transformasi Gas)' },
            { value: 'Morphskin', label: 'Morphskin (Kulit Berubah Bentuk)' },
            { value: 'Werewolf', label: 'Werewolf (Transformasi Manusia Serigala)' },
        ]
    },
    {
        label: "Material & Tekstur",
        options: [
            { value: 'Turning Metal', label: 'Turning Metal (Logam Berubah)' },
            { value: 'Melting', label: 'Melting (Meleleh)' },
            { value: 'Turning Metal + Melting', label: 'Turning Metal + Melting' },
            { value: 'Turning Metal + Eyes In', label: 'Turning Metal + Eyes In' },
            { value: 'Diamond', label: 'Diamond (Efek Berlian)' },
            { value: 'Acid', label: 'Acid (Efek Asam)' },
            { value: 'Paint Splash', label: 'Paint Splash (Cipratan Cat)' },
            { value: 'Glowing Fish', label: 'Glowing Fish (Ikan Bercahaya)' },
        ]
    },
    {
        label: "Gaya Visual CGI",
        options: [
            { value: 'Censorship', label: 'Censorship (Efek Sensor)' },
            { value: 'Glam', label: 'Glam (Efek Glamor)' },
            { value: 'Glow Trace', label: 'Glow Trace (Jejak Bercahaya)' },
            { value: 'Illustration Scene', label: 'Illustration Scene (Adegan Ilustrasi)' },
            { value: 'Lens Crack', label: 'Lens Crack (Lensa Retak)' },
            { value: 'Mystification', label: 'Mystification (Efek Mistis)' },
            { value: 'Point Cloud', label: 'Point Cloud (Awan Titik)' },
            { value: 'Polygon', label: 'Polygon (Gaya Poligonal)' },
            { value: 'Wireframe', label: 'Wireframe (Kerangka Digital)' },
            { value: 'X-Ray', label: 'X-Ray (Sinar-X)' },
            { value: '3D Rotation', label: '3D Rotation (Rotasi 3D)' },
        ]
    },
    {
        label: "Efek Spesial & Adegan",
        options: [
            { value: 'Agent Reveal', label: 'Agent Reveal (Penyamaran Terungkap)' },
            { value: 'Balloon', label: 'Balloon (Efek Balon)' },
            { value: 'Buddy', label: 'Buddy (Efek Teman)' },
            { value: 'Duplicate', label: 'Duplicate (Duplikasi Objek/Karakter)' },
            { value: 'Group Photo', label: 'Group Photo (Efek Foto Grup)' },
            { value: 'Money Rain', label: 'Money Rain (Hujan Uang)' },
            { value: 'Pizza Fall', label: 'Pizza Fall (Pizza Jatuh)' },
        ]
    },
     {
        label: "Efek Visual Lainnya",
        options: [
            { value: 'Object Removal / Clean Plate', label: 'Penghapusan Objek / Clean Plate' },
            { value: 'Motion Tracking & Matchmoving', label: 'Pelacakan Gerak & Matchmoving' },
            { value: 'Compositing (Green Screen, Roto)', label: 'Compositing (Green Screen, Rotoscoping)' },
        ]
    }
];

export const locationOptions: SelectOptions = [
    {
        label: "Urban & Kota",
        options: [
            { value: 'Pusat Kota Malam Hari (Neon, Refleksi Basah, Ramai)', label: 'Pusat Kota Malam Hari (Neon, Refleksi Basah, Ramai)' },
            { value: 'Apartemen Penthouse Mewah (Pemandangan Kota, Kaca, Modern)', label: 'Apartemen Penthouse Mewah (Pemandangan Kota, Kaca, Modern)' },
            { value: 'Gang Belakang Kota (Kotor, Grafiti, Remang-remang)', label: 'Gang Belakang Kota (Kotor, Grafiti, Remang-remang)' },
            { value: 'Stasiun Kereta Bawah Tanah (Ramai, Terburu-buru, Cahaya Neon)', label: 'Stasiun Kereta Bawah Tanah (Ramai, Terburu-buru, Cahaya Neon)' },
            { value: 'Kawasan Industri Terbengkalai (Karat, Beton, Sepi)', label: 'Kawasan Industri Terbengkalai (Karat, Beton, Sepi)' },
            { value: 'Atap Gedung Pencakar Langit (Angin, Pemandangan Luas, Senja)', label: 'Atap Gedung Pencakar Langit (Angin, Pemandangan Luas, Senja)' },
        ]
    },
    {
        label: "Alam & Lanskap",
        options: [
            { value: 'Hutan Purba Berkabut (Misterius, Gelap, Liar)', label: 'Hutan Purba Berkabut (Misterius, Gelap, Liar)' },
            { value: 'Puncak Gunung Bersalju (Megah, Terisolasi, Angin Kencang)', label: 'Puncak Gunung Bersalju (Megah, Terisolasi, Angin Kencang)' },
            { value: 'Gurun Pasir Tak Berujung (Panas, Sunyi, Luas)', label: 'Gurun Pasir Tak Berujung (Panas, Sunyi, Luas)' },
            { value: 'Pantai Tropis Terpencil (Pasir Putih, Air Jernih, Senja)', label: 'Pantai Tropis Terpencil (Pasir Putih, Air Jernih, Senja)' },
            { value: 'Pedesaan Asri (Sawah Terasering, Pagi Hari, Damai)', label: 'Pedesaan Asri (Sawah Terasering, Pagi Hari, Damai)' },
            { value: 'Ngarai Sungai Dalam (Deras, Bebatuan, Gema)', label: 'Ngarai Sungai Dalam (Deras, Bebatuan, Gema)' },
            { value: 'Padang Rumput Afrika (Savana, Pohon Akasia, Matahari Terbenam)', label: 'Padang Rumput Afrika (Savana, Pohon Akasia, Matahari Terbenam)' },
        ]
    },
    {
        label: "Interior",
        options: [
            { value: 'Perpustakaan Kuno (Berdebu, Buku Tua, Cahaya Redup)', label: 'Perpustakaan Kuno (Berdebu, Buku Tua, Cahaya Redup)' },
            { value: 'Laboratorium Sains Modern (Steril, Kaca, Cahaya Biru)', label: 'Laboratorium Sains Modern (Steril, Kaca, Cahaya Biru)' },
            { value: 'Kabin Kayu di Hutan (Api Unggun, Hangat, Terpencil)', label: 'Kabin Kayu di Hutan (Api Unggun, Hangat, Terpencil)' },
            { value: 'Ballroom Istana Megah (Lampu Kristal, Lantai Marmer, Mewah)', label: 'Ballroom Istana Megah (Lampu Kristal, Lantai Marmer, Mewah)' },
            { value: 'Ruang Bawah Tanah yang Menyeramkan (Lembab, Gelap, Pipa Berkarat)', label: 'Ruang Bawah Tanah yang Menyeramkan (Lembab, Gelap, Pipa Berkarat)' },
        ]
    },
    {
        label: "Fantasi & Sci-Fi",
        options: [
            { value: 'Kota Alien Futuristik (Teknologi Canggih, Kendaraan Terbang)', label: 'Kota Alien Futuristik (Teknologi Canggih, Kendaraan Terbang)' },
            { value: 'Kerajaan Elf di Hutan (Arsitektur Alam, Cahaya Magis)', label: 'Kerajaan Elf di Hutan (Arsitektur Alam, Cahaya Magis)' },
            { value: 'Planet Vulkanik Tandus (Lava, Batu Hitam, Langit Merah)', label: 'Planet Vulkanik Tandus (Lava, Batu Hitam, Langit Merah)' },
            { value: 'Jembatan Pesawat Luar Angkasa (Hologram, Panel Kontrol, Pemandangan Luar Angkasa)', label: 'Jembatan Pesawat Luar Angkasa (Hologram, Panel Kontrol)' },
            { value: 'Reruntuhan Kuno Bawah Air (Misterius, Cahaya dari Dalam, Kehidupan Laut)', label: 'Reruntuhan Kuno Bawah Air (Misterius, Cahaya dari Dalam)' },
        ]
    },
    {
        label: "Sejarah & Era",
        options: [
            { value: 'Medan Perang Abad Pertengahan (Lumpur, Kabut, Tentara)', label: 'Medan Perang Abad Pertengahan (Lumpur, Kabut, Tentara)' },
            { value: 'Jalanan London Era Victoria (Lampu Gas, Kereta Kuda, Kabut)', label: 'Jalanan London Era Victoria (Lampu Gas, Kereta Kuda, Kabut)' },
            { value: 'Speakeasy Bar Era Larangan (Remang-remang, Asap Rokok, Musik Jazz)', label: 'Speakeasy Bar Era Larangan (Remang-remang, Asap Rokok)' },
            { value: 'Mesir Kuno (Piramida, Pasir, Hieroglif)', label: 'Mesir Kuno (Piramida, Pasir, Hieroglif)' },
        ]
    }
];

export const timeOptions: SelectOptions = [
    { value: 'Pagi', label: 'Pagi' }, { value: 'Siang', label: 'Siang' },
    { value: 'Sore', label: 'Sore' }, { value: 'Malam', label: 'Malam' },
    { value: 'Dini Hari', label: 'Dini Hari' }, { value: 'Senja', label: 'Senja' },
    { value: 'Fajar', label: 'Fajar' }
];

export const weatherOptions: SelectOptions = [
    { value: 'Cerah', label: 'Cerah' }, { value: 'Berawan', label: 'Berawan' },
    { value: 'Hujan', label: 'Hujan' }, { value: 'Badai', label: 'Badai' },
    { value: 'Salju', label: 'Salju' }, { value: 'Berkabut', label: 'Berkabut' },
    { value: 'Berangin', label: 'Berangin' }
];

export const visualStyleOptions: SelectOptions = [
    { value: 'Fotorealistis', label: 'Fotorealistis (Sangat nyata)' },
    { value: 'Sinematik', label: 'Sinematik (Seperti film)' },
    { value: 'Gaya Anime (misal: Studio Ghibli, Makoto Shinkai)', label: 'Gaya Anime (misal: Ghibli, Shinkai)' },
    { value: 'Gaya Disney / Pixar', label: 'Gaya Disney / Pixar' },
    { value: 'Lukisan Cat Air (Watercolor)', label: 'Lukisan Cat Air (Watercolor)' },
    { value: 'Seni Piksel (Pixel Art)', label: 'Seni Piksel (Pixel Art)' },
    { value: 'Stop Motion (Claymation)', label: 'Stop Motion (Claymation)' },
    { value: 'Film Noir (Hitam Putih, Kontras Tinggi)', label: 'Film Noir (Hitam Putih, Kontras Tinggi)' },
    { value: 'Gaya Komik (Comic Book Style)', label: 'Gaya Komik (Comic Book Style)' },
    { value: 'Surealis / Abstrak', label: 'Surealis / Abstrak' },
    { value: 'Vaporwave / Retro-futurism', label: 'Vaporwave / Retro-futurism' },
];

export const lightingOptions: SelectOptions = [
    { value: 'Natural Light (Cahaya Matahari, Siang Hari)', label: 'Cahaya Natural (Siang Hari)' },
    { value: 'Golden Hour (Cahaya hangat saat matahari terbenam/terbit)', label: 'Golden Hour (Senja/Fajar)' },
    { value: 'Blue Hour (Cahaya biru lembut setelah matahari terbenam)', label: 'Blue Hour (Setelah Senja)' },
    { value: 'Overcast (Cahaya lembut saat mendung)', label: 'Mendung (Overcast)' },
    { value: 'High-key Lighting (Terang, minim bayangan, ceria)', label: 'High-key Lighting (Ceria)' },
    { value: 'Low-key Lighting (Gelap, kontras tinggi, dramatis/misterius)', label: 'Low-key Lighting (Dramatis)' },
    { value: 'Rembrandt Lighting (Segitiga cahaya di pipi)', label: 'Rembrandt Lighting' },
    { value: 'Split Lighting (Setengah wajah terang, setengah gelap)', label: 'Split Lighting' },
    { value: 'Backlight / Rim Light (Cahaya dari belakang subjek)', label: 'Backlight / Rim Light' },
    { value: 'Hard Light (Bayangan tajam dan jelas)', label: 'Hard Light (Bayangan Tajam)' },
    { value: 'Soft Light (Bayangan lembut dan menyebar)', label: 'Soft Light (Bayangan Lembut)' },
    { value: 'Neon Lighting (Cahaya dari lampu neon berwarna)', label: 'Cahaya Neon' },
    { value: 'Caustic Lighting (Refleksi cahaya dari air atau kaca)', label: 'Cahaya Kaustik (Refleksi Air)' },
];

export const negativePromptCategories: { [key: string]: string[] } = {
  "Kualitas Rendah": ["low quality", "blurry", "noisy", "grainy", "jpeg artifacts", "distorted", "low-res", "pixelated", "overexposed", "undexposed", "unfocused"],
  "Anatomi Buruk": ["bad anatomy", "extra limbs", "missing limbs", "deformed hands", "fused fingers", "broken legs", "unnatural body twist", "wrong perspective", "disfigured face", "cross-eyed", "asymmetric body"],
  "Gaya & Kesalahan Umum": ["inconsistent lighting", "flat lighting", "oversaturated", "unnatural shadow", "monochrome", "mixed styles", "cartoonish", "sketch style", "text overlay", "watermark", "signature", "logo", "subtitle", "compression artifact"],
  "Lain-lain": ["background clutter", "irrelevant object", "lens flare", "unnatural pose", "stiff motion", "awkward movement", "emotionless face", "frozen frame", "flickering", "jerky animation", "modern clothes", "daylight", "smiling", "crowd", "blood", "hindari distorsi fiskeye", "tanpa lensa sudut lebar yang ekstrem"]
};

export const videoFusionTransitionOptions: SelectOptions = [
    {
        label: "Transformasi & Morfing",
        options: [
            { value: "The first image seamlessly morphs and transforms its shape and features into the second image. The transition should be fluid and organic.", label: "Morfing Halus" },
            { value: "The elements of the first image break apart into geometric shapes (e.g., cubes, triangles) which then fly and reassemble to form the second image.", label: "Pecah & Rakit Ulang Geometris" },
            { value: "The first image transforms into the second as if it were a 3D model being sculpted and reshaped in real-time.", label: "Transformasi 3D (Sculpting)" },
        ]
    },
    {
        label: "Gaya & Digital",
        options: [
            { value: "A digital glitch effect with datamoshing, pixel sorting, and artifacting completely takes over the first image, and as the glitch subsides, the second image is revealed.", label: "Glitch & Datamosh" },
            { value: "The first image pixelates into large blocks of color, which then resolve and sharpen into the second image.", label: "Pixelasi (Pixelate)" },
            { value: "A cinematic film burn effect with light leaks wipes across the screen, revealing the second image from the first.", label: "Film Burn & Light Leaks" },
            { value: "The image transitions as if being fast-forwarded on a VHS tape, complete with scan lines and tracking errors, before settling on the second image.", label: "Efek VHS Rewind/Forward" },
        ]
    },
    {
        label: "Elemen & Partikel",
        options: [
            { value: "The first image dissolves into a thick plume of smoke, which then clears to reveal the second image.", label: "Asap (Smoke)" },
            { value: "The first image bursts into realistic flames, and from the embers and dying fire, the second image emerges.", label: "Api (Fire)" },
            { value: "The first image shatters like glass, and the pieces fly away to reveal the second image behind it.", label: "Pecahan Kaca (Glass Shatter)" },
            { value: "The first image disintegrates into a swirling vortex of sand or dust particles, which then coalesce to form the second image.", label: "Partikel Pasir/Debu" },
            { value: "The first image becomes covered in water droplets or ripples, which then wash away to show the second image.", label: "Air (Water)" }
        ]
    },
     {
        label: "Gerakan & Reveal (Untuk Logo/UI)",
        options: [
            { value: "A clean, corporate-style reveal. The first image slides out of frame to the left while the second image slides in from the right.", label: "Geser (Slide)" },
            { value: "The first image fades out (dissolves) while the second image simultaneously fades in.", label: "Memudar (Fade/Dissolve)" },
            { value: "The transition happens like turning a page in a book or a 3D layer flipping over to reveal the second image on its back.", label: "Balik (Flip/Page Turn)" },
        ]
    },
    {
        label: "Abstrak & Cairan",
        options: [
            { value: "The first image appears to melt and dissolve like liquid metal or ink in water, reforming into the second image.", label: "Meleleh & Larut (Melt & Dissolve)" },
            { value: "The transition is an explosion of colorful paint splatters that cover the first image and then drip away to reveal the second.", label: "Cipratan Cat (Paint Splash)" },
            { value: "The transition uses flowing, organic, ink-bleed-style tendrils that grow from the first image and resolve into the second.", label: "Tinta Menyebar (Ink Bleed)" },
        ]
    }
];
