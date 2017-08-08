const plain = obj => {
    if(obj === undefined) obj = this;
    if(Array.isArray(obj)) {
        return obj.map(plain);
    }
    var objType = typeof obj;
    if(obj !== null && objType === 'object') {
        var plainObj = {};
        Object.keys(obj).forEach(key => {
            let val = obj[key];
            var typeVal = typeof val;
            if(key && key[0] !== '$' && typeVal !== 'function') {
                plainObj[key] = typeVal === 'object' ? plain(val) : val;
            }
        });
        return plainObj;
    }
    if(objType === 'function') return;
    return obj;
};

export default plain;
