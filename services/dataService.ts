import type { AnamnesisFormData, Video, SignInLog, User } from '../types';

// This service simulates a backend API by using localStorage.
// All functions are now async and have a simulated delay to mimic network latency.
// This prepares the app for a real backend implementation.

const SIMULATED_DELAY = 500; // ms

const simulateApiCall = <T>(callback: () => T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const result = callback();
            resolve(result);
        }, SIMULATED_DELAY);
    });
};


// --- User Management (Simulating a Users table) ---

const USERS_STORAGE_KEY = 'optimetrics_users';

const getUsers = (): User[] => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getUserByEmail = (email: string): Promise<User | null> => {
    return simulateApiCall(() => {
        const users = getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    });
};

export const registerUser = (userData: User): Promise<void> => {
    return simulateApiCall(() => {
        const users = getUsers();
        if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
            // In a real API, this check would be more robust.
            throw new Error("Email already registered.");
        }
        users.push(userData);
        saveUsers(users);
    });
};


// --- Login Activity Logging ---

const LOGIN_LOGS_STORAGE_KEY = 'optimetrics_login_logs';

export const getSignInLogs = (): Promise<SignInLog[]> => {
    return simulateApiCall(() => {
        const logs = localStorage.getItem(LOGIN_LOGS_STORAGE_KEY);
        return logs ? JSON.parse(logs) : [];
    });
};

export const logSignIn = (email: string, location: string): Promise<void> => {
    return simulateApiCall(() => {
        const logs = localStorage.getItem(LOGIN_LOGS_STORAGE_KEY);
        const currentLogs: SignInLog[] = logs ? JSON.parse(logs) : [];
        const newLog: SignInLog = {
            email,
            location,
            timestamp: new Date().toISOString(),
        };
        currentLogs.unshift(newLog);
        localStorage.setItem(LOGIN_LOGS_STORAGE_KEY, JSON.stringify(currentLogs));
    });
};


// --- History (User-Specific Data) ---

const getHistoryStorageKey = (email: string) => `optimetrics_history_${email}`;

export const getHistoryForUser = (email: string): Promise<AnamnesisFormData[]> => {
    return simulateApiCall(() => {
        if (!email) return [];
        const savedHistory = localStorage.getItem(getHistoryStorageKey(email));
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
};

export const saveHistoryForUser = (email: string, entry: AnamnesisFormData): Promise<AnamnesisFormData[]> => {
    return simulateApiCall(() => {
        if (!email) throw new Error("User email is required to save history.");
        const history = getHistoryForUser(email); // Note: this calls the sync version inside the promise
        const savedHistory = localStorage.getItem(getHistoryStorageKey(email));
        let currentHistory: AnamnesisFormData[] = savedHistory ? JSON.parse(savedHistory) : [];
        
        const existingIndex = currentHistory.findIndex(item => item.id === entry.id);
        if (existingIndex > -1) {
            currentHistory[existingIndex] = entry;
        } else {
            currentHistory.unshift(entry);
        }
        
        localStorage.setItem(getHistoryStorageKey(email), JSON.stringify(currentHistory));
        return currentHistory;
    });
};


// --- Videos (Shared/Public Data) ---

const VIDEOS_STORAGE_KEY = 'optimetrics_videos_shared';

export const getVideos = (): Promise<Video[]> => {
    return simulateApiCall(() => {
        const savedVideos = localStorage.getItem(VIDEOS_STORAGE_KEY);
        return savedVideos ? JSON.parse(savedVideos) : [];
    });
};

export const saveVideo = (video: Video): Promise<Video[]> => {
    return simulateApiCall(() => {
        try {
            const savedVideos = localStorage.getItem(VIDEOS_STORAGE_KEY);
            let currentVideos: Video[] = savedVideos ? JSON.parse(savedVideos) : [];
            currentVideos.push(video);
            localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(currentVideos));
            return currentVideos;
        } catch (e) {
            console.error("Failed to save videos to localStorage. Storage may be full.", e);
            alert("Could not save video. Local storage is likely full.");
            throw e;
        }
    });
};