import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { GObject, Subject, Location, Action } from '../types';

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 2000;

/**
 * Provides a user-friendly error message from a raw API error object.
 * @param error The error object caught from an API call.
 * @returns A user-friendly, localized string.
 */
export const getApiErrorMessage = (error: any): string => {
    const message = (error?.message || 'Terjadi kesalahan yang tidak diketahui.').toLowerCase();
    
    if (message.includes('quota') || message.includes('resource_exhausted')) {
        return 'Batas kuota API telah terlampaui. Silakan periksa batas penggunaan Anda di Google AI Studio atau coba lagi nanti.';
    }
    if (message.includes('api key') && (message.includes('not valid') || message.includes('invalid'))) {
        return 'Kunci API tidak valid. Silakan periksa kunci Anda di halaman Pengaturan.';
    }
    if (message.includes('candidate') && message.includes('blocked') && message.includes('safety')) {
        return 'Permintaan diblokir karena pengaturan keamanan. Harap ubah prompt Anda.';
    }
    if (message.includes('ai did not return an image')) {
        return 'AI tidak mengembalikan gambar. Ini mungkin karena prompt ditolak karena kebijakan keamanan. Coba prompt yang berbeda.';
    }
    if (message.includes('400') && (message.includes('image') || message.includes('prompt'))) {
        return 'Permintaan tidak valid. Pastikan gambar dan prompt Anda sesuai format. Terkadang gambar yang terlalu kompleks atau diedit dapat menyebabkan masalah ini.';
    }
    // Fallback for Gemini-specific errors
    if (error.toString().includes('GoogleGenerativeAI')) {
         return `Terjadi kesalahan pada API Gemini: ${error.message}`;
    }
    return error.message || 'Terjadi kesalahan API yang tidak diketahui.';
};


/**
 * A wrapper function that adds retry logic with exponential backoff to an API call.
 * It specifically retries on transient 429 "rate limit" errors.
 * @param apiCall The asynchronous function to call.
 * @returns The result of the API call.
 */
