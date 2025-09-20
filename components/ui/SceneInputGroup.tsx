import React from 'react';
import { MessageSquarePlus, PauseCircle, Volume2, Plus, Trash2 } from 'lucide-react';
import { SceneData, Subject, GObject, SelectOptions } from '../../types';
import { fullCameraMovementOptions, motionEffectOptions, cgiOptions, languageOptions, emotionAndIntonationOptions } from '../../constants';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import SelectField from './SelectField';

interface SceneInputGroupProps {
    sceneData: SceneData;
    onChange: (field: keyof Omit<SceneData, 'id' | 'sceneSequence' | 'objects'>, value: string) => void;
    availableCharacters: Subject[];
    onAddSequenceItem: (type: 'dialog' | 'pause' | 'sfx') => void;
    onRemoveSequenceItem: (index: number) => void;
    onSequenceChange: (index: number, field: string, value: string) => void;
    onAddObject: () => void;
    onRemoveObject: (index: number) => void;
    onObjectChange: (index: number, value: string) => void;
    availableObjects: GObject[];
    availableActions: SelectOptions;
}

const SceneInputGroup: React.FC<SceneInputGroupProps> = ({
    sceneData, onChange, availableCharacters, onAddSequenceItem, onRemoveSequenceItem, onSequenceChange,
    onAddObject, onRemoveObject, onObjectChange, availableObjects, availableActions
}) => (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
        <InputField label="Durasi" name="duration" value={sceneData.duration} onChange={(e) => onChange('duration', e.target.value)} placeholder="Contoh: 4 detik" />
        <SelectField label="Pilih Aksi dari Pustaka (Opsional)" name="actionLibrary" value={''} onChange={(e) => onChange('description', e.target.value)} options={availableActions} defaultOption="Pilih Aksi..." />
        <TextAreaField label="Deskripsi Adegan" name="description" value={sceneData.description} onChange={(e) => onChange('description', e.target.value)} rows={3} placeholder="Jelaskan apa yang terjadi..." tooltip="Tulis deskripsi aksi utama dalam adegan ini, atau pilih dari pustaka di atas." />
        <SelectField label="Gerakan Kamera" name="cameraMovement" value={sceneData.cameraMovement} onChange={(e) => onChange('cameraMovement', e.target.value)} options={fullCameraMovementOptions} defaultOption="Pilih Gerakan..." tooltip="Pilih pergerakan kamera untuk menambah dinamisme pada adegan Anda. Contoh: 'Tracking shot' mengikuti karakter." />
        <SelectField label="Animation FX" name="animationFx" value={sceneData.animationFx} onChange={(e) => onChange('animationFx', e.target.value)} options={motionEffectOptions} defaultOption="Pilih FX..." tooltip="Efek visual berbasis animasi seperti kilatan senjata, percikan sihir, atau transisi." />
        <SelectField label="CGI FX" name="cgiFx" value={sceneData.cgiFx} onChange={(e) => onChange('cgiFx', e.target.value)} options={cgiOptions} defaultOption="Pilih CGI..." tooltip="Efek visual yang lebih kompleks seperti simulasi ledakan, karakter 3D, atau perubahan lingkungan." />
        
        <div className="border-t border-gray-700 pt-4">
             <h5 className="text-md font-semibold text-white mb-2">Rangkaian Dialog & Suara</h5>
             {sceneData.sceneSequence.map((item, index) => (
                 <div key={item.id} className="bg-gray-800 p-3 rounded-lg mb-2 relative">
                     <button type="button" onClick={() => onRemoveSequenceItem(index)} className="absolute top-2 right-2 text-red-400 hover:text-white p-1" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                     {item.type === 'dialog' && (
                         <div className="space-y-2">
                            <SelectField label="Karakter" name="characterId" value={item.characterId!} onChange={(e) => onSequenceChange(index, 'characterId', e.target.value)} options={availableCharacters.map(c => ({ value: c.id, label: c.name }))} defaultOption="Pilih Karakter..." />
                            <TextAreaField label="Teks Dialog" name="dialogText" value={item.dialogText!} onChange={(e) => onSequenceChange(index, 'dialogText', e.target.value)} rows={2} />
                            <SelectField label="Bahasa" name="language" value={item.language!} onChange={(e) => onSequenceChange(index, 'language', e.target.value)} options={languageOptions} defaultOption="Pilih Bahasa..." />
                            <SelectField label="Intonasi" name="intonation" value={item.intonation!} onChange={(e) => onSequenceChange(index, 'intonation', e.target.value)} options={emotionAndIntonationOptions} defaultOption="Pilih Intonasi..." />
                         </div>
                     )}
                     {item.type === 'pause' && <InputField label="Durasi Jeda (detik)" name="duration" type="number" value={item.duration!} onChange={(e) => onSequenceChange(index, 'duration', e.target.value)} />}
                     {item.type === 'sfx' && <InputField label="Deskripsi Efek Suara" name="description" value={item.description!} onChange={(e) => onSequenceChange(index, 'description', e.target.value)} placeholder="Contoh: suara klakson mobil"/>}
                 </div>
             ))}
             <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => onAddSequenceItem('dialog')} className="text-sm bg-cyan-600 hover:bg-cyan-700 font-bold py-2 px-3 rounded-lg flex items-center gap-2"><MessageSquarePlus className="w-4 h-4" /> Dialog</button>
                <button type="button" onClick={() => onAddSequenceItem('pause')} className="text-sm bg-yellow-600 hover:bg-yellow-700 font-bold py-2 px-3 rounded-lg flex items-center gap-2"><PauseCircle className="w-4 h-4" /> Jeda</button>
                <button type="button" onClick={() => onAddSequenceItem('sfx')} className="text-sm bg-green-600 hover:bg-green-700 font-bold py-2 px-3 rounded-lg flex items-center gap-2"><Volume2 className="w-4 h-4" /> Efek Suara</button>
             </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
             <h5 className="text-md font-semibold text-white mb-2">Objek Tambahan</h5>
             {sceneData.objects.map((obj, index) => (
                 <div key={obj.id} className="flex items-center gap-2">
                     <div className="flex-grow"><SelectField label={`Objek #${index + 1}`} name="objectId" value={obj.objectId} onChange={(e) => onObjectChange(index, e.target.value)} options={availableObjects.map(o => ({ value: o.id, label: o.name }))} defaultOption="Pilih Objek..." /></div>
                     <button type="button" onClick={() => onRemoveObject(index)} className="bg-red-600 p-2 rounded-full self-end mb-1"><Trash2 className="w-4 h-4" /></button>
                 </div>
             ))}
             <button type="button" onClick={onAddObject} className="text-sm bg-cyan-600 hover:bg-cyan-700 font-bold py-2 px-3 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah Objek</button>
        </div>
    </div>
);

export default SceneInputGroup;