import { Subject, GObject, Location, ManualFormData, StopMotionFormData, TargetEngine } from '../types';

// Helper to build a description string from an object, skipping empty values
const buildDescription = (data: Record<string, string | undefined>, descriptions: Record<string, string>): string => {
    return Object.entries(descriptions)
        .map(([key, prefix]) => {
            const value = data[key];
            return value ? `${prefix} ${value}`.trim() : '';
        })
        .filter(Boolean)
        .join(', ');
};

export const generateSubjectDescription = (subject: Subject): string => {
    let description = `${subject.name}`;
    const primaryDetails: Record<string, string | undefined> = {
        age: subject.age,
        gender: subject.gender,
        country: subject.country,
    };
    const primaryDesc = buildDescription(primaryDetails, {
       age: 'aged',
       gender: '',
       country: 'from'
    });
    if (primaryDesc) description += ` (${primaryDesc})`;

    const physicalDetails: Record<string, string | undefined> = {
        height: subject.height,
        weight: subject.weight,
        bodyShape: subject.bodyShape,
        faceDescription: subject.faceDescription,
        hairDescription: subject.hairDescription,
    };
    const physicalDesc = buildDescription(physicalDetails, {
        height: 'with a height of',
        weight: 'and weight of',
        bodyShape: 'has a body shape of',
        faceDescription: '',
        hairDescription: '',
    });
    if (physicalDesc) description += `, who ${physicalDesc}`;

    const attireDetails: Record<string, string | undefined> = {
        clothingDescription: subject.clothingDescription,
        accessoryDescription: subject.accessoryDescription,
    };
    const attireDesc = buildDescription(attireDetails, {
        clothingDescription: 'wearing',
        accessoryDescription: 'accessorized with',
    });
    if (attireDesc) description += `. They are ${attireDesc}`;

    return description.replace(/\s+/g, ' ').trim() + '.';
};

export const generateObjectDescription = (obj: GObject): string => {
    let description = `A ${obj.name}`;
    const primaryDetails: Record<string, string | undefined> = {
        condition: obj.condition,
        size: obj.size,
        era_style: obj.era_style,
        category: obj.category
    };
    const primaryDesc = buildDescription(primaryDetails, {
        condition: '',
        size: '',
        era_style: '',
        category: ''
    });
    if (primaryDesc) description += ` (${primaryDesc})`;

    const physicalDetails: Record<string, string | undefined> = {
        shape: obj.shape,
        material: obj.material,
        texture: obj.texture,
        mainColor: obj.mainColor,
        secondaryColor: obj.secondaryColor
    };
    const physicalDesc = buildDescription(physicalDetails, {
       shape: 'shaped like a',
       material: 'made of',
       texture: 'with a texture of',
       mainColor: 'predominantly',
       secondaryColor: 'with hints of'
    });
    if (physicalDesc) description += `, which is ${physicalDesc}`;
    
    if (obj.uniqueFeatures) description += `. It has some unique features: ${obj.uniqueFeatures}`;
    if (obj.currentState) description += `. Currently, it is ${obj.currentState}`;

    return description.replace(/\s+/g, ' ').trim() + '.';
};

const generateEditableLocationDescription = (location: ManualFormData['location']): string => {
    let description = location.name || "an unspecified location";
    if (location.atmosphere) {
        description += `, a place with a ${location.atmosphere} atmosphere`;
    }
    if (location.keyElements) {
        description += `. Key elements include: ${location.keyElements}`;
    }
    return description;
};