async function withRetry<T>(apiCall: () => Promise<T>): Promise<T> {
    let lastError: any = new Error("Panggilan API gagal setelah beberapa kali percobaan.");
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            const errorMessage = (error.message || '').toLowerCase();
            // We only retry on transient rate limit errors. Hard quota errors will fail immediately.
            const isRetryable = (error.status === 429) || errorMessage.includes('429') || errorMessage.includes('rate limit');
            
            if (isRetryable && attempt < MAX_RETRIES) {
                const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.warn(`Panggilan API gagal dengan kesalahan yang dapat dicoba lagi. Mencoba lagi dalam ${Math.round(delay / 1000)}d... (Percobaan ${attempt}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For non-retryable errors or after the last attempt, throw the formatted error.
                throw new Error(getApiErrorMessage(error));
            }
        }
    }
    // This part should theoretically not be reached, but as a fallback:
    throw new Error(getApiErrorMessage(lastError));
}

const getClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is not provided.");
    }
    return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const detectPromptFromImage = async (file: File, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const imagePart = await fileToGenerativePart(file);
    const textPart = { text: "Anda adalah seorang art director yang ahli dalam menganalisis gambar untuk pembuatan prompt video. Jelaskan gambar ini dengan sangat detail. Jika ini adalah makhluk fantasi atau mitologis, jelaskan bagian-bagiannya yang berbeda. Ikuti struktur naratif ini dengan tepat:\n1. **Identitas Inti:** Mulailah dengan mengidentifikasi subjek utama atau makhluk secara keseluruhan. Beri nama deskriptif (misal: 'Makhluk mitologis agung, gabungan gajah dan singa bersayap').\n2. **Anatomi & Ciri Khas:** Rinci bagian-bagian tubuhnya. Jelaskan kepala, wajah, mata, surai, belalai, gading, tubuh, tekstur kulit (misal: bersisik), sayap (jenis dan tekstur), dan ekor.\n3. **Ornamen & Detail:** Deskripsikan setiap zirah, hiasan, atau 'pakaian' yang dikenakan makhluk itu. Sebutkan detail ukiran atau bahannya.\n4. **Aksi & Pose:** Jelaskan apa yang sedang dilakukan makhluk itu dan bagaimana posenya. (misal: 'Berdiri kokoh di perairan dangkal, menciptakan riak, dengan sayap terbentang lebar seolah siap terbang').\n5. **Latar & Atmosfer:** Deskripsikan lingkungan sekitarnya. Sebutkan langit, kondisi cuaca, pencahayaan, dan elemen latar belakang lainnya untuk membangun suasana (misal: 'epik, misterius, megah')." };
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
    }));
    
    return response.text;
};

export const extractDetailsFromPrompt = async (promptText: string, assetType: 'subjek' | 'objek' | 'lokasi' | 'aksi', apiKey: string): Promise<Partial<Subject | GObject | Location | Action>> => {
    const ai = getClient(apiKey);
    let prompt: string;
    let schema: any;

    switch(assetType) {
        case 'subjek':
            prompt = `Dari teks deskripsi berikut, ekstrak detail subjeknya ke dalam format JSON. Gunakan Bahasa Indonesia untuk semua nilai. Jika sebuah detail tidak ditemukan, biarkan string kosong. Teks: "${promptText}"`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING }, gender: { type: Type.STRING }, age: { type: Type.STRING }, country: { type: Type.STRING },
                    faceDescription: { type: Type.STRING }, hairDescription: { type: Type.STRING },
                    clothingDescription: { type: Type.STRING }, accessoryDescription: { type: Type.STRING },
                    height: { type: Type.STRING }, weight: { type: Type.STRING }, bodyShape: { type: Type.STRING },
                }
            };
            break;
        case 'objek':
            prompt = `Dari teks deskripsi berikut, ekstrak detail objeknya ke dalam format JSON. Gunakan Bahasa Indonesia untuk semua nilai. Jika sebuah detail tidak ditemukan, biarkan string kosong. Teks: "${promptText}"`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING }, category: { type: Type.STRING }, era_style: { type: Type.STRING }, mainColor: { type: Type.STRING }, secondaryColor: { type: Type.STRING },
                    material: { type: Type.STRING }, texture: { type: Type.STRING }, condition: { type: Type.STRING }, size: { type: Type.STRING },
                    shape: { type: Type.STRING }, function: { type: Type.STRING }, interactiveParts: { type: Type.STRING }, currentState: { type: Type.STRING },
                    emittedLight: { type: Type.STRING }, emittedSound: { type: Type.STRING }, uniqueFeatures: { type: Type.STRING }, history: { type: Type.STRING }
                }
            };
            break;
        case 'lokasi':
            prompt = `Dari teks deskripsi berikut, ekstrak detail lokasinya ke dalam format JSON. Beri nama yang deskriptif. Gunakan Bahasa Indonesia untuk semua nilai. Teks: "${promptText}"`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    atmosphere: { type: Type.STRING },
                    keyElements: { type: Type.STRING }
                }
            };
            break;
        case 'aksi':
            prompt = `Dari teks deskripsi berikut, ekstrak aksi utamanya ke dalam format JSON. Deskripsi aksi harus dalam satu kalimat sinematik. Tentukan genre yang paling sesuai. Teks: "${promptText}"`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    genre: { type: Type.STRING }
                }
            };
            break;
        default:
            throw new Error("Invalid asset type");
    }

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    }));

    return JSON.parse(response.text.trim());
};

export const prepareImagePrompt = async (narrative: string, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const instruction = `Adapt the following detailed scene description from Indonesian into a concise, vivid, and action-oriented English prompt for an image generation AI. Focus on creating a single, dynamic movie frame. Emphasize the character's action, expression, and the atmosphere, rather than just listing keywords. Scene Description:\n\n'${narrative}'`;
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
    }));
    return response.text;
};

export const translatePrompt = async (promptToTranslate: string, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const instruction = `Translate the following English text to Indonesian:\n\n"${promptToTranslate}"`;
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
    }));
    return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4", apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const response: any = await withRetry(() => ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    }));

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error("Image generation failed to return an image.");
};

export const generateImageFromImageAndText = async (base64ImageData: string, mimeType: string, prompt: string, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    }));

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }

    throw new Error("AI did not return an image. It might have refused the prompt.");
};

export const generateVeoPromptFromImage = async (file: File, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const imagePart = await fileToGenerativePart(file);
    const textPart = { 
        text: `Analyze this image and describe it as a single, cinematic shot for a video generation AI like Google Veo. Follow this structure: [Shot Type], [Subject and Action], [Setting and Environment details], [Mood and Atmosphere], [Cinematic Qualities like 'photorealistic', 'shot on 35mm film', 'golden hour']. Be descriptive and evocative. For example: 'Cinematic wide shot of a lone astronaut standing on a red Martian dune, watching two moons rise in the purple twilight sky. The atmosphere is quiet and awe-inspiring. Photorealistic, high detail, shot on ARRI Alexa.'` 
    };
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
    }));
    
    return response.text;
};

export const combineStoryboardPrompts = async (prompts: string[], apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const promptList = prompts.map((p, i) => `Scene ${i + 1}: ${p}`).join('\n');
    const instruction = `You are a film director. I will provide you with a sequence of individual shot descriptions. Your task is to weave them together into a single, cohesive video prompt. Add smooth transitions between the shots (e.g., 'then the scene cuts to...', 'following this, we see...', 'it transitions to...'). Ensure the final output is one continuous paragraph. Here are the shots:\n\n${promptList}`;

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
    }));
    
    return response.text;
};

