import {spawn} from 'child_process';
import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import pkg from '../package.json';
import oldPkg from '../app/package.json';
import {formatDate} from '../app/utils/date-helper';

const platformMap = {
    win32: 'win',
    win64: 'win',
    win: 'win',
    linux: 'linux',
    darwin: 'mac',
    osx: 'mac',
    mac: 'mac',
    all: 'all',
    '*': 'all',
    skipbuild: 'skipbuild'
};
const osPlatform = os.platform();
let configName = process.argv[2];
if (!configName || configName === '-') {
    const defaultConfig = fse.readJsonSync('./build/build-config.default.json', {throws: false});
    if (defaultConfig) {
        configName = defaultConfig && defaultConfig.name;
    }
}

let platform = process.argv[3] || osPlatform;
if (!platform || platform === '-') {
    platform = os.platform();
}
platform = platformMap[platform];
let pkgArch = process.argv[4] || os.arch();
if (!pkgArch || pkgArch === '-') {
    pkgArch = os.arch();
} else if (pkgArch === '*') {
    pkgArch = 'all';
}

const isDebug = process.argv[5] === 'debug' || process.argv[6] === 'debug';
const isBeta = process.argv[6] === 'beta' || process.argv[5] === 'beta';
const buildVersion = isBeta ? formatDate(new Date(), 'beta.yyyyMMddhhmm') : null;

console.log('\nBuildConfig > configName=', configName, 'platform=', platform, 'arch=', pkgArch, 'isDebug=', isDebug, 'isBeta=', isBeta, 'argv', process.argv);

const config = Object.assign({
    name: pkg.name,
    productName: pkg.productName,
    description: pkg.description,
    homepage: pkg.homepage,
    version: pkg.version,
    license: pkg.license,
    company: pkg.company,
    author: pkg.author,
    bugs: pkg.bugs,
    repository: pkg.repository,
    resourcePath: 'resources',
    mediaPath: 'media/',
    copyOriginMedia: true,
    buildVersion
}, (configName && configName !== '-') ? require(configName.includes('/') ? configName : `./build-config.${configName}.json`) : null);

console.log('\nBuildConfig > config', config);

const appPkg = {
    name: config.name,
    productName: config.name,
    displayName: config.productName,
    version: config.version,
    description: config.description,
    main: './main.js',
    author: config.author,
    homepage: config.homepage,
    company: config.company,
    license: config.license,
    bugs: config.bugs,
    repository: config.repository,
    buildTime: new Date(),
    buildVersion: config.buildVersion
};

const electronBuilder = {
    productName: config.name,
    appId: config.appid || `com.cnezsoft.${config.name}`,
    compression: 'maximum',
    artifactName: '${name}.${version}${env.PKG_BETA}.${os}.${arch}.${ext}',
    // electronVersion: '1.7.9',
    electronDownload: {mirror: 'https://npm.taobao.org/mirrors/electron/'},
    extraResources: [{
        from: 'app/build-in/',
        to: 'build-in'
    }],
    dmg: {
        contents: [{
            x: 130,
            y: 220
        }, {
            x: 410,
            y: 220,
            type: 'link',
            path: '/Applications'
        }],
        title: `${config.productName} ${config.version}`
    },
    files: [
        'dist/',
        'assets/',
        {
            from: (config.copyOriginMedia && config.mediaPath !== 'media/') ? 'media-build/' : config.mediaPath,
            to: 'media/'
        },
        'index.html',
        'main.js',
        'main.js.map',
        'package.json',
        'node_modules/',
        {
            from: '../resources/',
            to: 'resources'
        }
    ],
    win: {
        target: [
            'nsis'
        ]
    },
    linux: {
        target: [
            'deb',
            'rpm',
            'tar.gz'
        ],
        icon: path.join(config.resourcePath, 'icons/')
    },
    mac: {
        icon: path.join(config.resourcePath, 'icon.icns'),
        artifactName: '${name}.${version}${env.PKG_BETA}.${os}${env.PKG_ARCH}.${ext}'
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        artifactName: '${name}.${version}${env.PKG_BETA}.${os}${env.PKG_ARCH}.setup.${ext}',
        deleteAppDataOnUninstall: false
    },
    directories: {
        app: 'app',
        buildResources: config.resourcePath,
        output: config.name === 'xuanxuan' ? 'release' : `release/${config.name}`
    }
};

