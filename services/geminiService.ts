import { GoogleGenAI, Modality } from "@google/genai";
import { 
    BackgroundOption, ProductBackgroundCategory, AspectRatio, PoseCategory, AttireOption, Mode,
    ProfileIndustry, ProfileLighting, ProfileExpression, PoseCameraAngle, WeddingTheme, WeddingMoment, WeddingTimeOfDay, ProductLighting, GeneratedImage, PreWeddingTheme, PreWeddingMoment 
} from '../types';

// --- PROMPT HELPER FUNCTIONS ---

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const getBackgroundPrompt = (
    backgroundOption: BackgroundOption | ProductBackgroundCategory,
    subOption?: string
): string => {
    if (backgroundOption === BackgroundOption.Reference) {
        return "using the same background as the reference image.";
    }
    if (backgroundOption === BackgroundOption.Minimalist) {
        return "with a clean, minimalist studio background (e.g., solid light gray, beige, or white).";
    }

    switch (backgroundOption) {
        case ProductBackgroundCategory.FamousPlaces:
            return `in a famous location, specifically at ${subOption || 'the Eiffel Tower'}.`;
        case ProductBackgroundCategory.ProfessionalStudio:
            return `in a professional studio with a ${subOption || 'minimalist white'} background.`;
        case ProductBackgroundCategory.IndoorLifestyle:
            return `in a lifestyle setting, specifically in a ${subOption || 'modern kitchen'}.`;
        case ProductBackgroundCategory.OutdoorNatural:
            return `in an outdoor nature setting, specifically at a ${subOption || 'tropical beach'}.`;
        default:
            return "with a clean, minimalist studio background.";
    }
};

const getPosePrompt = (poseCategory: PoseCategory, forProductModel: boolean = false): string => {
    const modelSubject = forProductModel ? "The model" : "The person";
    switch (poseCategory) {
        case PoseCategory.FormalProfessional: return `${modelSubject} should be in a formal professional pose suitable for a corporate setting, such as hands crossed, a confident stance, or gesturing as if presenting.`;
        case PoseCategory.CandidLifestyle: return `${modelSubject} should be in a natural, candid lifestyle pose, like laughing genuinely, walking through a city, or interacting naturally with an object like a coffee cup.`;
        case PoseCategory.CreativeArtistic: return `${modelSubject} should be in a creative or artistic pose, using unconventional angles, dramatic lighting, or an abstract concept to create a visually intriguing image.`;
        case PoseCategory.AthleticAction: return `${modelSubject} should be captured in a dynamic athletic action pose. Freeze the motion of an activity like jumping, running, dancing, or a specific sports movement, emphasizing energy and physicality.`;
        case PoseCategory.RelaxedCasual: return `${modelSubject} should be in a genuinely calm and relaxed casual pose. The body language should be soft and at ease—think leaning against a wall, sitting comfortably on steps, or lounging naturally in a comfortable setting.`;
        case PoseCategory.PowerfulDynamic: return `${modelSubject} should be in a powerful and dynamic stance. Use strong lines, angular limbs, and a confident posture to create a visually striking silhouette, conveying energy, strength, or high fashion.`;
        default: return `${modelSubject} should be in a natural, candid lifestyle pose.`;
    }
}

const getAttirePrompt = (attire: AttireOption): string => {
    switch(attire) {
        case AttireOption.FormalWedding: return "The couple should be wearing formal wedding attire, such as a white gown and a tuxedo.";
        case AttireOption.Traditional: return "The couple should be wearing traditional wedding attire from a specific culture (e.g., Indian, Japanese, Nigerian). The AI can choose a beautiful, ornate style.";
        case AttireOption.CasualChic: return "The couple should be in stylish but casual outfits suitable for a pre-wedding photoshoot, like smart dresses, shirts, and trousers.";
        case AttireOption.AsPerReference: return "The couple should be wearing outfits similar in style to their reference photos.";
        default: return "";
    }
}