export const mergeImagesWithPrompt = async (
    file1: File,
    file2: File,
    isFaceswap: boolean,
    userPrompt: string,
    apiKey: string
): Promise<string> => {
    const ai = getClient(apiKey);
    const imagePart1 = await fileToGenerativePart(file1);
    const imagePart2 = await fileToGenerativePart(file2);

    let finalPrompt = userPrompt;
    if (isFaceswap) {
        finalPrompt = `Tugas utamamu adalah melakukan faceswap. Ambil wajah dari orang di Gambar 1 dan pasangkan secara realistis ke tubuh orang di Gambar 2. Pastikan pencahayaan dan warna kulit menyatu dengan baik. Setelah itu, terapkan instruksi berikut ke gambar hasil faceswap: "${userPrompt}"`;
    }

    const textPart = { text: finalPrompt };

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart1, textPart, imagePart2] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    }));

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }

    throw new Error("AI tidak mengembalikan gambar. Coba prompt yang berbeda atau periksa kebijakan keamanan.");
};

export const generateAnimationPromptFromFrames = async (instruction: string, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
    }));
    
    return response.text;
};

const STORYBOARD_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sceneNumber: { type: Type.INTEGER, description: 'Nomor urut adegan.' },
            shotType: { type: Type.STRING, description: 'Tipe shot kamera (misal: Extreme Wide Shot, Medium Close-Up).' },
            cameraMovement: { type: Type.STRING, description: 'Gerakan kamera (misal: Slow push-in, Tracking shot).' },
            mood: { type: Type.STRING, description: 'Suasana atau atmosfer adegan (misal: Tegang, Gembira, Misterius).' },
            sceneDescription: { type: Type.STRING, description: 'Deskripsi mendetail tentang aksi, karakter, dan lingkungan dalam adegan.' },
        },
        required: ["sceneNumber", "shotType", "cameraMovement", "mood", "sceneDescription"],
    }
};

export const generateStoryboardFromIdea = async (idea: string, visualStyle: string, apiKey: string, imageFile: File | null): Promise<any> => {
    const ai = getClient(apiKey);

    const styleInstruction = visualStyle ? `Sangat penting: Seluruh storyboard harus secara konsisten mematuhi gaya visual '${visualStyle}'. Sebutkan elemen gaya ini dalam deskripsi adegan jika relevan (misalnya, 'karakter digambar dengan gaya anime').` : '';
    const promptText = `Anda adalah seorang penulis naskah dan sinematografer Hollywood yang ahli. Tugas Anda adalah mengambil ide cerita pengguna dan memecahnya menjadi storyboard sinematik yang mendetail dengan 3 hingga 5 adegan. ${styleInstruction} ${imageFile ? "Gunakan gambar yang diberikan sebagai referensi visual utama untuk karakter, lingkungan, dan/atau objek dalam cerita. Pastikan deskripsi visual di setiap adegan konsisten dengan gambar referensi." : ""} Untuk setiap adegan, Anda harus memberikan deskripsi yang detail, tipe shot kamera, gerakan kamera, dan suasana (mood). Output harus berupa array JSON yang valid.

Ide Cerita: "${idea}"`;

    let contents: any;
    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        contents = { parts: [{text: promptText}, imagePart] };
    } else {
        contents = promptText;
    }

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: STORYBOARD_SCHEMA,
        }
    }));

    return JSON.parse(response.text.trim());
};

export const continueStoryboardFromFrames = async (idea: string, existingFrames: any[], visualStyle: string, apiKey: string, imageFile: File | null): Promise<any> => {
    const ai = getClient(apiKey);
    const lastSceneNumber = existingFrames.length > 0 ? existingFrames[existingFrames.length - 1].sceneNumber : 0;
    
    const styleInstruction = visualStyle ? `PENTING: Pastikan semua adegan baru yang Anda tulis secara ketat mengikuti gaya visual yang telah ditetapkan: '${visualStyle}'.` : '';
    const promptText = `Anda adalah seorang penulis naskah dan sinematografer Hollywood yang ahli. Tugas Anda adalah melanjutkan sebuah cerita yang sudah ada. Berdasarkan ide cerita asli dan adegan-adegan sebelumnya, tulis 2 hingga 3 adegan BERIKUTNYA yang logis dan menarik. ${styleInstruction} ${imageFile ? "Sangat penting: pertahankan konsistensi visual dengan gambar referensi yang diberikan untuk setiap karakter, lingkungan, atau objek baru yang Anda perkenalkan." : ""} Lanjutkan penomoran adegan dari yang terakhir. Output harus berupa array JSON yang valid.

Ide Cerita Asli: "${idea}"

Adegan yang Sudah Ada:
${JSON.stringify(existingFrames, null, 2)}

Lanjutkan cerita dari sini. Mulai dengan nomor adegan ${lastSceneNumber + 1}.`;

    let contents: any;
    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        contents = { parts: [{text: promptText}, imagePart] };
    } else {
        contents = promptText;
    }

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: STORYBOARD_SCHEMA,
        }
    }));

    return JSON.parse(response.text.trim());
};

