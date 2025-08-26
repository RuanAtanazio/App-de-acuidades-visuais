import React, { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import type { User, AppSettings, AnamnesisFormData, Video } from './types';
import AuthPage from './pages/AuthPage';
import AnamnesePage from './pages/AnamnesePage';
import HistoryPage from './pages/HistoryPage';
import TestRunnerPage from './pages/TestRunnerPage';
import { TestsPage, CalculatorsPage, SettingsPage, VideosPage } from './pages/MainPages';
import { AnamnesisIcon, TestsIcon, CalculatorIcon, HistoryIcon, SettingsIcon, VideoIcon } from './components/Icons';
// FIX: Updated to import 'locales' instead of 'translations' for consistency.
import { locales } from './locales';

// --- I18N CONTEXT ---
type Language = 'pt' | 'en' | 'es';
interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    // FIX: Updated `t` function signature to support an optional `options` object for string interpolation.
    t: (key: string, options?: Record<string, string | number>) => string;
}
const I18nContext = createContext<I18nContextType | null>(null);
export const useI18n = () => useContext(I18nContext)!;

const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('optimetrics_lang');
        return (savedLang && ['pt', 'en', 'es'].includes(savedLang) ? savedLang : 'pt') as Language;
    });

    const setLanguageCallback = useCallback((lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('optimetrics_lang', lang);
    }, []);

    // FIX: Updated the `t` function to handle an optional `options` parameter for string interpolation.
    // This allows replacing placeholders like {email} in translation strings.
    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        const keys = key.split('.');
        // FIX: Using 'locales' instead of 'translations' for consistency.
        let template: any = locales[language];
        for (const k of keys) {
            template = template?.[k];
            if (template === undefined) {
                // Fallback to English if translation is missing
                // FIX: Using 'locales' instead of 'translations' for consistency.
                let fallbackTemplate: any = locales['en'];
                for (const fk of keys) {
                    fallbackTemplate = fallbackTemplate?.[fk];
                    if (fallbackTemplate === undefined) break;
                }
                template = fallbackTemplate;
                break;
            }
        }

        if (typeof template !== 'string') {
            return template || key;
        }

        let result = template;
        if (options) {
            for (const [placeholder, value] of Object.entries(options)) {
                result = result.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
            }
        }
        return result;
    }, [language]);

    const value = useMemo(() => ({ language, setLanguage: setLanguageCallback, t }), [language, setLanguageCallback, t]);
    
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};


// --- AUTH CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

// --- SETTINGS CONTEXT ---
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}
const defaultSettings: AppSettings = { language: 'pt', screenSize: 15.6, userDistance: 3 };
const SettingsContext = createContext<SettingsContextType>({ settings: defaultSettings, updateSettings: () => {} });
export const useSettings = () => useContext(SettingsContext)!;

// --- HISTORY CONTEXT ---
interface HistoryContextType {
    history: AnamnesisFormData[];
    addOrUpdateHistory: (entry: AnamnesisFormData) => void;
}
const HistoryContext = createContext<HistoryContextType>({ history: [], addOrUpdateHistory: () => {} });
export const useHistory = () => useContext(HistoryContext)!;