const getEffectPrompt = (effects: string[]): string => {
    if (!effects || effects.length === 0) return "";
    
    const getSinglePrompt = (effect: string): string => {
        switch (effect) {
            case 'Uap Panas': return " The food should have elegant wisps of hot steam rising from it.";
            case 'Tetesan Embun Segar': return " The food should have fresh, glistening dewdrops on it.";
            case 'Potongan Melayang': return " Some ingredients or pieces of the food should be levitating or floating artfully around the main dish.";
            case 'Cahaya Berkilau': return " The food should be highlighted with a magical, sparkling glow or shimmering light effects.";
            case 'Percikan Air': return " The drink should have a dynamic splash of liquid, frozen in time.";
            case 'Es Batu Beku': return " The drink should be filled with crystal-clear, frosted ice cubes.";
            case 'Gelembung Menyegarkan': return " The drink should have refreshing bubbles rising to the surface.";
            case 'Uap Dingin': return " The drink should have cool, misty vapor coming off it.";
            case 'Latar Belakang Abstrak': return " The bag should be set against a complementary abstract background with soft shapes and colors.";
            case 'Efek Levitasi': return " The bag should be floating or levitating slightly off the surface for a magical effect.";
            case 'Bayangan Dramatis': return " The lighting should create long, dramatic shadows from the bag.";
            case 'Kilauan Kulit': return " The material of the bag should have an enhanced, luxurious sheen or sparkle.";
            case 'Kain Melambai': return " The clothing should have fabric that is elegantly flowing or waving as if caught in a gentle breeze.";
            case 'Partikel Berkilau': return " The scene should be filled with subtle, sparkling particles or glitter floating in the air.";
            case 'Latar Belakang Cat Air': return " The background should be a soft, artistic watercolor wash that complements the fashion.";
            case 'Fokus Lembut': return " The image should have a soft, dreamy focus, especially around the edges.";
            case 'Jejak Cahaya Neon': return " The electronic device should be emitting or surrounded by sleek neon light trails.";
            case 'Latar Papan Sirkuit': return " The background should be a stylized, glowing circuit board pattern.";
            case 'Efek Hologram': return " A holographic projection should be emanating from or displaying on the electronic device.";
            case 'Kilatan Lensa': return " The image should feature a cinematic lens flare effect interacting with the device.";
            case 'Jejak Cahaya Kecepatan': return " The vehicle should have motion-blur light streaks behind it to convey speed.";
            case 'Percikan Air Realistis': return " The vehicle should be kicking up a realistic splash of water.";
            case 'Asap Ban Dramatis': return " The vehicle's tires should be creating dramatic smoke.";
            case 'Pantulan Lingkungan': return " The vehicle's surface should have crisp, beautiful reflections of its surroundings.";
            default: return "";
        }
    };
    
    return effects.map(getSinglePrompt).join('');
}

const getProfilePrompts = (industry: ProfileIndustry, lighting: ProfileLighting, expression: ProfileExpression): string => {
    let prompt = "";
    switch (industry) {
        case ProfileIndustry.Tech: prompt += " The person should look like they are in the tech industry, with smart casual attire. The background could be a modern office or an abstract design."; break;
        case ProfileIndustry.Creative: prompt += " The person should have an artistic vibe, with unique clothing. The background could be a studio or an urban wall."; break;
        case ProfileIndustry.Corporate: prompt += " The person should be in formal business attire. The background should be a corporate office or a professional backdrop."; break;
        case ProfileIndustry.Health: prompt += " The person should look like a healthcare professional, appearing trustworthy and caring."; break;
    }
    switch (lighting) {
        case ProfileLighting.SoftAndFriendly: prompt += " Use soft, even lighting to create a friendly, approachable look with minimal shadows."; break;
        case ProfileLighting.DramaticAndBold: prompt += " Use dramatic side lighting (Rembrandt style) to create depth and shadow for a bold, authoritative look."; break;
        case ProfileLighting.ModernRingLight: prompt += " Use a ring light to create a modern look with a distinct catchlight in the eyes."; break;
    }
    switch (expression) {
        case ProfileExpression.ConfidentSmile: prompt += " The person should have a confident expression with a slight, closed-mouth smile."; break;
        case ProfileExpression.FriendlyOpen: prompt += " The person should have a warm, friendly, and open expression with a genuine smile."; break;
        case ProfileExpression.FocusedAuthoritative: prompt += " The person should have a focused, serious, and authoritative expression."; break;
    }
    return prompt;
};

