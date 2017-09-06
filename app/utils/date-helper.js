const TIME_DAY = 24*60*60*1000;

const createDate = date => {
    if(!(date instanceof Date)) {
        date = new Date(date);
    }
    return date;
};

const isSameDay = (date1, date2) => {
    return createDate(date1).toDateString() === createDate(date2).toDateString();
};

const isToday = (date, now) => {
    return isSameDay(now || new Date(), date);
};

const isYestoday = (date, now) => {
    return isSameDay((now || new Date()).getTime() - TIME_DAY, date);
};

const formatDate = (date, format) => {
    date = createDate(date);

    let dateInfo = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        // 'H+': date.getHours() % 12,
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        // 'q+': Math.floor((date.getMonth() + 3) / 3),
        'S+': date.getMilliseconds()
    };
    if(/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    Object.keys(dateInfo).forEach(k => {
        if(new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? dateInfo[k] : ('00' + dateInfo[k]).substr(('' + dateInfo[k]).length));
        }
    })
    return format;
};

export default {
    createDate,
    formatDate,
    isSameDay,
    isToday,
    isYestoday
};