export const constructCinematicPrompt = (
    formData: ManualFormData,
    subjects: Subject[],
    objects: GObject[],
    targetEngine: TargetEngine
): string => {
    const { scene, ...global } = formData;
    const mainChar = subjects.find(s => s.id === global.mainCharacterId);
    
    // Define these at the top to be used by all engine logic
    const supportingChars = global.supportingCharacterIds
        .map(id => subjects.find(s => s.id === id))
        .filter((s): s is Subject => !!s);
    const sceneObjects = scene.objects
        .map(o => objects.find(obj => obj.id === o.objectId))
        .filter((o): o is GObject => !!o);

    const effects: string[] = [scene.animationFx, scene.cgiFx].filter((e): e is string => !!e);

    // --- Image Model Logic ---
    if (['imagen', 'midjourney', 'flux'].includes(targetEngine)) {
        const imageNarrative = constructCinematicImageNarrative(formData, subjects);
        if (targetEngine === 'imagen') {
            return imageNarrative;
        }
        
        // For Midjourney & Flux
        const imageParts = [
            global.visualStyle,
            global.typeShot,
            mainChar ? generateSubjectDescription(mainChar).replace(/\./g, '') : 'a character',
            scene.description,
            `in ${generateEditableLocationDescription(global.location)}`,
            `${global.mood} mood`,
            global.lighting,
            `shot on ${global.cameraTypeAndLens}`,
            global.additionalVisualDetails,
            ...effects,
            'cinematic', 'photorealistic', 'high detail'
        ];
        return imageParts.filter(Boolean).join(', ') + ' --ar 16:9';
    }

    // --- Video Model Logic ---
    
    // For Runway & Kling (keyword-based)
    if (['runway', 'kling'].includes(targetEngine)) {
        const sequenceKeywords = scene.sceneSequence.map(item => {
            switch (item.type) {
                case 'dialog':
                    const character = subjects.find(s => s.id === item.characterId);
                    const charName = character ? character.name : 'character';
                    return `${charName} says "${item.dialogText || ''}" (${item.intonation || 'normal intonation'})`;
                case 'sfx':
                    return `sound effect of ${item.description || 'a sound'}`;
                default:
                    return null;
            }
        }).filter(Boolean).join(', ');

        const corePhrases = [
            global.visualStyle,
            mainChar ? generateSubjectDescription(mainChar).replace(/\./g, '') : null,
            supportingChars.length > 0 ? `also featuring ${supportingChars.map(s => generateSubjectDescription(s).replace(/\./g, '')).join(', ')}` : null,
            scene.description,
            `in ${generateEditableLocationDescription(global.location)}`,
            `during the ${global.time}`,
            `${global.weather} weather`,
            `${global.mood} mood`,
            global.lighting,
            global.cameraTypeAndLens,
            global.typeShot,
            scene.cameraMovement,
            ...effects,
            sequenceKeywords,
            sceneObjects.length > 0 ? `The scene includes these objects: ${sceneObjects.map(o => generateObjectDescription(o).replace(/\./g, '')).join(', ')}` : null,
            global.additionalVisualDetails
        ];
        return corePhrases.filter(Boolean).join(', ');
    }

    // Default: VEO (narrative-based)
    const phrases: string[] = [];
    phrases.push(`A highly detailed, cinematic video in a ${global.visualStyle || 'photorealistic'} style.`);
    let locationDesc = `The scene unfolds in ${generateEditableLocationDescription(global.location)}`;
    if (global.time || global.weather) {
        locationDesc += ` during the ${global.time || 'day'}`;
        if (global.weather) locationDesc += ` under ${global.weather.toLowerCase()} skies`;
    }
    phrases.push(locationDesc + '.');
    phrases.push(`The atmosphere is intensely ${global.mood || 'neutral'}, achieved through ${global.lighting || 'natural lighting'}.`);
    let cameraDesc = `Shot on a ${global.cameraTypeAndLens || 'standard cinema camera'}, the frame is a ${global.typeShot || 'medium shot'}`;
    if (scene.cameraMovement) {
        cameraDesc += `. The camera executes a dynamic ${scene.cameraMovement.toLowerCase()}`;
    }
    phrases.push(cameraDesc + '.');
    
    if (mainChar) {
        phrases.push(`The main focus is on ${generateSubjectDescription(mainChar)}`);
    }

    if (supportingChars.length > 0) {
        phrases.push(`Also present in the scene are: ${supportingChars.map(s => generateSubjectDescription(s)).join(' ')}`);
    }

    if (sceneObjects.length > 0) {
        phrases.push(`The scene prominently features these objects: ${sceneObjects.map(o => generateObjectDescription(o)).join(' ')}`);
    }
    
    if (scene.description) {
        phrases.push(`The core of the scene revolves around this action: ${scene.description}.`);
    }

    if (effects.length > 0) {
        phrases.push(`The visual narrative is enhanced with stunning effects, including ${effects.join(' and ')}.`);
    }

    if (global.additionalVisualDetails) {
        phrases.push(`Final visual touches include: ${global.additionalVisualDetails}.`);
    }

    if (scene.sceneSequence && scene.sceneSequence.length > 0) {
        const sequenceDescriptions = scene.sceneSequence.map(item => {
            switch (item.type) {
                case 'dialog':
                    const character = subjects.find(s => s.id === item.characterId);
                    const charName = character ? character.name : 'A character';
                    let dialogDesc = `${charName} says, "${item.dialogText || ''}"`;
                    const details = [];
                    if (item.language && item.language !== 'Tanpa Bahasa') details.push(`in ${item.language}`);
                    if (item.intonation) details.push(`with a ${item.intonation} intonation`);
                    if (details.length > 0) dialogDesc += ` ${details.join(' ')}`;
                    return dialogDesc;
                case 'pause':
                    return `a pause for ${item.duration || 1} second(s)`;
                case 'sfx':
                    return `the sound of ${item.description || 'an undescribed sound'} is heard`;
                default:
                    return '';
            }
        }).filter(Boolean);

        if (sequenceDescriptions.length > 0) {
            phrases.push(`The scene's audio sequence is as follows: ${sequenceDescriptions.join(', followed by ')}.`);
        }
    }

    return phrases.join(' ').replace(/\s+/g, ' ').trim();
};

