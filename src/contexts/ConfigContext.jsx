import { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext(null);

const DEFAULT_CONFIG = {
    companyName: 'Note.dz',
    logoUrl: null,
    address: '',
    rcNumber: '',
    nif: '',
    supportEmail: 'contact@note.dz',
    loginMessage: 'Bienvenue sur le premier portail d\'édition au Maghreb...',
    landingTitle: 'Donnez vie à vos mots.',
    landingSubTitle: 'Soumettez votre manuscrit en 5 minutes.',
    howItWorks: '',
    primaryColor: '#06b6d4',
    neonAccent: '#8b5cf6'
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedConfig = localStorage.getItem('site_config');
        if (storedConfig) {
            try {
                setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) });
            } catch (e) {
                console.error("Failed to parse config", e);
            }
        }
        setLoading(false);
    }, []);

    const updateConfig = (newConfig) => {
        const updated = { ...config, ...newConfig };
        setConfig(updated);
        localStorage.setItem('site_config', JSON.stringify(updated));
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig, loading }}>
            {!loading && children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
