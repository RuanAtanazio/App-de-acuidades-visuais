import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings, useI18n } from '../App';

// --- Individual Test Components ---

const SnellenTest: React.FC<{ line: number, size: number }> = ({ line, size }) => {
    const lines = ["E", "F P", "T O Z", "L P E D", "P E C F D", "E D F C Z P", "F E L O P Z D", "D E F P O T E C"];
    const currentLine = lines[Math.min(line, lines.length - 1)];
    return <div className="text-black font-bold tracking-widest" style={{ fontSize: `${size}px` }}>{currentLine}</div>;
};

const LVRCTest: React.FC = () => (
    // FIX: Replaced the broken image link again with a more reliable source to ensure the test chart displays correctly.
    <img src="https://lowvision.preventblindness.org/wp-content/uploads/2018/11/B-2-LVRC-chart-for-website-1-1.jpg" alt="LVRC Number Chart" className="max-w-full max-h-full object-contain bg-white p-2" />
);

const AmslerGridTest: React.FC = () => (
    <div className="w-[80vmin] h-[80vmin] bg-white border-2 border-black p-2.5" style={{
        backgroundImage: 'linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)',
        backgroundSize: '2.5vmin 2.5vmin'
    }}>
        <div className="w-full h-full relative">
            <div className="absolute top-1/2 left-1/2 w-[1.5vmin] h-[1.5vmin] bg-black -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        </div>
    </div>
);

// NEW: Added a new test component for the Pediatric Chart.
// FIX: Replaced the unreliable Pinterest image link with a stable one to ensure the chart always loads correctly.
const PediatricChartTest: React.FC = () => (
    <img src="https://www.provisu.ch/images/b/b8/Echelle-de-Monoyer-enfants.png" alt="Pediatric Vision Chart" className="max-w-full max-h-full object-contain bg-white p-2" />
);

// NEW: Re-implemented the Bichromatic Test to be dynamic and interactive as requested.
// It now displays lines of letters that are added progressively with the "Next" button.
const BichromaticTestDynamic: React.FC<{ line: number }> = ({ line }) => {
    // UPDATED: Adjusted font sizes for better full-screen visibility.
    const lines = [
        { text: "M E W", size: "12vmin" },
        { text: "H R P D", size: "10vmin" },
        { text: "K F Z S H N", size: "8vmin" },
        { text: "T S K O N H D", size: "7vmin" },
        { text: "D S N E K F V T H", size: "6vmin" },
    ];

    const visibleLines = lines.slice(0, line + 1);

    return (
        // UPDATED: Container now fills height and removes max-width/aspect-ratio for a full-screen effect.
        <div className="w-full h-full flex font-mono font-bold text-black">
            {/* UPDATED: Red and Green divs now fill height and center content. */}
            <div className="w-1/2 h-full bg-red-500 flex flex-col items-center justify-center p-4">
                {visibleLines.map((l, index) => (
                    <div key={index} style={{ fontSize: l.size }} className="tracking-widest my-1">{l.text}</div>
                ))}
            </div>
            <div className="w-1/2 h-full bg-green-500 flex flex-col items-center justify-center p-4">
                 {visibleLines.map((l, index) => (
                    <div key={index} style={{ fontSize: l.size }} className="tracking-widest my-1">{l.text}</div>
                ))}
            </div>
        </div>
    );
};

// NEW: Added a new Bichromatic Test component that uses numbers instead of letters.
const BichromaticNumbersTestDynamic: React.FC<{ line: number }> = ({ line }) => {
    const lines = [
        { text: "7 2 5", size: "12vmin" },
        { text: "4 8 3 9", size: "10vmin" },
        { text: "6 1 5 2 7 8", size: "8vmin" },
        { text: "9 3 7 1 5 4 2", size: "7vmin" },
        { text: "5 8 2 6 9 1 4 3", size: "6vmin" },
    ];

    const visibleLines = lines.slice(0, line + 1);

    return (
        <div className="w-full h-full flex font-mono font-bold text-black">
            <div className="w-1/2 h-full bg-red-500 flex flex-col items-center justify-center p-4">
                {visibleLines.map((l, index) => (
                    <div key={index} style={{ fontSize: l.size }} className="tracking-widest my-1">{l.text}</div>
                ))}
            </div>
            <div className="w-1/2 h-full bg-green-500 flex flex-col items-center justify-center p-4">
                 {visibleLines.map((l, index) => (
                    <div key={index} style={{ fontSize: l.size }} className="tracking-widest my-1">{l.text}</div>
                ))}
            </div>
        </div>
    );
};

