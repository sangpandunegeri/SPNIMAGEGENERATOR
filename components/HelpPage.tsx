import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, Send, User, Bot } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';

const faqData = [
    {
        question: "Selamat Datang di PromptGen Suite! Apa ini?",
        answer: "PromptGen Suite adalah perangkat pra-produksi lengkap untuk pembuatan video AI. Anggap saja ini sebagai studio kreatif Anda sebelum menekan tombol 'render'. Tujuannya adalah untuk mengubah ide-ide Anda—tidak peduli seberapa kompleksnya—menjadi instruksi (prompt) yang sangat detail dan terstruktur. Dengan prompt yang baik, AI dapat menghasilkan video dan gambar yang jauh lebih akurat, konsisten, dan sesuai dengan visi sinematik Anda."
    },
    {
        question: "Langkah Pertama: Di mana saya harus memulai?",
        answer: "Langkah paling pertama dan terpenting adalah mengatur Kunci API Anda.\n\n1. Buka halaman **Pengaturan** (ikon gerigi).\n2. Masukkan Kunci API Google Gemini Anda. Anda bisa mendapatkannya dari Google AI Studio.\n3. Klik Simpan.\n\n**Mengapa ini penting?** Semua fitur cerdas di aplikasi ini—mulai dari analisis gambar hingga pembuatan prompt dan video—didukung oleh model AI canggih dari Google. Kunci API Anda adalah akses pribadi Anda untuk menggunakan teknologi tersebut. Kunci ini disimpan dengan aman di penyimpanan lokal browser Anda dan tidak pernah dibagikan."
    },
    {
        question: "Apa itu 'Aset' dan mengapa saya harus menggunakan Asset Builder?",
        answer: "Aset adalah blok bangunan yang dapat digunakan kembali untuk dunia cerita Anda: **Subjek, Objek, Lokasi, dan Aksi**.\n\n**Alur Kerja:** Anda menggunakan **Asset Builder** untuk membuat deskripsi yang sangat detail untuk setiap aset. Contoh: Anda bisa membuat aset 'Subjek' bernama 'Ksatria Bayangan' dengan deskripsi lengkap tentang baju zirah, bekas luka di wajahnya, dan tatapan matanya yang dingin.\n\n**Keuntungannya:**\n- **Konsistensi:** Karakter Anda akan terlihat sama di setiap adegan karena Anda menggunakan deskripsi yang sama persis.\n- **Efisiensi:** Tidak perlu menulis ulang deskripsi yang rumit. Cukup pilih aset dari menu dropdown di halaman pembuatan prompt.\n- **Dunia yang Kaya:** Memungkinkan Anda membangun sebuah perpustakaan karakter dan lokasi yang konsisten untuk proyek jangka panjang."
    },
    {
        question: "Bagaimana cara kerja Image Detector?",
        answer: "Image Detector adalah mata AI Anda. Ini adalah alat analisis visual yang kuat.\n\n**Alur Kerja:**\n1. Unggah gambar apa pun.\n2. AI akan menganalisis konten visualnya dan menulis deskripsi teks (prompt) yang mendetail, seolah-olah mendeskripsikan sebuah adegan film.\n3. **Fitur Unggulan:** Setelah prompt dibuat, Anda dapat secara otomatis **mengekstrak** informasi dari teks tersebut untuk membuat Aset baru. Jika Anda mengunggah foto seseorang, Anda bisa mengklik 'Jadikan Subjek', dan AI akan mengisi formulir Subjek Builder dengan detail yang diamatinya dari gambar."
    },
    {
        question: "Apa perbedaan antara semua mode pembuatan prompt & gambar?",
        answer: "Setiap mode dirancang untuk tujuan yang berbeda:\n\n- **Image Generator**: Titik awal terbaik untuk visual. Ubah ide teks menjadi gambar berkualitas tinggi. Gambar ini kemudian dapat dikirim ke **Video Generator** untuk dianimasikan.\n\n- **Pencerita AI:** Titik awal termudah untuk cerita. Anda hanya memberikan **satu kalimat ide cerita**, dan AI akan secara otomatis menuliskan storyboard multi-adegan yang lengkap dengan deskripsi, tipe shot, dan gerakan kamera.\n\n- **Mode Manual:** Untuk membuat **satu adegan video yang sangat kompleks**. Ini adalah pilihan Anda jika Anda ingin kontrol penuh atas setiap detail dalam satu shot: karakter, dialog, gerakan kamera spesifik, efek visual, pencahayaan, dll.\n\n- **One Stop Motion Shot:** Untuk membuat **urutan beberapa aksi video sederhana** secara berurutan. Cocok untuk membuat prompt animasi langkah-demi-langkah, seperti 'karakter berjalan ke depan, lalu mengambil pedang, lalu mengangkatnya'.\n\n- **Storyboard by Image:** Mode canggih untuk **video multi-adegan yang sinematik berdasarkan gambar**. Anda membangun papan cerita visual dengan mengunggah gambar-gambar *keyframe*, dan AI membantu Anda mendeskripsikan, memodifikasi, dan menghubungkan setiap adegan menjadi satu narasi utuh.\n\n- **Penggabung Gambar:** Alat untuk **mengedit dan menggabungkan dua gambar**. Sempurna untuk melakukan *compositing* (misalnya, menempatkan karakter dari gambar A ke latar belakang gambar B), transfer gaya, atau melakukan *faceswap*.\n\n- **Video Fusion:** Untuk menciptakan **transisi video yang mulus dan sinematik** antara beberapa gambar. Anda menentukan titik awal dan akhir (gambar), dan AI akan menganimasikan 'perjalanan' visual di antara keduanya."
    },
     {
        question: "Bagaimana cara aplikasi mengoptimalkan prompt untuk model video yang berbeda?",
        answer: "Aplikasi ini secara cerdas menyesuaikan format prompt berdasarkan 'Target Model Video' yang Anda pilih di halaman pembuatan prompt (Mode Manual, Stop Motion, dll.).\n\n- **Untuk Google VEO:** Aplikasi menghasilkan prompt yang bersifat naratif dan deskriptif, seperti menceritakan sebuah adegan dalam film. Ini adalah format yang disukai VEO untuk memahami konteks dan nuansa.\n\n- **Untuk Runway ML & Kling:** Aplikasi beralih ke format berbasis kata kunci (keyword-based). Prompt akan lebih padat, fokus pada istilah-istilah kunci yang jelas dan langsung mengenai subjek, aksi, gaya, dan komposisi. Ini sejalan dengan cara model seperti Runway dan Kling menafsirkan instruksi.\n\nPastikan Anda memilih target model yang benar **sebelum** menghasilkan prompt untuk mendapatkan hasil terbaik!"
    },
    {
        question: "Apa fungsi Bank Prompt?",
        answer: "Bank Prompt lebih dari sekadar tempat menyimpan teks. Setiap kali Anda menyimpan sebuah prompt, aplikasi ini juga menyimpan **seluruh konfigurasi dan pengaturan** dari halaman tempat Anda membuatnya.\n\n**Keuntungannya:** Anda dapat mengklik 'Muat' pada prompt lama, dan aplikasi akan membawa Anda kembali ke halaman generator yang sesuai (misalnya, Mode Manual) dan secara otomatis mengisi semua formulir, pilihan karakter, dan pengaturan kamera persis seperti saat Anda menyimpannya. Ini sangat berguna untuk melanjutkan pekerjaan, membuat variasi, atau menggunakan kembali templat yang kompleks."
    },
    {
        question: "Apa fungsi halaman Video Generator?",
        answer: "Ini adalah **tahap akhir** dari seluruh proses. Semua halaman lain bertugas untuk *mempersiapkan* prompt. Halaman Video Generator bertugas untuk *mengeksekusinya*.\n\n**Alur Kerja:** Anda membawa sebuah prompt ke halaman ini (baik dengan menyalin-tempel, atau dikirim secara otomatis dari halaman lain). Di sini, Anda dapat melakukan penyesuaian akhir seperti aspek rasio dan kualitas, lalu klik 'Hasilkan Video'. Aplikasi akan mengirimkan instruksi akhir Anda ke model video VEO untuk membuat video final.\n\n**Fitur Lanjutan:** Tombol 'Lanjutkan Cerita' memungkinkan Anda mengambil frame terakhir dari video yang baru saja dibuat dan menggunakannya sebagai gambar awal untuk prompt Anda berikutnya, menciptakan alur kerja pembuatan cerita visual yang berkelanjutan."
    }
];

