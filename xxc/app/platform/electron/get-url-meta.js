import MetaInspector from 'metainspector';

const metainspectorOptions = {timeout: 5000, limit: 2 * 1024 * 1024};

export default url => {
    return new Promise((resolve, reject) => {
        const client = new MetaInspector(url, metainspectorOptions);
        client.on('fetch', () => (resolve(client)));
        client.on('error', reject);
        client.fetch();
    });
};
