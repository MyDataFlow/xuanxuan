import exts from './exts';
import Store from '../utils/store';

const STORE_KEY = 'EXTENSIONS::theme.current';

let currentTheme;
const getCurrentTheme = () => {
    if (currentTheme === undefined) {
        const currentThemeSetting = Store.get(STORE_KEY);
        if (currentThemeSetting) {
            const themeExt = exts.getTheme(currentThemeSetting.extension);
            if (themeExt) {
                currentTheme = themeExt.getTheme(currentThemeSetting.name);
            }
        }
        if (!currentTheme) {
            currentTheme = null;
        }
    }
    return currentTheme;
};

// Backup the default theme
let theDefaultThemeStyle;
let themeLinkElement = null;
if (process.env.HOT) {
    themeLinkElement = document.querySelector('link[href^="blob:"]');
    theDefaultThemeStyle = themeLinkElement.href;
} else {
    themeLinkElement = document.getElementById('theme');
    theDefaultThemeStyle = themeLinkElement.href;
}
let changingThemeTimer = null;
const applyTheme = theme => {
    theme = theme || currentTheme;
    clearTimeout(changingThemeTimer);
    document.body.classList.add('theme-changing');
    if (!theme || theme === 'default') {
        if (themeLinkElement.href !== theDefaultThemeStyle) {
            themeLinkElement.href = theDefaultThemeStyle;
        }
        const appendLinkElement = document.getElementById('appendTheme');
        if (appendLinkElement) {
            appendLinkElement.remove();
        }
    } else {
        const styleFile = theme.styleFile;
        if (!styleFile) {
            applyTheme('');
            return 'THEME_HAS_NO_CSS_FILE';
        }
        if (theme.isAppend) {
            if (themeLinkElement.href !== theDefaultThemeStyle) {
                themeLinkElement.href = theDefaultThemeStyle;
            }
            let appendLinkElement = document.getElementById('appendTheme');
            if (!appendLinkElement) {
                appendLinkElement = document.createElement('link');
                appendLinkElement.rel = 'stylesheet';
                appendLinkElement.href = styleFile;
                appendLinkElement.id = 'appendTheme';
                document.getElementsByTagName('head')[0].appendChild(appendLinkElement);
            } else {
                appendLinkElement.href = styleFile;
            }
        } else {
            themeLinkElement.href = styleFile;
            const appendLinkElement = document.getElementById('appendTheme');
            if (appendLinkElement) {
                appendLinkElement.remove();
            }
        }
    }
    document.body.setAttribute('data-theme', theme ? theme.id : null);

    changingThemeTimer = setTimeout(() => {
        document.body.classList.remove('theme-changing');
    }, 800);

    if (DEBUG) {
        console.collapse('Extension Apply Theme', 'greenBg', theme ? theme.displayName : (theme || 'default'), 'greenPale');
        console.log('theme', theme);
        console.groupEnd();
    }
};

if (getCurrentTheme()) {
    applyTheme();
}

const setCurrentTheme = theme => {
    if (theme === 'default') {
        theme = null;
    }
    currentTheme = theme;
    if (theme) {
        const currentThemeSetting = {
            extension: theme.extension.name,
            name: theme.name
        };
        Store.set(STORE_KEY, currentThemeSetting);
    } else {
        Store.remove(STORE_KEY);
    }
    return applyTheme(theme);
};

const isCurrentTheme = themeId => {
    return (themeId === 'default' && !currentTheme) || (currentTheme && currentTheme.id === themeId);
};

const search = (keys) => {
    keys = keys.trim().toLowerCase().split(' ');
    const result = [];
    exts.themes.forEach(theExt => {
        const extThemes = theExt.themes;
        if (extThemes.length) {
            const searchGroup = {
                name: theExt.name,
                displayName: theExt.displayName,
                icon: theExt.icon,
                accentColor: theExt.accentColor,
                score: 0,
            };
            const themes = [];
            extThemes.forEach(extTheme => {
                const themeScore = extTheme.getMatchScore(keys);
                if (themeScore) {
                    searchGroup.score += themeScore;
                    extTheme.matchScore = themeScore;
                    themes.push(extTheme);
                }
            });
            if (themes.length) {
                themes.sort((x, y) => y.matchScore - x.matchScore);
                searchGroup.themes = themes;
                if (searchGroup.score) {
                    result.push(searchGroup);
                }
            }
        }
    });
    result.sort((x, y) => y.score - x.score);
    return result;
};

export default {
    get all() {
        return exts.themes;
    },

    search,
    isCurrentTheme,
    getCurrentTheme,
    setCurrentTheme,
    applyTheme,
};
