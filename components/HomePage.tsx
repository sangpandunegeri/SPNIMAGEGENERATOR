import React from 'react';
import { Users, Image, Film, Edit, Camera, Banknote, Layers, HelpCircle, Video, Clapperboard, GitMerge, ClipboardSignature, Wand2 } from 'lucide-react';
import { Page } from '../types';
import FeatureCard from './ui/FeatureCard';

interface HomePageProps {
    setCurrentPage: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-5xl font-extrabold text-blue-400 mb-6 animate-fadeIn">
                PromptGen Suite!
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Ubah Ide Menjadi Sinema. Rancang prompt video yang detail dan terstruktur untuk mengarahkan AI dengan presisi sinematik.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard icon={<Users className="w-8 h-8 text-blue-400" />} title="Asset Builder" description="Buat dan simpan subjek serta objek kustom Anda." onClick={() => setCurrentPage('subjectBuilder')} />
                <FeatureCard icon={<Image className="w-8 h-8 text-green-400" />} title="Image Detector" description="Deteksi prompt dari gambar atau frame video, dan simpan sebagai aset." onClick={() => setCurrentPage('imageDetector')} />
                <FeatureCard icon={<Wand2 className="w-8 h-8 text-yellow-400" />} title="Image Generator" description="Hasilkan gambar dari prompt teks dengan model Imagen." onClick={() => setCurrentPage('imageGenerator')} />
                <FeatureCard icon={<Edit className="w-8 h-8 text-purple-400" />} title="Mode Manual" description="Kontrol penuh atas setiap detail prompt video Anda." onClick={() => setCurrentPage('manualMode')} />
                <FeatureCard icon={<Camera className="w-8 h-8 text-red-400" />} title="One Stop Motion Shot" description="Buat prompt video berurutan dengan mudah." onClick={() => setCurrentPage('stopMotionShot')} />
                <FeatureCard icon={<ClipboardSignature className="w-8 h-8 text-cyan-400" />} title="Pencerita AI" description="Ubah ide cerita menjadi storyboard sinematik instan." onClick={() => setCurrentPage('storyGenerator')} />
                <FeatureCard icon={<Clapperboard className="w-8 h-8 text-pink-400" />} title="Storyboard by Image" description="Buat prompt dari rangkaian gambar keyframe." onClick={() => setCurrentPage('storyboardGenerator')} />
                <FeatureCard icon={<Layers className="w-8 h-8 text-indigo-400" />} title="Penggabung Gambar" description="Gabungkan dua gambar menjadi satu dengan instruksi AI." onClick={() => setCurrentPage('imageFusion')} />
                <FeatureCard icon={<GitMerge className="w-8 h-8 text-lime-400" />} title="Video Fusion" description="Gabungkan dua gambar menjadi video transisi sinematik." onClick={() => setCurrentPage('videoFusion')} />
                <FeatureCard icon={<Video className="w-8 h-8 text-orange-400" />} title="Video Generator" description="Buat video dari teks atau gambar menggunakan VEO." onClick={() => setCurrentPage('videoGenerator')} />
                <FeatureCard icon={<Banknote className="w-8 h-8 text-teal-400" />} title="Bank Prompt" description="Simpan dan kelola koleksi prompt Anda sendiri." onClick={() => setCurrentPage('promptBank')} />
                <FeatureCard icon={<HelpCircle className="w-8 h-8 text-cyan-400" />} title="Bantuan (FAQ)" description="Temukan jawaban dan panduan penggunaan aplikasi." onClick={() => setCurrentPage('help')} />
            </div>
        </div>
    );
};

export default HomePage;