import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useI18n, useVideos } from '../App';
import type { CalculatorType, Video } from '../types';


// --- TESTS PAGE ---
const TestCard: React.FC<{ title: string; description: string; icon: string; testId: string; }> = ({ title, description, icon, testId }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/test/${testId}`)} className="test-card bg-surface rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-secondary transition-all cursor-pointer text-center flex flex-col">
            <div className="text-5xl mb-4 flex justify-center">{icon}</div>
            <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
            <p className="text-sm text-text-secondary flex-grow">{description}</p>
        </div>
    );
};

export const TestsPage: React.FC = () => {
    const { t } = useI18n();
    const tests = [
        { id: 'snellen', title: t('tests.snellen.title'), description: t('tests.snellen.description'), icon: '👁️' },
        { id: 'lvrc', title: t('tests.lvrc.title'), description: t('tests.lvrc.description'), icon: '🔢' },
        { id: 'echart', title: t('tests.echart.title'), description: t('tests.echart.description'), icon: '🇪' },
        { id: 'landolt', title: t('tests.landolt.title'), description: t('tests.landolt.description'), icon: '⭕' },
        { id: 'pediatric', title: t('tests.pediatric.title'), description: t('tests.pediatric.description'), icon: '🧸' },
        { id: 'amsler', title: t('tests.amsler.title'), description: t('tests.amsler.description'), icon: '⊞' },
        { id: 'bichromatic', title: t('tests.bichromatic.title'), description: t('tests.bichromatic.description'), icon: '🟥🟩' },
        { id: 'bichromaticNumbers', title: t('tests.bichromaticNumbers.title'), description: t('tests.bichromaticNumbers.description'), icon: '1️⃣2️⃣' },
        { id: 'ishihara', title: t('tests.ishihara.title'), description: t('tests.ishihara.description'), icon: '🎨' },
        { id: 'contrast', title: t('tests.contrast.title'), description: t('tests.contrast.description'), icon: '🔘' },
        { id: 'okn', title: t('tests.okn.title'), description: t('tests.okn.description'), icon: '🌀' },
        { id: 'visualField', title: t('tests.visualField.title'), description: t('tests.visualField.description'), icon: '✨' },
    ];

    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">{t('tests.pageTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tests.map(test => <TestCard key={test.id} {...test} testId={test.id} />)}
            </div>
        </div>
    );
};

// --- CALCULATORS PAGE ---

const AstigmatismCalculator: React.FC = () => {
    const { t } = useI18n();
    const [state, setState] = useState({ sph: '0.00', cyl: '0.00', axis: '0' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const result = useMemo(() => {
        const sph = parseFloat(state.sph) || 0;
        const cyl = parseFloat(state.cyl) || 0;
        const axis = parseInt(state.axis) || 0;

        const transposedSph = (sph + cyl).toFixed(2);
        const transposedCyl = (-cyl).toFixed(2);
        let transposedAxis = axis + 90;
        if (transposedAxis > 180) transposedAxis -= 180;

        const sphericalEquivalent = (sph + (cyl / 2)).toFixed(2);

        return { transposed: `Esf: ${transposedSph} Cil: ${transposedCyl} Eixo: ${transposedAxis}°`, se: sphericalEquivalent };
    }, [state]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <input type="number" name="sph" value={state.sph} onChange={handleChange} placeholder={t('calculators.common.sph')} className="p-2 border rounded" />
                <input type="number" name="cyl" value={state.cyl} onChange={handleChange} placeholder={t('calculators.common.cyl')} className="p-2 border rounded" />
                <input type="number" name="axis" value={state.axis} onChange={handleChange} placeholder={t('calculators.common.axis')} className="p-2 border rounded" />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p><strong>{t('calculators.astigmatism.transposed')}:</strong> {result.transposed}</p>
                <p><strong>{t('calculators.astigmatism.se')}:</strong> {result.se}</p>
            </div>
        </div>
    );
};

const PresbyopiaCalculator: React.FC = () => {
    const { t } = useI18n();
    const [age, setAge] = useState('40');
    const estimatedAdd = useMemo(() => {
        const ageNum = parseInt(age);
        if (ageNum < 40) return "0.00";
        if (ageNum <= 45) return "+1.00 a +1.25";
        if (ageNum <= 50) return "+1.50 a +1.75";
        if (ageNum <= 55) return "+2.00 a +2.25";
        if (ageNum <= 60) return "+2.50";
        return "+2.50 a +3.00";
    }, [age]);

    return (
        <div className="space-y-4">
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder={t('calculators.presbyopia.age')} className="w-full p-2 border rounded" />
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p><strong>{t('calculators.presbyopia.estimatedAdd')}:</strong> {estimatedAdd}</p>
            </div>
        </div>
    );
};


const VertexCalculator: React.FC = () => {
    const { t } = useI18n();
    const [state, setState] = useState({ power: '', oldDist: '12', newDist: '10' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const compensatedPower = useMemo(() => {
        const d = parseFloat(state.power);
        const x = (parseFloat(state.oldDist) - parseFloat(state.newDist)) / 1000; // in meters
        if (isNaN(d) || isNaN(x)) return '0.00';
        return (d / (1 - x * d)).toFixed(2);
    }, [state]);

    return (
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
                 <input type="number" name="power" value={state.power} onChange={handleChange} placeholder={t('calculators.vertex.power')} className="p-2 border rounded" />
                 <input type="number" name="oldDist" value={state.oldDist} onChange={handleChange} placeholder={t('calculators.vertex.oldDist')} className="p-2 border rounded" />
                 <input type="number" name="newDist" value={state.newDist} onChange={handleChange} placeholder={t('calculators.vertex.newDist')} className="p-2 border rounded" />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p><strong>{t('calculators.vertex.compensatedPower')}:</strong> {compensatedPower} D</p>
            </div>
        </div>
    );
};

const InDevelopmentCalculator: React.FC = () => {
    const { t } = useI18n();
    return <div className="text-center text-text-secondary p-8 bg-gray-100 rounded-lg">{t('calculators.common.inDevelopment')}</div>;
};

const calculators: Record<CalculatorType, { title: string; description: string; component: React.FC }> = {
    astigmatismo: { title: 'astigmatism.title', description: 'astigmatism.description', component: AstigmatismCalculator },
    presbiopia: { title: 'presbyopia.title', description: 'presbyopia.description', component: PresbyopiaCalculator },
    vertex: { title: 'vertex.title', description: 'vertex.description', component: VertexCalculator },
    traumaOcular: { title: 'trauma.title', description: 'trauma.description', component: InDevelopmentCalculator },
    dryEye: { title: 'dryEye.title', description: 'dryEye.description', component: InDevelopmentCalculator },
    refração: { title: 'Refração', description: 'Calcular refração', component: InDevelopmentCalculator}, // Not in locales, example
};


export const CalculatorsPage: React.FC = () => {
    const { t } = useI18n();
    const [activeCalc, setActiveCalc] = useState<CalculatorType>('astigmatismo');
    const ActiveCalculator = calculators[activeCalc].component;

    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">{t('calculators.pageTitle')}</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/3 lg:w-1/4">
                    <ul className="space-y-2">
                        {Object.keys(calculators).map(key => {
                             const calc = calculators[key as CalculatorType];
                             return (
                                // FIX: Improved readability by adding explicit text colors for inactive items.
                                // This ensures high contrast against the white background, making calculator names easy to read.
                                <li key={key} onClick={() => setActiveCalc(key as CalculatorType)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${activeCalc === key ? 'bg-secondary text-white shadow-md' : 'bg-surface hover:bg-gray-100'}`}>
                                    <h4 className={`font-semibold ${activeCalc !== key && 'text-primary'}`}>{t(`calculators.${calc.title}`)}</h4>
                                    <p className={`text-xs ${activeCalc !== key ? 'text-text-secondary' : 'opacity-80'}`}>{t(`calculators.${calc.description}`)}</p>
                                </li>
                            )
                        })}
                    </ul>
                </aside>
                <main className="flex-1 bg-surface p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-primary mb-4">{t(`calculators.${calculators[activeCalc].title}`)}</h3>
                    <ActiveCalculator />
                </main>
            </div>
        </div>
    );
};


