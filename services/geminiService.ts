
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { BackgroundOption, ProductBackgroundOption, PoseCategory, ImageModel } from '../types';

const getAiClient = (apiKey: string | undefined) => {
    if (!apiKey) {
        throw new Error("API Key is not configured. Please set it in the settings.");
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

const getBackgroundPrompt = (backgroundOption: BackgroundOption, stylePrompt: string): string => {
    switch(backgroundOption) {
        case BackgroundOption.Minimalist:
            return 'The background should be a professional, minimalist photo studio with a solid light gray background and soft, even lighting.';
        case BackgroundOption.Reference:
            return 'The background should be the same as the original reference image.';
        case BackgroundOption.Custom:
            return `The background should be described by the following prompt: ${stylePrompt}`;
        case BackgroundOption.EditBackground:
            return 'Use the second image provided as the new background for the person from the first image. Blend them realistically.';
        default:
            return '';
    }
};

export const generatePoses = async (
    apiKey: string,
    imageModel: ImageModel,
    referenceImageFile: File | null,
    backgroundOption: BackgroundOption,
    stylePrompt: string,
    numberOfPhotos: number,
    customBackgroundFile: File | null,
    aspectRatio: string,
    poseCategory: PoseCategory,
): Promise<{ src: string; label: string }[]> => {
    try {
        const ai = getAiClient(apiKey);
        
        const poseGenerationPrompt = `Generate a list of ${numberOfPhotos} distinct ${poseCategory.toLowerCase()} photo poses and expressions. Tailor them to be suitable for the '${poseCategory}' category. Return the list as a JSON array of objects, where each object has a "poseName" key.`;
        
        const poseResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: poseGenerationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            poseName: {
                                type: Type.STRING,
                                description: 'The name of the pose or expression.'
                            }
                        }
                    }
                }
            }
        });
        
        const poses: { poseName: string }[] = JSON.parse(poseResponse.text);

        if (!poses || poses.length === 0) {
            throw new Error('Could not generate pose ideas.');
        }
        
        const backgroundPrompt = getBackgroundPrompt(backgroundOption, stylePrompt);

        // --- Model-Specific Generation Logic ---
        
        if (imageModel === ImageModel.Imagen4) {
            // Pure text-to-image generation
            const imagePromises = poses.map(async (pose) => {
                const imageGenPrompt = `A photorealistic, high-quality studio portrait of a person. Their pose and facial expression should be "${pose.poseName}". ${backgroundPrompt}. Additional style prompt: "${stylePrompt}". The image must have a ${aspectRatio} aspect ratio.`;

                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: imageGenPrompt,
                    config: { 
                        numberOfImages: 1, 
                        outputMimeType: 'image/png',
                        // @ts-ignore - AspectRatio enum values match API expectations
                        aspectRatio: aspectRatio,
                    },
                });

                if (response.generatedImages?.[0]?.image?.imageBytes) {
                    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                    return {
                        src: `data:image/png;base64,${base64ImageBytes}`,
                        label: pose.poseName,
                    };
                }
                throw new Error(`Image generation failed for pose: ${pose.poseName}`);
            });
            return Promise.all(imagePromises);

        } else {
            // Image-to-image editing (existing logic)
            if (!referenceImageFile) throw new Error("A reference image is required for this model.");
            
            const imagePart = await fileToGenerativePart(referenceImageFile);
            let backgroundPart = null;
            if (backgroundOption === BackgroundOption.EditBackground && customBackgroundFile) {
                backgroundPart = await fileToGenerativePart(customBackgroundFile);
            }

            const imagePromises = poses.map(async (pose) => {
                const imageGenPrompt = `Using the provided reference image (first image), regenerate it keeping the person, their clothing, and hairstyle identical. Change only their pose and facial expression to be "${pose.poseName}". ${backgroundPrompt}. If a style prompt is provided, apply it: "${stylePrompt}". The final image must have a ${aspectRatio} aspect ratio. Ensure the final image is a photorealistic, high-quality studio portrait.`;
                
                const parts = [
                    imagePart,
                    ...(backgroundPart ? [backgroundPart] : []),
                    { text: imageGenPrompt },
                ];

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image-preview',
                    contents: {
                        parts: parts,
                    },
                    config: {
                        responseModalities: [Modality.IMAGE, Modality.TEXT],
                    },
                });

                const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
                if (imageContent?.inlineData) {
                    const base64ImageBytes = imageContent.inlineData.data;
                    return {
                        src: `data:${imageContent.inlineData.mimeType};base64,${base64ImageBytes}`,
                        label: pose.poseName,
                    };
                }
                throw new Error(`Image generation failed for pose: ${pose.poseName}`);
            });

            return Promise.all(imagePromises);
        }

    } catch (error) {
        console.error("Error in Gemini service:", error);
        throw error;
    }
};

