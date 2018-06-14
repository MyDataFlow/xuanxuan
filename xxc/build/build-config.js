import {spawn} from 'child_process';
import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import pkg from '../package.json';

const platformMap = {
    win32: 'win',
    win64: 'win',
    win: 'win',
    linux: 'linux',
    darwin: 'mac',
    osx: 'mac',
    mac: 'mac',
    all: 'all',
    '*': 'all'
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

const isDebug = process.argv[5] === '-debug';

console.log('\nBuildConfig > configName=', configName, 'platform=', platform, 'arch=', pkgArch, 'isDebug=', isDebug);

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
    copyOriginMedia: true
}, (configName && configName !== '-') ? require(configName.includes('/') ? configName : `./build-config.${configName}.json`) : null);

console.log('\nBuildConfig > config', config);

const appPkg = {
    name: config.name,
    productName: config.productName,
    version: config.version,
    description: config.description,
    main: './main.js',
    author: config.author,
    homepage: config.homepage,
    company: config.company,
    license: config.license,
    bugs: config.bugs,
    repository: config.repository,
    buildTime: new Date()
};

const electronBuilder = {
    productName: config.name,
    appId: config.appid || `com.cnezsoft.${config.name}`,
    compression: 'maximum',
    artifactName: '${productName}.${version}.${os}.${arch}.${ext}',
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
        'package.json'
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
        // icon: 'resources/icons/'
    },
    mac: {
        // icon: 'resources/icon.icns',
        icon: path.join(config.resourcePath, 'icon.icns'),
        artifactName: '${productName}.${version}.${os}${env.PKG_ARCH}.${ext}'
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        artifactName: "${productName}.${version}.${os}${env.PKG_ARCH}.setup.${ext}",
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
fse.outputJsonSync('./app/package.json', appPkg, {spaces: 4});
console.log('\n\nBuildConfig > app/package.json generated success.');

// type 可以为 '', 'debug' 或 'broser'
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
                PKG_ARCH: debug ? '.debug' : (osType === 'win' ? (arch.includes('32') ? '32' : '64') : '')
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

if (platform !== '-skipbuild') {
    build();
}