// --- VIDEOS PAGE ---
export const VideosPage: React.FC = () => {
    const { t } = useI18n();
    const { videos, addVideo } = useVideos();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
<<<<<<< HEAD
            reader.onload = async (e) => {
=======
            reader.onload = (e) => {
>>>>>>> 55c9eae83c5b5087bd5334a8c2bd725e8a8a5db7
                const newVideo: Video = {
                    id: `video_${Date.now()}`,
                    name: file.name,
                    url: e.target?.result as string,
                };
<<<<<<< HEAD
                await addVideo(newVideo);
=======
                addVideo(newVideo);
>>>>>>> 55c9eae83c5b5087bd5334a8c2bd725e8a8a5db7
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">{t('videos.pageTitle')}</h2>
                <button onClick={() => fileInputRef.current?.click()} className="bg-secondary text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors">
                    {t('videos.upload')}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.length > 0 ? (
                    videos.map(video => (
                        <div key={video.id} className="bg-surface rounded-lg shadow-lg overflow-hidden">
                            <video controls src={video.url} className="w-full h-48 object-cover"></video>
                            <div className="p-4">
                                <p className="text-sm font-semibold truncate">{video.name}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-text-secondary py-8">{t('videos.noVideos')}</p>
                )}
            </div>
        </div>
    );
}

// --- SETTINGS PAGE ---
export const SettingsPage: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { t } = useI18n();
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: name === 'language' ? value : parseFloat(value) }));
    };

    const handleSave = () => {
        updateSettings(localSettings);
        alert(t('settings.saved'));
    };
    
    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">{t('settings.pageTitle')}</h2>
            <div className="max-w-md mx-auto bg-surface p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">{t('settings.displayAndTests')}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t('settings.language')}</label>
                        <select id="language" name="language" value={localSettings.language} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md">
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="screenSize" className="block text-sm font-medium text-gray-700">{t('settings.screenSize')}</label>
                        <input type="number" id="screenSize" name="screenSize" value={localSettings.screenSize} onChange={handleChange} step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="userDistance" className="block text-sm font-medium text-gray-700">{t('settings.userDistance')}</label>
                        <input type="number" id="userDistance" name="userDistance" value={localSettings.userDistance} onChange={handleChange} step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                    </div>
                </div>
                 <div className="mt-6">
                    <button onClick={handleSave} className="w-full bg-secondary text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600">{t('settings.save')}</button>
                </div>
            </div>
        </div>
    );
};