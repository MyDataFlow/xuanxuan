// 从全局扩展对象中引入模块
const {
    nodeModules,
} = global.Xext;

const {React, ReactDom} = nodeModules;

module.exports = React.createClass({
    render() {
        return React.createElement('div', {className: 'box red'}, '示例应用内容: Hello world!');
    }
});
