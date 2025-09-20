export enum Mode {
  PoseGenerator = 'Pose Generator',
  ProductPhoto = 'Foto Produk',
}

export enum BackgroundOption {
  Minimalist = 'Studio Minimalis',
  Reference = 'Sesuai Referensi',
  Custom = 'Kustom',
  EditBackground = 'Edit Latar',
}

export enum ProductBackgroundOption {
  FamousPlaces = 'Tempat Terkenal',
  ProfessionalStudio = 'Studio Profesional',
  CustomImage = 'Gambar Kustom',
}

export enum PoseCategory {
    Corporate = 'Korporat',
    Casual = 'Kasual',
    Dramatic = 'Dramatis',
    Fun = 'Seru',
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
}