export const generateProductPhotos = async (
    apiKey: string,
    imageModel: ImageModel,
    referenceImageFile: File | null,
    modelFile: File | null,
    backgroundOption: ProductBackgroundOption,
    stylePrompt: string,
    numberOfPhotos: number,
    customBackgroundFile: File | null,
    aspectRatio: string,
): Promise<{ src: string; label: string }[]> => {
    try {
        const ai = getAiClient(apiKey);
        
        // --- Model-Specific Generation Logic ---

        if (imageModel === ImageModel.Imagen4) {
             // Pure text-to-image generation
             let backgroundIdeasPrompt: string;
             let responseSchema: any;
             let ideaKey: 'name' | 'description';

             if (backgroundOption === ProductBackgroundOption.FamousPlaces) {
                backgroundIdeasPrompt = `Generate a list of ${numberOfPhotos} famous world landmarks suitable for a product photoshoot background. Examples: Eiffel Tower in Paris, Times Square in New York. Return the list as a JSON array of objects, where each object has a "name" key.`;
                responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } } };
                ideaKey = 'name';
            } else { // ProfessionalStudio or Custom (when text based)
                backgroundIdeasPrompt = `Generate a list of ${numberOfPhotos} distinct professional product photography studio setups. Describe the surface, lighting, and background color/texture. Examples: 'On a reflective black acrylic surface with a soft spotlight', 'On a rustic wooden table with a blurred warm background'. Return the list as a JSON array of objects, where each object has a "description" key.`;
                responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING } } } };
                ideaKey = 'description';
            }
             
            const ideasResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: backgroundIdeasPrompt,
                config: { responseMimeType: "application/json", responseSchema }
            });

            const backgroundIdeas: { [key: string]: string }[] = JSON.parse(ideasResponse.text);
            if (!backgroundIdeas || backgroundIdeas.length === 0) throw new Error('Could not generate background ideas.');
            
            const imagePromises = backgroundIdeas.map(async (idea) => {
                const ideaText = idea[ideaKey];
                const imageGenPrompt = `A high-quality, photorealistic product photo. The product is placed in the following scene: "${ideaText}". The product should be the main focus, clearly visible, and well-integrated. The lighting should be professional. Additional style prompt: "${stylePrompt}". The image must have a ${aspectRatio} aspect ratio.`;
                
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: imageGenPrompt,
                    config: { 
                        numberOfImages: 1, 
                        outputMimeType: 'image/png', 
                        // @ts-ignore - AspectRatio enum values match API expectations
                        aspectRatio: aspectRatio,
                    },
                });

                if (response.generatedImages?.[0]?.image?.imageBytes) {
                    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                    return {
                        src: `data:image/png;base64,${base64ImageBytes}`,
                        label: ideaText,
                    };
                }
                throw new Error(`Image generation failed for background: ${ideaText}`);
            });

            return Promise.all(imagePromises);
        }

        // Image-to-image editing (existing logic)
        if (!referenceImageFile) throw new Error("A product reference image is required for this model.");
        
        let modelPart = null;
        if (modelFile) {
            modelPart = await fileToGenerativePart(modelFile);
        }

        if (backgroundOption === ProductBackgroundOption.CustomImage) {
            if (!customBackgroundFile) throw new Error("A custom background image must be provided.");
            const imagePart = await fileToGenerativePart(referenceImageFile);
            const backgroundPart = await fileToGenerativePart(customBackgroundFile);

            const imagePromises = Array.from({ length: numberOfPhotos }).map(async (_, i) => {
                let imageGenPrompt: string;
                const parts: any[] = [imagePart];
        
                if (modelPart) {
                    parts.push(modelPart, backgroundPart);
                    imageGenPrompt = `Take the product from the first image and the person from the second image. Realistically place them both onto the provided background image (the third image). The person should interact naturally with the product. The lighting on both should match the new background. Apply this style: "${stylePrompt}". Introduce a slight variation for uniqueness. The final image must have a ${aspectRatio} aspect ratio and be a photorealistic, high-quality product photo.`;
                } else {
                    parts.push(backgroundPart);
                    imageGenPrompt = `Take the main subject/product from the provided reference image (the first image) and realistically place it onto the provided background image (the second image). The product should be the main focus, well-integrated, and the lighting on the product should match the new background. Apply this style: "${stylePrompt}". Introduce a slight variation if this is not the first generation. The final image must have a ${aspectRatio} aspect ratio and be a photorealistic, high-quality product photo.`;
                }
                parts.push({ text: imageGenPrompt });

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image-preview',
                    contents: { parts },
                    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
                });

                const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
                if (imageContent?.inlineData) {
                    return {
                        src: `data:${imageContent.inlineData.mimeType};base64,${imageContent.inlineData.data}`,
                        label: `Custom Background ${i + 1}`,
                    };
                }
                throw new Error(`Image generation failed for custom background variation ${i + 1}`);
            });
            return Promise.all(imagePromises);
        }

        let backgroundIdeasPrompt: string;
        let responseSchema: any;
        let ideaKey: 'name' | 'description';

        if (backgroundOption === ProductBackgroundOption.FamousPlaces) {
            backgroundIdeasPrompt = `Generate a list of ${numberOfPhotos} famous world landmarks suitable for a product photoshoot background. Examples: Eiffel Tower in Paris, Times Square in New York. Return the list as a JSON array of objects, where each object has a "name" key.`;
            responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } } };
            ideaKey = 'name';
        } else { // ProfessionalStudio
            backgroundIdeasPrompt = `Generate a list of ${numberOfPhotos} distinct professional product photography studio setups. Describe the surface, lighting, and background color/texture. Examples: 'On a reflective black acrylic surface with a soft spotlight', 'On a rustic wooden table with a blurred warm background'. Return the list as a JSON array of objects, where each object has a "description" key.`;
            responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING } } } };
            ideaKey = 'description';
        }

        const ideasResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: backgroundIdeasPrompt,
            config: { responseMimeType: "application/json", responseSchema }
        });

        const backgroundIdeas: { [key: string]: string }[] = JSON.parse(ideasResponse.text);
        if (!backgroundIdeas || backgroundIdeas.length === 0) throw new Error('Could not generate background ideas.');
        
        const imagePart = await fileToGenerativePart(referenceImageFile);
        const imagePromises = backgroundIdeas.map(async (idea) => {
            const ideaText = idea[ideaKey];
            let imageGenPrompt: string;
            const parts: any[] = [imagePart];

            if (modelPart) {
                parts.push(modelPart);
                imageGenPrompt = `Take the product from the first image and the person from the second image. Realistically place them both in the following scene: "${ideaText}". The person should interact naturally with the product (e.g., holding it, pointing to it). The lighting on both the person and product must match the new background. Apply this style: "${stylePrompt}". The final image must have a ${aspectRatio} aspect ratio and be a photorealistic, high-quality product photo.`;
            } else {
                imageGenPrompt = `Take the main subject/product from the provided reference image and realistically place it in the following scene: "${ideaText}". The product should be the main focus, well-integrated, and the lighting on the product should match the new background. Apply this style: "${stylePrompt}". The final image must have a ${aspectRatio} aspect ratio and be a photorealistic, high-quality product photo.`;
            }
            parts.push({ text: imageGenPrompt });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imageContent?.inlineData) {
                return {
                    src: `data:${imageContent.inlineData.mimeType};base64,${imageContent.inlineData.data}`,
                    label: ideaText,
                };
            }
            throw new Error(`Image generation failed for background: ${ideaText}`);
        });
        return Promise.all(imagePromises);

    } catch (error) {
        console.error("Error in Gemini service (Product Photos):", error);
        throw error;
    }
};
