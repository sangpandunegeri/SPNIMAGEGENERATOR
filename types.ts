export type Page = 
  | 'home'
  | 'subjectBuilder'
  | 'objectBuilder'
  | 'locationBuilder'
  | 'actionBuilder'
  | 'imageDetector'
  | 'manualMode'
  | 'stopMotionShot'
  | 'storyboardGenerator'
  | 'imageFusion'
  | 'videoFusion'
  | 'promptBank'
  | 'settings'
  | 'help'
  | 'videoGenerator'
  | 'storyGenerator'
  | 'imageGenerator';

export enum AssetType {
    Subjek = 'Subjek',
    Objek = 'Objek',
    Lokasi = 'Lokasi',
    Aksi = 'Aksi'
}

export type TargetEngine = 'veo' | 'runway' | 'kling' | 'imagen' | 'midjourney' | 'flux';

export interface BaseAsset {
    id: string;
    name: string;
}

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  page: Page;
}

export interface NavGroup {
  icon: React.ReactNode;
  label: string;
  children: NavItem[];
}

export type NavigationStructureItem = NavItem | NavGroup;


export interface Subject extends BaseAsset {
    gender?: string;
    age?: string;
    country?: string;
    height?: string;
    weight?: string;
    bodyShape?: string;
    faceDescription?: string;
    hairDescription?: string;
    clothingDescription?: string;
    accessoryDescription?: string;
}

export interface GObject extends BaseAsset {
    category?: string;
    era_style?: string;
    mainColor?: string;
    secondaryColor?: string;
    material?: string;
    texture?: string;
    condition?: string;
    size?: string;
    shape?: string;
    function?: string;
    interactiveParts?: string;
    currentState?: string;
    emittedLight?: string;
    emittedSound?: string;
    uniqueFeatures?: string;
    history?: string;
}

export interface Location extends BaseAsset {
    atmosphere?: string;
    keyElements?: string;
}

export interface Action extends BaseAsset {
    genre?: string;
}

export type Asset = Subject | GObject | Location | Action;

export interface FormField {
    label: string;
    name?: string;
    type: 'heading' | 'text' | 'number' | 'textarea' | 'select';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultOption?: string;
    tooltip?: string;
}

export interface Option {
    value: string;
    label: string;
    previewUrl?: string;
}

export interface OptionGroup {
    label: string;
    options: Option[];
}

export type SelectOptions = (Option | OptionGroup)[];

export interface SceneSequenceItem {
    id: string;
    type: 'dialog' | 'pause' | 'sfx';
    characterId?: string;
    dialogText?: string;
    language?: string;
    intonation?: string;
    duration?: string;
    description?: string;
}

export interface SceneObject {
    id: string;
    objectId: string;
}

export interface SceneData {
    id: string;
    duration: string;
    description: string;
    cameraMovement: string;
    animationFx: string;
    cgiFx: string;
    sceneSequence: SceneSequenceItem[];
    objects: SceneObject[];
}

export interface EditableLocation {
    name: string;
    atmosphere: string;
    keyElements: string;
}

export interface ManualFormData {
    visualStyle: string;
    mood: string;
    lighting: string;
    cameraTypeAndLens: string;
    typeShot: string;
    location: EditableLocation;
    time: string;
    weather: string;
    additionalVisualDetails: string;
    mainCharacterId: string;
    supportingCharacterIds: string[];
    extrasDescription: string;
    scene: SceneData;
}

export interface StopMotionAction {
    id: string;
    description: string;
    duration: string;
    cameraMovement: string;
}

export interface StopMotionFormData {
    visualStyle: string;
    mood: string;
    location: EditableLocation;
    time: string;
    weather: string;
    mainCharacterId: string;
    actions: StopMotionAction[];
}

export interface Prompt {
    id: string;
    promptText: string;
    jsonOutput?: string;
    sourceData: any;
    mode: string;
    timestamp: {
        toDate: () => Date;
    };
}