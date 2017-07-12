import React               from 'react';
import Theme               from '../../theme';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang, Config} from 'App';
import FlatButton          from 'material-ui/FlatButton';
import CloseIcon           from 'material-ui/svg-icons/navigation/close';

// display app component
const MessageTip = React.createClass({
    mixins: [PureRenderMixin],

    _handleCloseButtonClick() {
        App.user.setConfig('ui.chat.showMessageTip', false);
        this.props.requestClose && this.props.requestClose();
    },

    render() {
        const STYLE = {
            main: {
                backgroundColor: Theme.color.canvas,
                padding: 10,
                position: 'relative'
            },
            closeButton: {
                position: 'absolute',
                right: 0,
                top: 0
            },
            closeButtonIcon: {
                width: 12,
                height: 12,
                color: Theme.color.icon,
                fill: Theme.color.icon
            },
            closeButtonLabel: {
                fontSize: '12px',
                color: Theme.color.icon,
                fontWeight: 'normal'
            }
        };

        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}>
          <FlatButton
              style={STYLE.closeButton}
              label="关闭并不再提示"
              labelPosition="after"
              primary={true}
              labelStyle={STYLE.closeButtonLabel}
              onClick={this._handleCloseButtonClick}
              icon={<CloseIcon style={STYLE.closeButtonIcon} />}
          />
          <h4 style={{margin: "5px 0 5px"}}>消息框小技巧</h4>
          <ul style={{paddingLeft: 20, marginBottom: 0}}>
            <li>拖拽图片和文件到消息框来发送；</li>
            <li>使用 Markdown 语法来发送富文本；</li>
            <li>你可以直接粘贴剪切板中的图片进行发送；</li>
            <li>从截图按钮右键菜单上使用截图高级功能；</li>
            <li>发送 “<strong>$$name=会话名称</strong>” 来为多人会话重命名；</li>
            <li>发送 “<strong>$$version</strong>” 查询当前客户端版本。</li>
          </ul>
        </div>
    }
});

export default MessageTip;
