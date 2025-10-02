export enum Mode {
  PoseGenerator = 'Pose Generator',
  ProfilePhoto = 'Foto Profil',
  WeddingPhoto = 'Foto Pernikahan',
  PreWeddingPhoto = 'Foto Pre-wedding',
  ProductPhoto = 'Foto Produk',
}

export enum ImageModel {
  GeminiFlash = 'gemini-2.5-flash-image-preview',
}

export enum BackgroundOption {
  Minimalist = 'Studio Minimalis',
  Reference = 'Sesuai Referensi',
  Custom = 'Kustom',
  EditBackground = 'Edit Latar',
}

// Opsi Profesional untuk Foto Profil
export enum ProfileIndustry {
    Tech = 'Teknologi',
    Creative = 'Kreatif',
    Corporate = 'Korporat',
    Health = 'Kesehatan',
}

export enum ProfileLighting {
    SoftAndFriendly = 'Cahaya Lembut & Ramah',
    DramaticAndBold = 'Cahaya Dramatis & Tegas',
    ModernRingLight = 'Cahaya Cincin Modern',
}

export enum ProfileExpression {
    ConfidentSmile = 'Percaya Diri (Senyum Tipis)',
    FriendlyOpen = 'Ramah dan Terbuka',
    FocusedAuthoritative = 'Fokus dan Berwibawa',
}

// Opsi Profesional untuk Pose Generator
export enum PoseCameraAngle {
    FrontEyeLevel = 'Depan (Sejajar Mata)',
    LowAngle = 'Sudut Rendah',
    HighAngle = 'Sudut Tinggi',
    SideView = 'Tampak Samping',
    BackView = 'Tampak Belakang',
}

// Opsi Profesional untuk Foto Pernikahan (Hari-H)
export enum WeddingTheme {
    ClassicTimeless = 'Klasik & Abadi',
    ModernMinimalist = 'Modern & Minimalis',
    GlamorousBallroom = 'Glamor & Megah',
}

export enum WeddingMoment {
    ExchangingVows = 'Ucap Janji Suci',
    TheFirstKiss = 'Ciuman Pertama',
    WeddingEmbrace = 'Pelukan Pernikahan',
    CelebratoryToast = 'Toast Perayaan',
}

// Opsi Profesional untuk Foto Pre-wedding
export enum PreWeddingTheme {
    BohemianNatural = 'Bohemian & Alam',
    UrbanCityscape = 'Perkotaan Urban',
    RomanticPicnic = 'Piknik Romantis',
    CozyCafe = 'Kafe Nyaman',
}

export enum PreWeddingMoment {
    LaughingTogether = 'Tertawa Lepas Bersama',
    StrollingHandInHand = 'Jalan Bergandengan',
    SharingASecret = 'Berbisik Mesra',
    SpontaneousDance = 'Tarian Spontan',
}

// Opsi Bersama untuk Pernikahan & Pre-wedding
export enum WeddingTimeOfDay {
    GoldenHour = 'Golden Hour (Senja)',
    BlueHour = 'Blue Hour (Setelah Senja)',
    BrightDaylight = 'Siang Hari Cerah',
}

// Opsi Profesional untuk Foto Produk
export enum ProductLighting {
    StandardStudio = 'Studio Standar',
    SideTexture = 'Cahaya Samping (Tekstur)',
    BacklightGlow = 'Cahaya Belakang (Siluet)',
    MacroFocus = 'Fokus Makro (Detail)',
}

export enum ProductBackgroundCategory {
  FamousPlaces = 'Tempat Terkenal',
  ProfessionalStudio = 'Studio Profesional',
  IndoorLifestyle = 'Gaya Hidup Dalam Ruangan',
  OutdoorNatural = 'Alam Terbuka',
  CustomImage = 'Gambar Kustom',
}