const getCameraAnglePrompt = (cameraAngle: PoseCameraAngle): string => {
    switch (cameraAngle) {
        case PoseCameraAngle.FrontEyeLevel: return " The camera angle is at eye-level from the front for a neutral, direct perspective.";
        case PoseCameraAngle.LowAngle: return " The camera angle is low, looking up at the subject to make them appear powerful or dominant.";
        case PoseCameraAngle.HighAngle: return " The camera angle is high, looking down at the subject to create a friendly, endearing, or sometimes vulnerable feel.";
        case PoseCameraAngle.SideView: return " The camera captures the subject's profile from the side.";
        case PoseCameraAngle.BackView: return " The camera is positioned behind the subject, capturing them from the back.";
        default: return "";
    }
};

const getPoseGeneratorPrompts = (scenario: string, objectInteraction: string): string => {
    let prompt = "";
    if (scenario) prompt += ` The person is in a scenario: '${scenario}'. The pose should reflect this naturally.`;
    if (objectInteraction) prompt += ` The person is interacting with an object: '${objectInteraction}'.`;
    return prompt;
};

const getWeddingPrompts = (theme: WeddingTheme, moment: WeddingMoment, timeOfDay: WeddingTimeOfDay): string => {
    let prompt = "";
    switch (theme) {
        case WeddingTheme.ClassicTimeless: prompt += " The theme is classic and timeless, with elegant venues, formal attire, and a bright, clean style."; break;
        case WeddingTheme.ModernMinimalist: prompt += " The theme is modern and minimalist, with clean architectural lines and simple, elegant clothing."; break;
        case WeddingTheme.GlamorousBallroom: prompt += " The theme is glamorous and grand, set in a luxurious ballroom or estate with opulent details."; break;
    }
    switch (moment) {
        case WeddingMoment.ExchangingVows: prompt += " Capture the powerful moment of the couple exchanging their vows."; break;
        case WeddingMoment.TheFirstKiss: prompt += " Capture the romantic moment of the couple's first kiss as a married pair."; break;
        case WeddingMoment.WeddingEmbrace: prompt += " Capture a heartfelt, romantic embrace between the newly married couple."; break;
        case WeddingMoment.CelebratoryToast: prompt += " Capture a joyful moment of the couple making a celebratory toast."; break;
    }
    switch (timeOfDay) {
        case WeddingTimeOfDay.GoldenHour: prompt += " The lighting is warm and golden, as if taken during sunset, for a romantic glow."; break;
        case WeddingTimeOfDay.BlueHour: prompt += " The lighting is cool and soft with deep blue tones, as if taken after sunset, for a dramatic effect."; break;
        case WeddingTimeOfDay.BrightDaylight: prompt += " The lighting is bright and airy from a clear day, with soft shadows."; break;
    }
    return prompt;
};

const getPreWeddingPrompts = (theme: PreWeddingTheme, moment: PreWeddingMoment, timeOfDay: WeddingTimeOfDay): string => {
    let prompt = "";
    switch (theme) {
        case PreWeddingTheme.BohemianNatural: prompt += " The theme is bohemian and natural, set outdoors with warm, earthy colors and relaxed attire."; break;
        case PreWeddingTheme.UrbanCityscape: prompt += " The theme is a chic urban cityscape, using modern architecture and street scenes as the backdrop."; break;
        case PreWeddingTheme.RomanticPicnic: prompt += " The theme is a sweet, romantic picnic in a park or countryside setting."; break;
        case PreWeddingTheme.CozyCafe: prompt += " The theme is an intimate and cozy cafe, capturing a casual date-like atmosphere."; break;
    }
    switch (moment) {
        case PreWeddingMoment.LaughingTogether: prompt += " Capture a candid moment of the couple laughing genuinely together."; break;
        case PreWeddingMoment.StrollingHandInHand: prompt += " The couple is strolling casually hand-in-hand through the scene."; break;
        case PreWeddingMoment.SharingASecret: prompt += " Capture an intimate moment where one person is whispering to the other."; break;
        case PreWeddingMoment.SpontaneousDance: prompt += " The couple is in the middle of a spontaneous, joyful dance."; break;
    }
     switch (timeOfDay) {
        case WeddingTimeOfDay.GoldenHour: prompt += " The lighting is warm and golden, as if taken during sunset, for a romantic glow."; break;
        case WeddingTimeOfDay.BlueHour: prompt += " The lighting is cool and soft with deep blue tones, as if taken after sunset, for a dramatic effect."; break;
        case WeddingTimeOfDay.BrightDaylight: prompt += " The lighting is bright and airy from a clear day, with soft shadows."; break;
    }
    return prompt;
};


