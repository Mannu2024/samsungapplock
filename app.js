// Store is loaded globally


class App {
    constructor() {
        this.currentInput = '';
        this.dom = {
            views: {
                lock: document.getElementById('view-lock'),
                dashboard: document.getElementById('view-dashboard'),
                settings: document.getElementById('view-settings'),
            },
            pinDots: document.querySelectorAll('.pin-dot'),
            keypad: document.querySelector('.keypad'),
            appList: document.getElementById('app-list'),
            searchInput: document.getElementById('app-search'),
            subtitle: document.querySelector('.subtitle'),
            biometricBtn: document.getElementById('btn-biometric'),
            settingsBtn: document.getElementById('btn-settings'),
            backSettingsBtn: document.getElementById('btn-back-settings'),

            // Settings Toggles
            toggleIntruder: document.getElementById('toggle-intruder'),
            toggleFakeCrash: document.getElementById('toggle-fakecrash'),
        };

        this.init();
    }

    init() {
        this.renderKeypad();
        this.renderAppList();
        this.updateStats();
        this.setupEventListeners();
        this.loadSettingsUI();

        // Initial state
        this.resetPin();
    }

    setupEventListeners() {
        // App Search
        this.dom.searchInput.addEventListener('input', (e) => {
            this.renderAppList(e.target.value);
        });

        // Navigation
        this.dom.settingsBtn.addEventListener('click', () => this.switchView('settings'));
        this.dom.backSettingsBtn.addEventListener('click', () => this.switchView('dashboard'));

        // Biometric Simulation
        this.dom.biometricBtn.addEventListener('click', () => {
            this.dom.biometricBtn.innerHTML = '<span>Scanning...</span>';
            setTimeout(() => {
                this.unlockApp();
                this.dom.biometricBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12Z"></path><path d="M12 8.5C12.8 8.5 13.5 9.2 13.5 10C13.5 10.8 12.8 11.5 12 11.5C11.2 11.5 10.5 10.8 10.5 10C10.5 9.2 11.2 8.5 12 8.5Z"></path><path d="M12 15.5C13.5 15.5 14.8 15 15.5 14.1C16.2 13.2 17 12 17 10.5C17 7.5 14.8 5 12 5C9.2 5 7 7.5 7 10.5C7 12 7.8 13.2 8.5 14.1C9.2 15 10.5 15.5 12 15.5Z"></path></svg>
                    <span>Use Fingerprint</span>
                `;
            }, 1000);
        });

        // Settings Toggles
        this.dom.toggleIntruder.addEventListener('change', (e) => Store.updateSetting('intruderSelfie', e.target.checked));
        this.dom.toggleFakeCrash.addEventListener('change', (e) => Store.updateSetting('fakeCrash', e.target.checked));
    }

    /* --- LOCK SCREEN LOGIC --- */
    renderKeypad() {
        const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'];
        this.dom.keypad.innerHTML = '';

        keys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key-btn';

            if (key === 'del') {
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>';
                btn.onclick = () => this.handlePinInput('del');
            } else if (key === '') {
                btn.style.visibility = 'hidden';
                btn.disabled = true;
            } else {
                btn.textContent = key;
                btn.onclick = () => this.handlePinInput(key);
            }

            this.dom.keypad.appendChild(btn);
        });
    }

    handlePinInput(key) {
        if (key === 'del') {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            if (this.currentInput.length < 4) {
                this.currentInput += key;
            }
        }

        this.updatePinDisplay();

        if (this.currentInput.length === 4) {
            setTimeout(() => this.checkPin(), 100);
        }
    }

    updatePinDisplay() {
        this.dom.pinDots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < this.currentInput.length);
            dot.classList.remove('error');
        });
    }

    checkPin() {
        if (Store.verifyPin(this.currentInput)) {
            this.unlockApp();
        } else {
            this.showError();
        }
    }

    showError() {
        this.dom.pinDots.forEach(dot => dot.classList.add('error'));
        // navigator.vibrate(200); // Mobile only
        setTimeout(() => {
            this.resetPin();
        }, 500);
    }

    resetPin() {
        this.currentInput = '';
        this.updatePinDisplay();
    }

    unlockApp() {
        Store.state.isAuthenticated = true;
        this.switchView('dashboard');
        this.resetPin();
    }

    /* --- DASHBOARD LOGIC --- */
    renderAppList(filterText = '') {
        this.dom.appList.innerHTML = '';

        Store.apps.filter(app => {
            return app.name.toLowerCase().includes(filterText.toLowerCase());
        }).forEach(app => {
            const el = document.createElement('div');
            el.className = 'app-item';
            el.innerHTML = `
                <div class="app-info">
                    ${this.generateAppIcon(app)}
                    <span class="app-name">${app.name}</span>
                </div>
                <label class="switch">
                    <input type="checkbox" ${app.locked ? 'checked' : ''} data-id="${app.id}">
                    <span class="slider round"></span>
                </label>
            `;

            // Add event listener to checkbox
            const checkbox = el.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                const isLocked = Store.toggleAppLock(app.id);
                this.updateStats();
            });

            this.dom.appList.appendChild(el);
        });
    }

    generateAppIcon(app) {
        // Generate a colored SVG data URI
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 40">
            <rect width="40" height="40" fill="${app.color}"/>
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="white">${app.name[0]}</text>
        </svg>`;
        const encoded = 'data:image/svg+xml;base64,' + btoa(svg);
        return `<img src="${encoded}" class="app-icon" alt="${app.name}" />`;
    }

    updateStats() {
        const count = Store.getLockedCount();
        this.dom.subtitle.textContent = `${count} app${count === 1 ? '' : 's'} locked`;
    }

    /* --- VIEW MANAGEMENT --- */
    switchView(viewName) {
        // Hide all
        Object.values(this.dom.views).forEach(el => el.classList.remove('active'));

        // Show target
        if (this.dom.views[viewName]) {
            this.dom.views[viewName].classList.add('active');
        }
    }

    loadSettingsUI() {
        this.dom.toggleIntruder.checked = Store.state.intruderSelfie;
        this.dom.toggleFakeCrash.checked = Store.state.fakeCrash;
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