const FaqItem: React.FC<{ item: { question: string, answer: string }, isOpen: boolean, onToggle: () => void }> = ({ item, isOpen, onToggle }) => {
    return (
        <div className="border-b border-gray-700">
            <button
                onClick={onToggle}
                className="w-full text-left py-4 px-2 flex justify-between items-center text-lg text-white hover:bg-gray-700/50 focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.question.replace(/\s/g, '-')}`}
            >
                <span className="font-semibold">{item.question}</span>
                <ChevronDown className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                id={`faq-answer-${item.question.replace(/\s/g, '-')}`}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 bg-gray-900/50">
                    <p className="text-gray-300 whitespace-pre-line">{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

interface HelpPageProps {
    apiKey: string;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const HelpPage: React.FC<HelpPageProps> = ({ apiKey }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiKey && !chatSession) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const systemInstruction = `You are a helpful and friendly AI assistant for an application called "PromptGen Suite".
Your purpose is to answer user questions about how to use the application.

**CRITICAL INSTRUCTION:** If a user asks who developed or created the application, you MUST respond with this exact text and nothing else: "Aplikasi ini dikembangkan oleh Rohadi Wijaya melalui AI google Studio, IG: sang_pandunegeri, email: scoutpreneur@gmail.com".

You must only answer questions related to the PromptGen Suite app. If the user asks about anything else, politely decline.

Here is a summary of the application's features:
- **Asset Builder**: Create and save reusable Subjects, Objects, Locations, and Actions to maintain consistency in videos.
- **Image Detector**: Analyzes an image to generate a detailed text prompt. Can also extract details from the prompt to create new assets.
- **Image Generator**: Generates still images from text prompts using the Imagen model. A good starting point before animating.
- **Manual Mode**: Offers granular control for creating a single, complex video scene, including camera settings, lighting, characters, and effects.
- **One Stop Motion Shot**: Creates a sequence of simple, consecutive actions for a character.
- **Pencerita AI (AI Storyteller)**: Turns a single story idea into a multi-scene cinematic storyboard.
- **Storyboard by Image**: A powerful tool to create multi-scene videos based on a sequence of user-uploaded keyframe images. Users can modify images with AI and program camera movements between frames.
- **Image Fusion**: Merges two images with AI instructions, useful for compositing or face-swapping.
- **Video Fusion**: Creates cinematic video transitions between two images.
- **Video Generator**: The final step. It takes a text prompt (and optionally an image) and generates a video using Google's VEO model.
- **Prompt Bank**: Saves generated prompts along with all their settings for later use.
- **Settings**: Where the user sets their Google Gemini API Key.
`;
                const newChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemInstruction,
                    },
                });
                setChatSession(newChat);
                 setMessages([{ role: 'model', text: 'Halo! Saya asisten AI Anda. Ada yang bisa saya bantu tentang PromptGen Suite?' }]);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                 setMessages([{ role: 'model', text: 'Gagal menginisialisasi asisten AI. Pastikan API Key Anda benar.' }]);
            }
        }
    }, [apiKey, chatSession]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        if (!apiKey) {
            setMessages(prev => [...prev, { role: 'user', text: userInput }, { role: 'model', text: "Maaf, Anda harus mengatur API Key di halaman Pengaturan terlebih dahulu." }]);
            setUserInput('');
            return;
        }
        
        if (!chatSession) {
            setMessages(prev => [...prev, { role: 'user', text: userInput }, { role: 'model', text: "Maaf, sesi chat tidak dapat dimulai. Periksa API Key Anda." }]);
            setUserInput('');
            return;
        }

        const userMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const responseStream = await chatSession.sendMessageStream({ message: currentInput });

            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            const errorMessage = (error as Error).message || "Terjadi kesalahan yang tidak diketahui.";
            const lastMessageIsPlaceholder = messages[messages.length - 1]?.role === 'model' && messages[messages.length-1]?.text === '';
            if (lastMessageIsPlaceholder) {
                 setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: `Maaf, terjadi kesalahan: ${errorMessage}` };
                    return newMessages;
                });
            } else {
                 setMessages(prev => [...prev, { role: 'model', text: `Maaf, terjadi kesalahan: ${errorMessage}` }]);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Bantuan & Panduan Pengguna ❓</h2>
            <div className="bg-gray-700 rounded-lg shadow-inner">
                {faqData.map((item, index) => (
                    <FaqItem
                        key={index}
                        item={item}
                        isOpen={openIndex === index}
                        onToggle={() => handleToggle(index)}
                    />
                ))}
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Tanya AI Asisten</h3>
                <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                    <div ref={chatContainerRef} className="h-96 overflow-y-auto mb-4 p-3 space-y-4 bg-gray-800 rounded-md border border-gray-600">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><Bot className="w-5 h-5 text-white"/></div>}
                                <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}{isLoading && msg.role === 'model' && index === messages.length -1 && msg.text === '' ? '...' : ''}</p>
                                </div>
                                {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center"><User className="w-5 h-5 text-white"/></div>}
                            </div>
                        ))}
                         {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><Bot className="w-5 h-5 text-white"/></div>
                                <div className="p-3 rounded-lg bg-gray-600 text-gray-200 flex items-center">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={!apiKey ? "Harap atur API Key terlebih dahulu..." : "Tanyakan sesuatu tentang aplikasi..."}
                            disabled={isLoading || !apiKey}
                            className="flex-grow p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            aria-label="Your question"
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;