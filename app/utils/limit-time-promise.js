/**
 * Create a limit time promise
 *
 * @param {Promise} promise
 * @param {number} timeout
 * @param {any} timeoutError
 */
const limitTimePromise = (promise, timeout = 15000, timeoutError = 'timeout') => {
    let timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('timeout')
        }, timeoutError);
    });

    return Promise.race([promise, timeoutPromise]);
};

export default limitTimePromise;
