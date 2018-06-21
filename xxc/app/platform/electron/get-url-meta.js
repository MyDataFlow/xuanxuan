import MetaInspector from 'metainspector';

const TIMEOUT = 5000;

export default url => {
    return new Promise((resolve, reject) => {
        const client = new MetaInspector(url, {timeout: TIMEOUT});
        client.on('fetch', resolve);
        client.on('error', reject);
        client.fetch();
    });
};