// --- VIDEOS CONTEXT ---
interface VideosContextType {
    videos: Video[];
    addVideo: (video: Video) => void;
}
const VideosContext = createContext<VideosContextType>({ videos: [], addVideo: () => {} });
export const useVideos = () => useContext(VideosContext)!;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('optimetrics_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('optimetrics_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('optimetrics_user');
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setLanguage } = useI18n();
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('optimetrics_settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
        const updated = {...prev, ...newSettings};
        localStorage.setItem('optimetrics_settings', JSON.stringify(updated));
        if (newSettings.language) {
            setLanguage(newSettings.language);
        }
        return updated;
    });
  }, [setLanguage]);

  useEffect(() => {
      setLanguage(settings.language)
  }, [settings.language, setLanguage]);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<AnamnesisFormData[]>(() => {
        const savedHistory = localStorage.getItem('optimetrics_history');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    const addOrUpdateHistory = useCallback((entry: AnamnesisFormData) => {
        setHistory(prev => {
            const existingIndex = prev.findIndex(item => item.id === entry.id);
            let newHistory;
            if (existingIndex > -1) {
                newHistory = [...prev];
                newHistory[existingIndex] = entry;
            } else {
                newHistory = [entry, ...prev];
            }
            localStorage.setItem('optimetrics_history', JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);
    
    const value = useMemo(() => ({ history, addOrUpdateHistory }), [history, addOrUpdateHistory]);
    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

const VideosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [videos, setVideos] = useState<Video[]>(() => {
        const savedVideos = localStorage.getItem('optimetrics_videos');
        return savedVideos ? JSON.parse(savedVideos) : [];
    });

    const addVideo = useCallback((video: Video) => {
        setVideos(prev => {
            const newVideos = [...prev, video];
            // Note: Storing video data URLs in localStorage is inefficient and has size limits.
            // This is for demonstration in a client-only application.
            try {
                localStorage.setItem('optimetrics_videos', JSON.stringify(newVideos));
            } catch (e) {
                console.error("Failed to save videos to localStorage. Storage may be full.", e);
                alert("Could not save video. Local storage is likely full.");
                return prev; // Return previous state if saving fails
            }
            return newVideos;
        });
    }, []);
    
    const value = useMemo(() => ({ videos, addVideo }), [videos, addVideo]);
    return <VideosContext.Provider value={value}>{children}</VideosContext.Provider>;
};


const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { t } = useI18n();
    return (
        <header className="bg-surface shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-xl font-bold text-primary">Optimetrics</h1>
            <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary hidden sm:inline">{user?.email}</span>
                <button onClick={logout} className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors">{t('header.logout')}</button>
            </div>
        </header>
    );
};

const BottomNavBar: React.FC = () => {
    const { t } = useI18n();
    const navItems = [
        { path: "/anamnese", label: t('nav.anamnese'), icon: AnamnesisIcon },
        { path: "/tests", label: t('nav.tests'), icon: TestsIcon },
        { path: "/calculators", label: t('nav.calculators'), icon: CalculatorIcon },
        { path: "/videos", label: t('nav.videos'), icon: VideoIcon },
        { path: "/history", label: t('nav.history'), icon: HistoryIcon },
        { path: "/settings", label: t('nav.settings'), icon: SettingsIcon },
    ];

    const navLinkClasses = "flex flex-col items-center justify-center gap-1 text-text-secondary transition-colors duration-200 w-1/6";
    const activeNavLinkClasses = "text-secondary";
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.08)] h-16 flex justify-around items-center z-10 md:hidden">
            {navItems.map(item => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs font-medium text-center">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

const SideNavBar: React.FC = () => {
    const { t } = useI18n();
    const navItems = [
        { path: "/anamnese", label: t('nav.anamnese'), icon: AnamnesisIcon },
        { path: "/tests", label: t('nav.tests'), icon: TestsIcon },
        { path: "/calculators", label: t('nav.calculators'), icon: CalculatorIcon },
        { path: "/videos", label: t('nav.videos'), icon: VideoIcon },
        { path: "/history", label: t('nav.history'), icon: HistoryIcon },
        { path: "/settings", label: t('nav.settings'), icon: SettingsIcon },
    ];

    const navLinkClasses = "flex items-center gap-4 px-4 py-3 text-text-secondary rounded-lg hover:bg-blue-50 transition-colors duration-200 group";
    const activeNavLinkClasses = "bg-blue-100 text-secondary font-semibold";

    return (
        <nav className="hidden md:flex flex-col w-64 bg-surface shadow-lg p-4">
            <div className="text-2xl font-bold text-primary p-4 mb-4">Optimetrics</div>
            <div className="flex flex-col gap-2">
                {navItems.map(item => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <item.icon className="w-6 h-6 text-text-secondary group-hover:text-secondary transition-colors" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

const AppLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-background">
            <SideNavBar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                    <Outlet />
                </main>
                <BottomNavBar />
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
};

const AppProviders: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <I18nProvider>
        <AuthProvider>
            <SettingsProvider>
                <HistoryProvider>
                    <VideosProvider>
                        {children}
                    </VideosProvider>
                </HistoryProvider>
            </SettingsProvider>
        </AuthProvider>
    </I18nProvider>
);

export default function App() {
    return (
        <AppProviders>
            <HashRouter>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/test/:testId" element={<ProtectedRoute><TestRunnerPage /></ProtectedRoute>} />
                    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/anamnese" replace />} />
                        <Route path="anamnese" element={<AnamnesePage />} />
                        <Route path="anamnese/:id" element={<AnamnesePage />} />
                        <Route path="tests" element={<TestsPage />} />
                        <Route path="calculators" element={<CalculatorsPage />} />
                        <Route path="videos" element={<VideosPage />} />
                        <Route path="history" element={<HistoryPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </HashRouter>
        </AppProviders>
    );
}

// FIX: Removed unused and conflicting 'locales' export.
// The localization data is now consistently imported from 'locales.ts'.
// export const locales = {
//   // locales will be added in a separate change
// };