export const ProductBackgroundSubOptions: Record<ProductBackgroundCategory, string[]> = {
  [ProductBackgroundCategory.FamousPlaces]: ['Menara Eiffel', 'Times Square', 'Candi Borobudur', 'Tembok Besar Cina', 'Jembatan Golden Gate', 'Colosseum Roma'],
  [ProductBackgroundCategory.ProfessionalStudio]: ['Studio Putih Minimalis', 'Permukaan Marmer Putih', 'Latar Tekstur Beton', 'Kain Linen Bertekstur'],
  [ProductBackgroundCategory.IndoorLifestyle]: ['Dapur Modern', 'Ruang Tamu Nyaman', 'Kantor Rumah Elegan', 'Kamar Tidur Mewah', 'Kafe Bergaya', 'Toko Butik'],
  [ProductBackgroundCategory.OutdoorNatural]: ['Pantai Tropis', 'Pegunungan Bersalju', 'Hutan Rimbun', 'Gurun Pasir Saat Senja'],
  [ProductBackgroundCategory.CustomImage]: [],
};

export enum ProductCategory {
    Makanan = 'Makanan',
    Minuman = 'Minuman',
    Tas = 'Tas',
    Fashion = 'Fashion',
    Elektronik = 'Elektronik',
    Kendaraan = 'Kendaraan',
}

export const ProductEffects: Record<ProductCategory, string[]> = {
    [ProductCategory.Makanan]: ['Uap Panas', 'Tetesan Embun Segar', 'Potongan Melayang', 'Cahaya Berkilau'],
    [ProductCategory.Minuman]: ['Percikan Air', 'Es Batu Beku', 'Gelembung Menyegarkan', 'Uap Dingin'],
    [ProductCategory.Tas]: ['Latar Belakang Abstrak', 'Efek Levitasi', 'Bayangan Dramatis', 'Kilauan Kulit'],
    [ProductCategory.Fashion]: ['Kain Melambai', 'Partikel Berkilau', 'Latar Belakang Cat Air', 'Fokus Lembut'],
    [ProductCategory.Elektronik]: ['Jejak Cahaya Neon', 'Latar Papan Sirkuit', 'Efek Hologram', 'Kilatan Lensa'],
    [ProductCategory.Kendaraan]: ['Jejak Cahaya Kecepatan', 'Percikan Air Realistis', 'Asap Ban Dramatis', 'Pantulan Lingkungan'],
};


export enum PoseCategory {
    FormalProfessional = 'Profesional (Formal)',
    CandidLifestyle = 'Gaya Hidup (Kandid)',
    AthleticAction = 'Aksi (Atletis)',
    CreativeArtistic = 'Artistik (Kreatif)',
    RelaxedCasual = 'Santai (Kasual)',
    PowerfulDynamic = 'Dinamis (Kuat)',
}

export const PoseBackgroundOptions: Record<PoseCategory, string[]> = {
    [PoseCategory.FormalProfessional]: ['Kantor Modern', 'Lobi Perusahaan', 'Ruang Rapat', 'Dinding Polos Arsitektural'],
    [PoseCategory.CandidLifestyle]: ['Jalanan Kota Sibuk', 'Kafe Nyaman', 'Taman Hijau', 'Pasar Lokal'],
    [PoseCategory.AthleticAction]: ['Lintasan Lari', 'Gym Modern', 'Tepi Pantai', 'Lapangan Basket Urban'],
    [PoseCategory.CreativeArtistic]: ['Studio Seni Abstrak', 'Dinding Grafiti Urban', 'Instalasi Cahaya Neon', 'Latar Belakang Tekstur Unik'],
    [PoseCategory.RelaxedCasual]: ['Ruang Tamu Nyaman', 'Taman Belakang Rumah', 'Tangga Apartemen', 'Kedai Kopi Lokal'],
    [PoseCategory.PowerfulDynamic]: ['Atap Gedung Pencakar Langit', 'Latar Belakang Arsitektur Brutalis', 'Gurun Pasir Dramatis', 'Jembatan Gantung'],
};


export enum AttireOption {
    FormalWedding = 'Pakaian Pernikahan Formal',
    Traditional = 'Pakaian Adat',
    CasualChic = 'Kasual Chic',
    AsPerReference = 'Sesuai Referensi',
}

export enum AspectRatio {
    Square = '1:1',
    Portrait = '3:4',
    Widescreen = '16:9',
    Standard = '4:3',
    Tall = '9:16',
}

export interface GeneratedImage {
  id: string;
  src: string;
  label: string;
  status: 'loading' | 'done' | 'error' | 'placeholder';
  errorMessage?: string;
}