const OKNDrumTest: React.FC = () => {
    const { t } = useI18n();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [direction, setDirection] = useState<number>(0); // -1 for left, 0 for stop, 1 for right
    const [speed, setSpeed] = useState<number>(1);

    const changeDirection = (newDirection: number) => {
        if (newDirection === 0) {
            setDirection(0);
            setSpeed(1);
        } else if (direction === newDirection) {
            setSpeed(s => Math.min(s + 1, 10)); // Increase speed, max 10
        } else {
            setDirection(newDirection);
            setSpeed(1);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let offset = 0;
        let animationFrameId: number;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
        };
        
        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);
        
        resizeCanvas();

        const render = () => {
            offset += direction * speed * 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const stripeWidth = canvas.width / 10;
            
            for (let i = -1; i < (canvas.width / stripeWidth) + 1; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
                const x = (i * stripeWidth) + (offset % (stripeWidth * 2));
                ctx.fillRect(x, 0, stripeWidth, canvas.height);
            }
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            resizeObserver.disconnect();
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [direction, speed]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-gray-200">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
            <div className="absolute bottom-5 flex gap-4 z-10">
                <button onClick={() => changeDirection(-1)} className="bg-secondary text-white px-6 py-2 rounded-full font-semibold shadow-lg">◀ {t('testRunner.left')}</button>
                <button onClick={() => changeDirection(0)} className="bg-gray-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg">{t('testRunner.stop')}</button>
                <button onClick={() => changeDirection(1)} className="bg-secondary text-white px-6 py-2 rounded-full font-semibold shadow-lg">{t('testRunner.right')} ▶</button>
            </div>
        </div>
    );
};

// UPDATE: Redesigned the Tumbling E test to show a line of characters with random orientations
// controlled by the parent component's "Next"/"Previous" buttons.
const EChartTest: React.FC<{ line: number, size: number }> = ({ line, size }) => {
    const [rotations, setRotations] = useState<number[]>([]);
    
    // Define the number of 'E's for each line of the test
    const lineConfigs = useMemo(() => [
        { count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }, { count: 5 }, { count: 6 }, { count: 7 }, { count: 8 }
    ], []);

    // Re-randomize the direction of the 'E's every time the line changes
    useEffect(() => {
        const possibleRotations = [0, 90, 180, 270];
        const currentConfig = lineConfigs[Math.min(line, lineConfigs.length - 1)];
        const newRotations = Array.from({ length: currentConfig.count }, () =>
            possibleRotations[Math.floor(Math.random() * possibleRotations.length)]
        );
        setRotations(newRotations);
    }, [line, lineConfigs]);

    return (
        <div className="flex items-center justify-center" style={{ fontSize: `${size}px`, gap: `${size * 0.5}px` }}>
            {rotations.map((rot, index) => (
                <div key={index} className="font-bold text-black" style={{ transform: `rotate(${rot}deg)` }}>
                    E
                </div>
            ))}
        </div>
    );
};