export const constructCinematicImageNarrative = (
    formData: ManualFormData,
    subjects: Subject[]
): string => {
    const { scene, ...global } = formData;
    const mainChar = subjects.find(s => s.id === global.mainCharacterId);

    const parts: string[] = [];

    if (global.visualStyle) parts.push(global.visualStyle);
    if (global.typeShot) parts.push(global.typeShot);

    let coreDescription = '';
    if (mainChar) {
        coreDescription += generateSubjectDescription(mainChar);
    } else {
        coreDescription += `A character`;
    }

    if (scene.description) {
        coreDescription += ` performs the action: ${scene.description}`;
    }
    parts.push(coreDescription);

    let locationStr = `The setting is ${generateEditableLocationDescription(global.location)}`;
    if (global.time) locationStr += ` during the ${global.time}`;
    parts.push(locationStr);

    let atmosphereStr = `The mood is intensely ${global.mood || 'neutral'}`;
    if (global.lighting) {
        atmosphereStr += `, sculpted by ${global.lighting.toLowerCase()} lighting`;
    }
    parts.push(atmosphereStr);

    if (global.cameraTypeAndLens) {
        parts.push(`captured with the distinct look of a ${global.cameraTypeAndLens}`);
    }

    if (global.additionalVisualDetails) {
        parts.push(`Key visual details include: ${global.additionalVisualDetails}`);
    }
    
    const effects: string[] = [];
    if (scene.animationFx) effects.push(scene.animationFx);
    if (scene.cgiFx) effects.push(scene.cgiFx);
    if (effects.length > 0) {
        parts.push(`The scene is enhanced with effects like ${effects.join(' and ')}.`);
    }

    return parts.join('. ').replace(/\.\./g, '.').replace(/\s+/g, ' ').trim();
};

export const constructCinematicStopMotionPrompt = (
    formData: StopMotionFormData,
    subjects: Subject[],
    hasReferenceImage: boolean,
    targetEngine: TargetEngine
): string => {
    const { actions, ...global } = formData;
    const mainChar = subjects.find(s => s.id === global.mainCharacterId);

    const locationDesc = generateEditableLocationDescription(global.location);

    // --- Image Model Logic ---
    if (['imagen', 'midjourney', 'flux'].includes(targetEngine)) {
        const representativeAction = actions.length > 0 ? actions[0].description : 'standing still';
        if (targetEngine === 'imagen') {
            return `A stop motion animation frame in a ${global.visualStyle || 'charming'} style. ${mainChar ? generateSubjectDescription(mainChar) : 'A character'} is ${representativeAction} in ${locationDesc}. The scene has a ${global.mood || 'neutral'} mood, set during the ${global.time || 'day'} with ${global.weather || 'clear'} weather.`;
        }
        const imageParts = [
            `stop motion animation`,
            global.visualStyle,
            mainChar ? generateSubjectDescription(mainChar).replace(/\./g, '') : 'a character',
            representativeAction,
            `in ${locationDesc}`,
            `${global.mood} mood`,
            `${global.time}, ${global.weather} weather`,
            'charming', 'handcrafted feel'
        ];
        return imageParts.filter(Boolean).join(', ') + ' --ar 16:9';
    }

    // --- Video Model Logic ---

    // For Runway & Kling (keyword-based)
    if (['runway', 'kling'].includes(targetEngine)) {
        const corePhrases = [
            `stop motion animation`,
            global.visualStyle,
            mainChar ? generateSubjectDescription(mainChar).replace(/\./g, '') : 'a character',
            `in ${locationDesc}`,
            `${global.mood} mood`,
            `during the ${global.time}`,
            `${global.weather} weather`,
        ];
        const actionKeywords = actions.map((action, index) => {
             return `shot ${index + 1}: ${action.description || 'pause'}, camera ${action.cameraMovement || 'static'}, for ${action.duration || '2'} seconds`;
        }).join('; ');
        corePhrases.push(actionKeywords);
        return corePhrases.filter(Boolean).join(', ');
    }

    // Default: VEO (narrative-based)
    const phrases: string[] = [];
    let opening = `A beautiful stop motion animation`;
    if (global.visualStyle) opening += ` with a ${global.visualStyle.toLowerCase()} aesthetic`;
    opening += `.`;
    if (hasReferenceImage) {
        opening += ` The final result must be visually inspired by the provided reference image, especially in terms of character design, color palette, and overall style.`;
    }
    phrases.push(opening);

    let settingDesc = `The scene is set in ${locationDesc}`;
    settingDesc += `, during the ${global.time || 'day'}`;
    if (global.weather) settingDesc += ` under ${global.weather.toLowerCase()} skies`;
    settingDesc += `, creating a ${global.mood || 'neutral'} mood.`;
    phrases.push(settingDesc);
    
    if (mainChar) {
        phrases.push(`The story follows ${generateSubjectDescription(mainChar)}`);
    }

    if (actions.length > 0) {
        const narrativeActionSequence = actions.map(action => {
            let actionPhrase = `for ${action.duration || '2'} seconds, ${mainChar ? mainChar.name : 'the character'} ${action.description || 'pauses'}`;
            if (action.cameraMovement) {
                actionPhrase += `, captured with a ${action.cameraMovement.toLowerCase()} camera movement`;
            }
            return actionPhrase;
        }).join(', then, ');
        phrases.push(`The sequence of actions is as follows: ${narrativeActionSequence}.`);
    }
    
    return phrases.join(' ').replace(/\s+/g, ' ').trim();
};