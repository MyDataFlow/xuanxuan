/**
 * A extension for xuanxuan integrate with ranzhi server
 * @see https://github.com/easysoft/xuanxuan/tree/master/examples/extensions/ranzhi
 */

const isWindows7 = window.navigator.userAgent.includes('Windows NT 6.');

let extension = null;
let testUrlEntryID = null;

// Export extention module
module.exports = {
    onAttach: ext => {
        // Save extension object
        extension = ext;
    },
    urlInspectors: [{
        test: url => {
            testUrlEntryID = null;
            // Use extension server data to check url whether is a ranzhi entry
            if (extension.serverData) {
                return extension.serverData.find(item => {
                    if (url.startsWith(item.url)) {
                        testUrlEntryID = item.id;
                        return true;
                    }
                });
            }
        },
        getUrl: url => {
            // Get free-login-authentication entry url
            return extension.getEntryUrl(url, testUrlEntryID);
        },
        noMeta: true, // Skip xuanxuan meta origin request
        inspect: (url) => {
            const cardMeta = {};
            cardMeta.title = null;
            cardMeta.webviewContent = true;
            cardMeta.icon = false;
            cardMeta.content = {
                // Set webview url
                originSrc: url.includes('?') ? `${url}&display=app` : `${url}?display=app`,
                // Set webview card url
                src: url.includes('?') ? `${url}&display=card` : `${url}?display=card`,
                // Set webview card size
                style: {height: '400px', width: '550px'},
                // Set webview card type
                type: isWindows7 ? 'iframe' : 'webview'
            };
            // Return card meta setting
            return cardMeta;
        }
    }]
};