const getProductPrompts = (lighting: ProductLighting, props: string): string => {
    let prompt = "";
    if (props) prompt += ` The scene includes supporting props to create a lifestyle context, such as: '${props}'.`;
    switch (lighting) {
        case ProductLighting.StandardStudio: prompt += " Use standard, even studio lighting that clearly shows the product."; break;
        case ProductLighting.SideTexture: prompt += " Use strong side lighting to emphasize the product's texture and material details."; break;
        case ProductLighting.BacklightGlow: prompt += " Use backlighting to create a dramatic glow or silhouette around the product."; break;
        case ProductLighting.MacroFocus: prompt += " This is a macro, close-up shot focusing on a specific detail of the product with a shallow depth of field."; break;
    }
    return prompt;
};

// --- NEW STYLE INSPIRATION FUNCTION ---
export const getStyleInspiration = async (mode: Mode, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const modelContext = {
        [Mode.ProfilePhoto]: "foto profil profesional untuk LinkedIn",
        [Mode.PoseGenerator]: "foto seluruh tubuh yang dinamis",
        [Mode.WeddingPhoto]: "foto pernikahan romantis",
        [Mode.PreWeddingPhoto]: "foto pre-wedding yang kasual dan menyenangkan",
        [Mode.ProductPhoto]: "foto produk komersial yang menarik",
    };

    const prompt = `Berikan satu prompt gaya fotografi yang kreatif dan singkat (3-5 kata) untuk ${modelContext[mode] || 'sebuah foto'}. JANGAN gunakan tanda kutip atau kata pengantar. Contoh: gaya sinematik, pencahayaan neon`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim().replace(/["'.]/g, ''); // Remove quotes and periods
}

// --- MAIN GENERATION FUNCTIONS ---

export interface GeneratePosesOptions {
    apiKey: string;
    referenceFile: File;
    backgroundOption: BackgroundOption;
    stylePrompt: string;
    numberOfPhotos: number;
    customBackgroundFile: File | null;
    aspectRatio: AspectRatio;
    mode: Mode;
    poseCategory: PoseCategory;
    partnerFile: File | null;
    attire: AttireOption;
    profileIndustry: ProfileIndustry;
    profileLighting: ProfileLighting;
    profileExpression: ProfileExpression;
    poseScenario: string;
    poseObjectInteraction: string;
    poseCameraAngle: PoseCameraAngle[];
    weddingTheme: WeddingTheme;
    weddingMoment: WeddingMoment;
    weddingTimeOfDay: WeddingTimeOfDay;
    preWeddingTheme: PreWeddingTheme;
    preWeddingMoment: PreWeddingMoment;
    poseBackground: string;
}

export const generatePoses = async (options: GeneratePosesOptions): Promise<Omit<GeneratedImage, 'id'>[]> => {
    const {
        apiKey, referenceFile, backgroundOption, stylePrompt, numberOfPhotos, customBackgroundFile,
        aspectRatio, mode, poseCategory, partnerFile, attire, profileIndustry, profileLighting,
        profileExpression, poseScenario, poseObjectInteraction, poseCameraAngle, weddingTheme,
        weddingMoment, weddingTimeOfDay, preWeddingTheme, preWeddingMoment, poseBackground
    } = options;

    const ai = new GoogleGenAI({ apiKey });
    const isWeddingOrPreWedding = mode === Mode.WeddingPhoto || mode === Mode.PreWeddingPhoto;
    const subject = isWeddingOrPreWedding ? "the couple" : "the person";

    const referencePart = await fileToGenerativePart(referenceFile);
    const parts = [referencePart];
    
    let prompt = `Generate a high-resolution, photorealistic image of ${subject} from the reference photo(s). 
    CRITICAL INSTRUCTION: The face and hair of any person in the generated image must be a precise match to their corresponding reference photo. Replicate all facial features (eyes, nose, mouth shape) and the exact hair style, color, and texture with the highest possible fidelity. This is the most important requirement. The body type and skin tone must also remain consistent.
    Ensure each generated image offers a unique pose and composition, even if the camera angle is repeated.`;

    if (isWeddingOrPreWedding) {
        if (partnerFile) {
            const partnerPart = await fileToGenerativePart(partnerFile);
            parts.push(partnerPart);
            prompt += ` The first reference photo is Person 1, the second is Person 2. Both should be depicted together.`;
        }
        prompt += ` ${getAttirePrompt(attire)}`;
        if (mode === Mode.WeddingPhoto) {
            prompt += ` ${getWeddingPrompts(weddingTheme, weddingMoment, weddingTimeOfDay)}`;
        } else {
            prompt += ` ${getPreWeddingPrompts(preWeddingTheme, preWeddingMoment, weddingTimeOfDay)}`;
        }
    } else if (mode === Mode.ProfilePhoto) {
        prompt += ` This is a professional headshot.`;
        prompt += ` ${getProfilePrompts(profileIndustry, profileLighting, profileExpression)}`;
    } else if (mode === Mode.PoseGenerator) {
        prompt += ` ${getPosePrompt(poseCategory)}`;
        prompt += ` ${getPoseGeneratorPrompts(poseScenario, poseObjectInteraction)}`;
    }

    if (mode === Mode.PoseGenerator && poseBackground) {
        prompt += ` The background is a ${poseBackground}.`;
    } else if (backgroundOption === BackgroundOption.EditBackground && customBackgroundFile) {
        const customBgPart = await fileToGenerativePart(customBackgroundFile);
        parts.push(customBgPart);
        prompt += " Use the provided custom image as the background.";
    } else {
        const backgroundPrompt = getBackgroundPrompt(backgroundOption);
        prompt += ` Place them in a new setting ${backgroundPrompt}`;
    }

    if (stylePrompt) prompt += ` Apply the artistic style: ${stylePrompt}.`;

    const generationPromises = Array.from({ length: numberOfPhotos }).map(async (_, index) => {
        const currentAngle = poseCameraAngle[index % poseCameraAngle.length];
        const anglePrompt = (mode !== Mode.ProductPhoto) ? getCameraAnglePrompt(currentAngle) : '';
        
        const fullPrompt = `${prompt}${anglePrompt} IMPORTANT: The final image MUST have an aspect ratio of ${aspectRatio}. (Variation ${index + 1} of ${numberOfPhotos}, seed: ${Math.random()})`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [...parts, { text: fullPrompt }] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
        });
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                src: `data:image/png;base64,${imagePart.inlineData.data}`,
                label: `Pose ${index + 1}`
            };
        }
        const safetyReason = response.candidates?.[0]?.finishReason;
        throw new Error(`Image generation failed. Reason: ${safetyReason || 'Unknown'}. Check safety settings or prompt.`);
    });

    const results = await Promise.allSettled(generationPromises);
    return results.map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            return { src: result.value.src, label: result.value.label, status: 'done' as const };
        }
        // FIX: Property 'reason' does not exist on type 'PromiseFulfilledResult'. Added a type guard for rejected promises.
        if (result.status === 'rejected') {
            return {
                src: '', label: `Pose ${index + 1}`, status: 'error' as const,
                errorMessage: (result.reason as Error)?.message ?? 'Image generation failed.',
            };
        }
        // This handles the case where status is 'fulfilled' but value is falsy.
        return {
            src: '', label: `Pose ${index + 1}`, status: 'error' as const,
            errorMessage: 'Image generation failed or returned no data.',
        };
    });
}

