const Store = {
    state: {
        isAuthenticated: false,
        pin: '1234', // Default PIN
        biometricEnabled: false,
        fakeCrash: false,
        intruderSelfie: false,
        lockDelay: 0, // 0 = immediate
    },

    apps: [
        { id: 'whatsapp', name: 'WhatsApp', color: '#25D366', locked: true },
        { id: 'instagram', name: 'Instagram', color: '#E1306C', locked: true },
        { id: 'gallery', name: 'Gallery', color: '#F4B400', locked: true },
        { id: 'facebook', name: 'Facebook', color: '#1877F2', locked: false },
        { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', locked: false },
        { id: 'gmail', name: 'Gmail', color: '#EA4335', locked: false },
        { id: 'settings', name: 'Settings', color: '#607D8B', locked: true },
        { id: 'youtube', name: 'YouTube', color: '#FF0000', locked: false },
        { id: 'chrome', name: 'Chrome', color: '#4285F4', locked: false },
        { id: 'files', name: 'Files', color: '#3367D6', locked: false },
    ],

    getLockedCount() {
        return this.apps.filter(app => app.locked).length;
    },

    toggleAppLock(id) {
        const app = this.apps.find(a => a.id === id);
        if (app) {
            app.locked = !app.locked;
            // In a real app, we would persist this to LocalStorage here
            this.saveToStorage();
        }
        return app.locked;
    },

    verifyPin(inputPin) {
        return inputPin === this.state.pin;
    },

    updateSetting(key, value) {
        if (key in this.state) {
            this.state[key] = value;
            this.saveToStorage();
        }
    },

    // Persistence
    loadFromStorage() {
        const savedState = localStorage.getItem('applock_state');
        const savedApps = localStorage.getItem('applock_apps');

        if (savedState) {
            this.state = { ...this.state, ...JSON.parse(savedState) };
        }
        if (savedApps) {
            const parsedApps = JSON.parse(savedApps);
            // Merge locked status
            this.apps.forEach(app => {
                const saved = parsedApps.find(a => a.id === app.id);
                if (saved) app.locked = saved.locked;
            });
        }
    },

    saveToStorage() {
        localStorage.setItem('applock_state', JSON.stringify(this.state));
        localStorage.setItem('applock_apps', JSON.stringify(this.apps));
    },

    reset() {
        localStorage.clear();
        window.location.reload();
    }
};

// Initialize
Store.loadFromStorage();
