// 从全局扩展对象中引入模块
const {
    app,
    components,
    utils,
    nodeModules,
} = global.Xext;

const {Store} = utils;

const STORE_KEY = 'Extension::fix-ranzhi-url.ranzhiUrl';
const {React} = nodeModules;
const {InputControl} = components;

const RanzhiSetting = React.createClass({
    getInitialState() {
        const {user} = app;
        if (!user) {
            return {value: ''};
        }
        const storeKey = `${STORE_KEY}.${user.identify}`;
        const ranzhiUrl = Store.get(storeKey);
        return {
            value: ranzhiUrl
        };
    },

    render() {
        const {user} = app;
        if (!user) {
            return React.createElement('div', {className: 'box red-pale'}, '你还没有登录。');
        }
        const storeKey = `${STORE_KEY}.${user.identify}`;
        return React.createElement(InputControl, {
            type: 'url',
            className: 'box gray',
            label: '设置然之地址',
            placeholder: '例如：http://127.0.0.1:81',
            value: this.state.value,
            onChange: value => {
                Store.set(storeKey, value);
                user._ranzhiUrl = value;
                this.setState({value});
            }
        });
    }
});

module.exports = {
    onUserLogin: (user, error) => {
        if (user && !error) { // 表示登录成功
            const storeKey = `${STORE_KEY}.${user.identify}`;
            const ranzhiUrl = Store.get(storeKey);
            if (ranzhiUrl) {
                user._ranzhiUrl = ranzhiUrl;
            }
        }
    },
    MainView: RanzhiSetting,
};
