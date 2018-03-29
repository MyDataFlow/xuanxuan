# 头像替换

马上将用户头像全部替换为可爱的 emojione 表情，并且每天每个人都会得到一个不同的表情。快试试吧。

此扩展用于演示喧喧扩展的界面替换机制。

关键代码：

```js
// 主入口文件 index.js

const UserAvatar = require('./user-avatar');

module.exports = {
    replaceViews: {
        'common/user-avatar': UserAvatar,
    }
};
```

```js
// user-avatar.js 文件

// 从全局扩展对象中引入模块
const {
    views,
    components,
    utils,
    nodeModules,
} = global.Xext;

const {React} = nodeModules;
const {PropTypes, Component} = React;
const {StatusDot} = views.common;
const {Avatar, Emojione} = components;
const {HtmlHelper} = utils;

let todayTime = new Date();
todayTime.setHours(0, 0, 0, 0);
todayTime = todayTime.getTime();

class UserAvatar extends Component {
    render() {
        const user = this.props.user;
        const className = this.props.className;
        const showStatusDot = this.props.showStatusDot;

        // 使用 react 形式返回新的用户头像
    }
}

UserAvatar.propTypes = {
    user: PropTypes.object,
    className: PropTypes.string,
    showStatusDot: PropTypes.bool,
};

UserAvatar.defaultProps = {
    className: null,
    showStatusDot: null,
    user: null,
};

module.exports = UserAvatar;
```

