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
        const other = Object.assign({}, this.props);
        delete other.user;
        delete other.className;
        delete other.showStatusDot;

        let statusDot = null;
        if (showStatusDot) {
            statusDot = React.createElement(StatusDot, {status: user.status});
        }

        if (!user) {
            return React.createElement(Avatar, Object.assign({
                className: HtmlHelper.classes('rounded', className),
                icon: 'account',
            }, other), statusDot);
        }

        const emojioneNames = Object.keys(Emojione.emojioneList);
        const emojioneListLength = emojioneNames.length;
        const emojioneSelect = Emojione.emojioneList[emojioneNames[Math.floor(((user.id + todayTime) * 137) % emojioneListLength)]];
        const imagePath = `${Emojione.imagePathPNG}${emojioneSelect.fname}.png`;
        return React.createElement(Avatar, Object.assign({
            className: HtmlHelper.classes('rounded', className),
            image: imagePath,
            imageClassName: 'rounded',
        }, other), statusDot);
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