export const suggestShotsFromDescription = async (description: string, apiKey: string, imageFile: File | null): Promise<string[]> => {
    const ai = getClient(apiKey);
    
    const promptText = `Dari deskripsi adegan berikut, identifikasi 3 hingga 5 momen visual kunci atau "shot" yang paling penting dan dapat digambar. ${imageFile ? 'PENTING: Gunakan gambar yang diberikan sebagai referensi visual yang kuat. Pastikan saran shot Anda konsisten dengan karakter, objek, atau lingkungan yang terlihat di gambar.' : ''} Berikan sebagai daftar singkat.

Deskripsi: "${description}"`;

    let contents: any;
    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        contents = { parts: [{text: promptText}, imagePart] };
    } else {
        contents = promptText;
    }

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.STRING,
            description: 'Saran shot tunggal yang ringkas (misal: "Wajah panik karakter", "Lampu indikator mesin menyala merah").'
        }
    };

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    }));

    return JSON.parse(response.text.trim());
};

const CAMERA_SUGGESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        shotType: { 
            type: Type.STRING, 
            description: 'The camera shot type that best fits the scene (e.g., "Extreme Wide Shot", "Medium Close-Up", "Full Shot", "Point of View (POV) Shot").' 
        },
        cameraMovement: { 
            type: Type.STRING, 
            description: 'The camera movement that best fits the scene (e.g., "Slow push-in", "Tracking shot following the character", "Static", "Handheld shaky cam").' 
        }
    },
    required: ["shotType", "cameraMovement"]
};


export const suggestCameraMovementFromDescription = async (description: string, apiKey: string): Promise<{ shotType: string, cameraMovement: string }> => {
    const ai = getClient(apiKey);
    const prompt = `You are an expert cinematographer. Analyze the following scene description and suggest the most fitting camera shot type and camera movement to capture the action and emotion effectively. Provide your answer in a valid JSON object.

Scene Description: "${description}"`;

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: CAMERA_SUGGESTION_SCHEMA,
        }
    }));

    return JSON.parse(response.text.trim());
};


export const generateVideo = async (
    prompt: string, 
    imageFile: File | null,
    numberOfVideos: number,
    model: string,
    aspectRatio: string,
    quality: string,
    apiKey: string
): Promise<string[]> => {
    const ai = getClient(apiKey);
    
    let operation;
    const config: {
        numberOfVideos: number,
        aspectRatio?: string,
        quality?: string
    } = { 
        numberOfVideos 
    };
    
    if (aspectRatio) {
        config.aspectRatio = aspectRatio;
    }
    if (quality) {
        config.quality = quality;
    }

    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        operation = await withRetry(() => ai.models.generateVideos({
            model,
            prompt,
            image: {
                imageBytes: imagePart.inlineData.data,
                mimeType: imagePart.inlineData.mimeType,
            },
            config,
        }));
    } else {
        operation = await withRetry(() => ai.models.generateVideos({
            model,
            prompt,
            config,
        }));
    }
    
    while (!operation.done) {
        // Poll every 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await withRetry(() => ai.operations.getVideosOperation({ operation: operation }));
    }

    // After polling, check for failures.
    // Case 1: The operation itself reports a hard error from the server.
    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message || 'Unknown server error'}`);
    }

    // Case 2: The operation succeeded, but returned no valid video links.
    const downloadLinks = operation.response?.generatedVideos
        ?.map(v => v.video?.uri)
        .filter((uri): uri is string => !!uri);

    if (!downloadLinks || downloadLinks.length === 0) {
        // This often happens due to safety filters blocking the prompt or an internal issue.
        throw new Error("Video generation completed, but the service did not return any video links. This may be due to a safety policy violation or an internal error.");
    }
    
    // Case 3: Success.
    return downloadLinks;
};

export const refinePrompt = async (originalPrompt: string, userInstruction: string, apiKey: string): Promise<string> => {
    const ai = getClient(apiKey);
    const instruction = `You are an expert prompt engineer for video generation AI. Your task is to refine the following original prompt based on the user's instructions. Output only the new, improved, and complete prompt. Do not add any extra text, preambles, or explanations.

Original Prompt:
"${originalPrompt}"

User Instructions:
"${userInstruction}"`;
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
    }));
    return response.text;
};