// 输出 electron builder 配置文件
fse.outputJsonSync('./build/electron-builder.json', electronBuilder, {spaces: 4});
console.log('\n\nBuildConfig > electron-builder.json generated success.');

// 输出应用 package.json 文件
fse.outputJsonSync('./app/package.json', Object.assign(oldPkg, appPkg), {spaces: 4});
console.log('\n\nBuildConfig > app/package.json generated success.');

fse.outputJsonSync('./app/manifest.json', {
    name: config.productName,
    start_url: 'index.html',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#3f51b5',
    description: config.description,
    icons: [{
        src: 'resources/icons/48x48.png',
        sizes: '48x48',
        type: 'image/png'
    }, {
        src: 'resources/icons/64x64.png',
        sizes: '64x64',
        type: 'image/png'
    }, {
        src: 'resources/icons/96x96.png',
        sizes: '96x96',
        type: 'image/png'
    }, {
        src: 'resources/icons/128x128.png',
        sizes: '128x128',
        type: 'image/png'
    }, {
        src: 'resources/icons/144x144.png',
        sizes: '144x144',
        type: 'image/png'
    }, {
        src: 'resources/icons/192x192.png',
        sizes: '192x192',
        type: 'image/png'
    }, {
        src: 'resources/icons/256x256.png',
        sizes: '256x256',
        type: 'image/png'
    }, {
        src: 'resources/icons/512x512.png',
        sizes: '512x512',
        type: 'image/png'
    }],
}, {spaces: 4});
console.log('\n\nBuildConfig > app/manifest.json generated success.');

// type 可以为 '', 'debug' 或 'browser'
const buildApp = (isDebugMode = isDebug) => {
    console.log('\n\nBuildConfig > build app ', isDebug ? '[debug]' : '');
    return new Promise((resolve, reject) => {
        spawn('npm', ['run', isDebugMode ? 'build-debug' : 'build'], {shell: true, env: process.env, stdio: 'inherit'})
            .on('close', code => resolve(code))
            .on('error', spawnError => reject(spawnError));
    });
};

const createPackage = (osType, arch, debug = isDebug) => {
    console.log('\n\nBuildConfig > create package: ', 'os=', osType, 'arch=', arch, 'debug=', debug);
    return new Promise((resolve, reject) => {
        const params = [`--${osType}`];
        if (arch) {
            params.push(`--${arch}`);
        }

        spawn('build', params, {
            shell: true,
            env: Object.assign({}, process.env, {
                SKIP_INSTALL_EXTENSIONS: debug ? 1 : 0,
                PKG_ARCH: debug ? '.debug' : (osType === 'win' ? (arch.includes('32') ? '32' : '64') : ''),
                PKG_BETA: isBeta ? '.beta' : ''
            }),
            stdio: 'inherit'
        })
            .on('close', code => resolve(code))
            .on('error', spawnError => reject(spawnError));
    });
};

const build = async () => {
    if (config.copyOriginMedia && config.mediaPath !== 'media/') {
        await fse.emptyDir('./app/media-build');
        await fse.copy('./app/media', './app/media-build', {overwrite: true});
        await fse.copy(config.mediaPath, './app/media-build', {overwrite: true});
    }
    await buildApp();
    const buildPlatforms = platform === 'all' ? ['win', 'mac', 'linux'] : [platform];
    const archTypes = pkgArch === 'all' ? ['x64', 'ia32'] : (pkgArch.includes('32') ? ['ia32'] : ['x64']);
    for (let i = 0; i < buildPlatforms.length; ++i) {
        for (let j = 0; j < archTypes.length; ++j) {
            if (buildPlatforms[i] === 'mac' && archTypes[j] === 'ia32') {
                continue;
            }
            await createPackage(buildPlatforms[i], archTypes[j]);
        }
    }
};

if (platform !== 'skipbuild') {
    build();
}