export interface GenerateProductPhotosOptions {
    apiKey: string;
    productFile: File;
    modelFile: File | null;
    backgroundCategory: ProductBackgroundCategory;
    backgroundSubOption: string;
    stylePrompt: string;
    numberOfPhotos: number;
    customBackgroundFile: File | null;
    aspectRatio: AspectRatio;
    productPoseCategory: PoseCategory;
    productEffects: string[];
    productLighting: ProductLighting;
    productProps: string;
}

export const generateProductPhotos = async (options: GenerateProductPhotosOptions): Promise<Omit<GeneratedImage, 'id'>[]> => {
    const {
        apiKey, productFile, modelFile, backgroundCategory, backgroundSubOption, stylePrompt,
        numberOfPhotos, customBackgroundFile, aspectRatio, productPoseCategory, productEffects,
        productLighting, productProps
    } = options;

    const ai = new GoogleGenAI({ apiKey });
    const productPart = await fileToGenerativePart(productFile);
    const backgroundPrompt = getBackgroundPrompt(backgroundCategory, backgroundSubOption);
    const effectPrompt = getEffectPrompt(productEffects);
    const professionalPrompts = getProductPrompts(productLighting, productProps);
    const parts = [productPart];

    let basePrompt: string;

    if (modelFile) {
        const modelPart = await fileToGenerativePart(modelFile);
        parts.push(modelPart);
        const posePrompt = getPosePrompt(productPoseCategory, true);
        
        basePrompt = `Create a professional product photograph featuring the provided product and model.
        CRITICAL INSTRUCTION: The model's face and hair must be a precise match to the reference model photo. Replicate all facial features (eyes, nose, mouth shape) and the exact hair style, color, and texture with the highest possible fidelity. This is the most important requirement.
        The model should interact with the product naturally. ${posePrompt}
        The setting is ${backgroundPrompt}.
        The style is: high-resolution, photorealistic. ${professionalPrompts}${effectPrompt}${stylePrompt ? ` Additional style: ${stylePrompt}.` : ''}`;

    } else {
         basePrompt = `Create a professional product photograph featuring the provided product as the clear focus.
        The setting is ${backgroundPrompt}.
        The style is: high-resolution, photorealistic. ${professionalPrompts}${effectPrompt}${stylePrompt ? ` Additional style: ${stylePrompt}.` : ''}`;
    }

    if (customBackgroundFile) {
        const customBgPart = await fileToGenerativePart(customBackgroundFile);
        parts.push(customBgPart);
        basePrompt += " Use the most recently provided image as the custom background.";
    }
    
    const generationPromises = Array.from({ length: numberOfPhotos }).map(async (_, index) => {
        const fullPrompt = `${basePrompt} IMPORTANT: The final image MUST have an aspect ratio of ${aspectRatio}. (Image ${index + 1} of ${numberOfPhotos}, variation seed: ${Math.random()})`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [...parts, { text: fullPrompt }] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                src: `data:image/png;base64,${imagePart.inlineData.data}`,
                label: `Product Shot ${index + 1}`
            };
        }
        const safetyReason = response.candidates?.[0]?.finishReason;
        throw new Error(`Image generation failed. Reason: ${safetyReason || 'Unknown'}. Check safety settings or prompt.`);
    });
    
    const results = await Promise.allSettled(generationPromises);
    return results.map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            return { src: result.value.src, label: result.value.label, status: 'done' as const };
        }
        // FIX: Property 'reason' does not exist on type 'PromiseFulfilledResult'. Added a type guard for rejected promises.
        if (result.status === 'rejected') {
            return {
                src: '', label: `Produk ${index + 1}`, status: 'error' as const,
                errorMessage: (result.reason as Error)?.message ?? 'Image generation failed.',
            };
        }
        // This handles the case where status is 'fulfilled' but value is falsy.
        return {
            src: '', label: `Produk ${index + 1}`, status: 'error' as const,
            errorMessage: 'Image generation failed or returned no data.',
        };
    });
};