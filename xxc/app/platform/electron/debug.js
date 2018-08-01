if(DEBUG && process.execPath.indexOf('electron') > -1) {
    // it handles shutting itself down automatically
    __non_webpack_require__('electron-local-crash-reporter').start();
    console.log('\n>> electron-local-crash-reporter started.');
}