// UPDATE: The Landolt C test has been refactored to function like the Tumbling E test.
// It now displays a line of Landolt C's with random orientations, controlled by the "Next"/"Previous" buttons.
const LandoltCTest: React.FC<{ line: number, size: number }> = ({ line, size }) => {
    const [rotations, setRotations] = useState<number[]>([]);

    const lineConfigs = useMemo(() => [
        { count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }, { count: 5 }, { count: 6 }, { count: 7 }, { count: 8 }
    ], []);

    // The 8 standard positions for the Landolt C gap
    const possibleRotations = useMemo(() => [0, 45, 90, 135, 180, 225, 270, 315], []);

    useEffect(() => {
        const currentConfig = lineConfigs[Math.min(line, lineConfigs.length - 1)];
        const newRotations = Array.from({ length: currentConfig.count }, () =>
            possibleRotations[Math.floor(Math.random() * possibleRotations.length)]
        );
        setRotations(newRotations);
    }, [line, lineConfigs, possibleRotations]);

    return (
        <div className="flex items-center justify-center" style={{ gap: `${size * 0.5}px` }}>
            {rotations.map((rot, index) => (
                 <div key={index} className={`rounded-full border-black`} style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderWidth: `${Math.max(1, size / 5)}px`,
                    clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 60%, 50% 60%, 50% 40%, 0% 40%)`,
                    transform: `rotate(${rot}deg)`
                }}></div>
            ))}
        </div>
    );
};

const IshiharaTest: React.FC = () => {
    const { t } = useI18n();
    const plates = useMemo(() => [
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ishihara_1.svg/200px-Ishihara_1.svg.png', answer: '12' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ishihara_2.svg/200px-Ishihara_2.svg.png', answer: '8' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Ishihara_3.svg/200px-Ishihara_3.svg.png', answer: '29' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ishihara_4.svg/200px-Ishihara_4.svg.png', answer: '5' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Ishihara_5.svg/200px-Ishihara_5.svg.png', answer: '3' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Ishihara_6.svg/200px-Ishihara_6.svg.png', answer: '15' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ishihara_7.svg/200px-Ishihara_7.svg.png', answer: '74' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Ishihara_8.svg/200px-Ishihara_8.svg.png', answer: '6' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Ishihara_9.svg/200px-Ishihara_9.svg.png', answer: '45' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ishihara_10.svg/200px-Ishihara_10.svg.png', answer: '7' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Ishihara_11.svg/200px-Ishihara_11.svg.png', answer: '16' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ishihara_12.svg/200px-Ishihara_12.svg.png', answer: '73' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ishihara_13.svg/200px-Ishihara_13.svg.png', answer: 'nothing' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ishihara_14.svg/200px-Ishihara_14.svg.png', answer: 'nothing' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Ishihara_16.svg/200px-Ishihara_16.svg.png', answer: '26' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Ishihara_17.svg/200px-Ishihara_17.svg.png', answer: '42' },
    ], []);

    const [current, setCurrent] = useState(0);
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<(boolean | null)[]>(Array(plates.length).fill(null));

    const handleSubmit = () => {
        const isCorrect = answer.toLowerCase() === plates[current].answer;
        setResults(prev => {
            const newResults = [...prev];
            newResults[current] = isCorrect;
            return newResults;
        });
        setAnswer('');
        if (current < plates.length - 1) {
            setCurrent(c => c + 1);
        } else {
            const correctCount = results.filter((r, i) => r === null ? isCorrect : r).length;
            alert(`${t('testRunner.ishihara.result')}: ${correctCount} / ${plates.length}`);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <p>{t('testRunner.ishihara.prompt')}</p>
            {/* UPDATE: Enlarged the test area and changed it to a square to ensure images are fully visible and large. */}
            <div className="w-[70vmin] h-[70vmin] border-4 border-gray-300 bg-white p-2 rounded-lg flex items-center justify-center">
                <img src={plates[current].url} alt="Ishihara Plate" className="w-full h-full object-contain"/>
            </div>
            <div className="flex gap-2">
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder={t('testRunner.ishihara.placeholder')} className="p-2 border rounded-md text-center"/>
                <button onClick={handleSubmit} className="px-6 py-2 bg-secondary text-white rounded-md">{t('testRunner.submit')}</button>
            </div>
            <p className="text-sm text-gray-500">{t('testRunner.plate')} {current + 1} / {plates.length}</p>
        </div>
    );
};

const ContrastTest: React.FC<{ line: number, size: number }> = ({ line, size }) => {
    const lines = ["N C K Z O", "D H V R C", "S K D N O", "C Z S H V", "O V H S R"];
    const currentLine = lines[Math.min(line, lines.length - 1)];
    const contrasts = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];

    return (
        <div className="flex flex-col items-center gap-4">
            {contrasts.map(c => (
                 <div key={c} className="font-bold tracking-widest" style={{ fontSize: `${size}px`, color: `rgba(0, 0, 0, ${c})` }}>
                    {currentLine}
                </div>
            ))}
        </div>
    );
};

const VisualFieldTest: React.FC<{ trigger: number }> = ({ trigger }) => {
    const [dot, setDot] = useState<{ top: string; left: string } | null>(null);

    useEffect(() => {
        if (trigger === 0) return; // Don't show dot on initial load

        // Generate random position, avoiding the very edges
        const top = `${Math.floor(Math.random() * 90) + 5}%`;
        const left = `${Math.floor(Math.random() * 90) + 5}%`;

        setDot({ top, left });

        const timer = setTimeout(() => {
            setDot(null);
        }, 200); // Dot is visible for 200ms

        return () => clearTimeout(timer);
    }, [trigger]);

    return (
        <div className="w-full h-full bg-black relative flex items-center justify-center">
            {/* Fixation Cross */}
            <div className="absolute w-6 h-0.5 bg-gray-600"></div>
            <div className="absolute w-0.5 h-6 bg-gray-600"></div>

            {/* Stimulus Dot */}
            {dot && (
                <div
                    className="absolute w-4 h-4 bg-white rounded-full"
                    style={{ top: dot.top, left: dot.left, transform: 'translate(-50%, -50%)' }}
                ></div>
            )}
        </div>
    );
};

const TestRunnerPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { t } = useI18n();
    const [line, setLine] = useState(0);
    const { settings } = useSettings();
    const [size, setSize] = useState(10);
    // NEW: Trigger state for the visual field test.
    const [visualFieldTrigger, setVisualFieldTrigger] = useState(0);

    const handleShowDot = () => {
        setVisualFieldTrigger(t => t + 1);
    };

    useEffect(() => {
        const calculateSize = () => {
            const baseSizeAt6m = 88; // mm for 20/200 line at 6m
            const lineSizes = [200, 100, 80, 60, 50, 40, 30, 20];
            const currentLineSize = lineSizes[Math.min(line, lineSizes.length - 1)];
            const sizeInMm = (baseSizeAt6m * (currentLineSize / 200)) * (settings.userDistance / 6);
            
            const screen = document.getElementById('root');
            if(!screen) return 10;
            const screenWidthPx = screen.clientWidth;

            const ppi = Math.hypot(window.screen.width, window.screen.height) / settings.screenSize;
            const sizeInPx = (sizeInMm / 25.4) * ppi;
            return Math.max(10, sizeInPx);
        };
        setSize(calculateSize());
        
        window.addEventListener('resize', () => setSize(calculateSize()));
        return () => window.removeEventListener('resize', () => setSize(calculateSize()));
    }, [line, settings]);


    const renderTest = () => {
        switch (testId) {
            case 'snellen': return <SnellenTest line={line} size={size} />;
            case 'lvrc': return <LVRCTest />;
            case 'echart': return <EChartTest line={line} size={size} />;
            case 'landolt': return <LandoltCTest line={line} size={size} />;
            case 'pediatric': return <PediatricChartTest />;
            case 'amsler': return <AmslerGridTest />;
            // FIX: Replaced the static, broken image with the new dynamic Bichromatic Test component.
            case 'bichromatic': return <BichromaticTestDynamic line={line} />;
            case 'bichromaticNumbers': return <BichromaticNumbersTestDynamic line={line} />;
            case 'ishihara': return <IshiharaTest />;
            case 'contrast': return <ContrastTest line={line} size={size * 0.5} />;
            case 'okn': return <OKNDrumTest />;
            case 'visualField': return <VisualFieldTest trigger={visualFieldTrigger} />;
            default: return <div>{t('testRunner.notFound')}</div>;
        }
    };
    
    const testTitle = t(`tests.${testId}.title`);

    // UPDATE: Added 'landolt' to enable the "Next"/"Previous" line controls, aligning its functionality with other acuity tests.
    const hasLineControls = ['snellen', 'contrast', 'bichromatic', 'echart', 'bichromaticNumbers', 'landolt'].includes(testId || '');
    const hasVisualFieldControls = testId === 'visualField';
    const isSpecialBackgroundTest = ['okn', 'amsler', 'visualField'].includes(testId || '');
    // UPDATED: Logic to conditionally remove padding for full-screen tests.
    const mainContentClasses = `flex-1 flex items-center justify-center overflow-hidden ${testId === 'bichromatic' || testId === 'bichromaticNumbers' || testId === 'okn' ? '' : 'p-4'}`;


    return (
        <div className={`fixed inset-0 z-50 flex flex-col ${!isSpecialBackgroundTest ? 'bg-white' : ''}`}>
            <header className="bg-surface shadow-md p-3 flex flex-col sm:flex-row justify-between items-center gap-2 z-10">
                <h2 className="font-semibold text-primary capitalize">{testTitle}</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {hasLineControls && <>
                        <span className="text-sm text-text-secondary mr-4">{t('testRunner.line')}: {line + 1}</span>
                        <button onClick={() => setLine(l => Math.max(0, l - 1))} className="px-4 py-2 text-sm rounded-full bg-gray-200 hover:bg-gray-300">{t('testRunner.previous')}</button>
                        <button onClick={() => setLine(l => Math.min(7, l + 1))} className="px-4 py-2 text-sm rounded-full bg-gray-200 hover:bg-gray-300">{t('testRunner.next')}</button>
                    </>}
                     {hasVisualFieldControls && (
                        <button onClick={handleShowDot} className="px-4 py-2 text-sm rounded-full bg-gray-200 hover:bg-gray-300">{t('testRunner.showDot')}</button>
                    )}
                    <button onClick={() => navigate('/tests')} className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700">{t('common.close')}</button>
                </div>
            </header>
            {/* UPDATED: Using dynamic classes to control padding for a full-screen effect on specific tests. */}
            <main className={mainContentClasses}>
                {renderTest()}
            </main>
        </div>
    );
};

export default TestRunnerPage;