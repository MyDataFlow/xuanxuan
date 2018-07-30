if (DEBUG) {
    const {crashReporter} = __non_webpack_require__('electron');
    crashReporter.start({
        productName: 'xuanxuan',
        companyName: 'cnezsoft.com',
        submitURL: 'http://192.168.0.109:1127',
        uploadToServer: true
    })
}