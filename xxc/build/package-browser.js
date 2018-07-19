import cpx from 'cpx';
import ghpages from 'gh-pages';
import minimist from 'minimist';
import fse from 'fs-extra';
import pkg from '../app/package.json';

const argv = minimist(process.argv.slice(2));

const copy = (source, dest, options) => {
    return new Promise((resolve, reject) => {
        cpx.copy(source, dest, options, err => {
            if (err) {
                console.log('failed from ', source, 'to', dest, err);
                reject(err);
            } else {
                console.log('  ', source, '-->', dest);
                resolve(dest);
            }
        });
    });
};

const destRoot = `./release/browser/${pkg.version}`;

const copyDist = () => copy('./app/web-dist/**/*', `${destRoot}/dist`);
const copyMedia = () => copy('./app/media/**/*', `${destRoot}/media`);
const copyAssets = () => copy('./app/assets/**/*', `${destRoot}/assets`);
const copyIndexHTML = () => copy('./app/index.html', destRoot);
const copyPKG = () => copy('./app/package.json', destRoot);
const copyManifest = () => copy('./app/manifest.json', destRoot);
const copyIcons = () => copy('./resources/**/*', `${destRoot}/resources`);

const publish = () => {
    console.log('>> Publish to gh-pages:');
    return new Promise((resolve, reject) => {
        ghpages.publish(destRoot, {
            dest: pkg.version
        }, err => {
            if (err) {
                reject(err);
                console.log('failed with err ', err);
            } else {
                console.log('>> Publish finised.');
                resolve();
            }
        });
    });
};

const packageAll = () => {
    console.log('>> Packge for browser: ');
    return fse.emptyDir(destRoot).then(() => {
        return Promise.all([copyDist(), copyMedia(), copyAssets(), copyIndexHTML(), copyPKG(), copyManifest(), copyIcons()]).then(() => {
            console.log('>> Package for browser finished, dest path is', destRoot);
            if (argv.publish) {
                return publish();
            }
            return Promise.resolve(destRoot);
        }).catch(err => {
            console.log('ERROR', err);
        });
    });
};

packageAll();
