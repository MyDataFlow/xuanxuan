/**
 * Create a limit time promise
 *
 * @param {Promise} promise
 * @param {number} timeout
 * @param {any} timeoutError
 */
const limitTimePromise = (promise, timeout = 15000, timeoutError = 'TIMEOUT') => {
    let timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(timeoutError)
        }, timeout);
    });

    return Promise.race([promise, timeoutPromise]);
};

export default limitTimePromise;
