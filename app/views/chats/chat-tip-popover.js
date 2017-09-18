import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Popover from '../../components/popover';
import Lang from '../../lang';
import App from '../../core';
import Config from 'Config';

const show = (position, chat, callback) => {
    const popoverId = 'app-chat-tip-popover';
    const onRequestClose = () => {
        Popover.hide(popoverId);
    };
    const content = <div>
        <div className="heading">
            <div className="title strong">消息框小技巧</div>
            <nav className="nav">
                <a onClick={e => {
                    App.profile.userConfig.showMessageTip = false;
                    onRequestClose();
                }}>关闭并不再提示</a>
            </nav>
        </div>
        <div className="box">
            <ul style={{paddingLeft: 20, marginBottom: 0}}>
                <li>拖拽图片和文件到消息框来发送；</li>
                <li>使用 Markdown 语法来发送富文本；</li>
                <li>你可以直接粘贴剪切板中的图片进行发送；</li>
                {Config.system.screenCaptureDisabled ? null : <li>从截图按钮右键菜单上使用截图高级功能；</li>}
                <li>发送 “<strong>$$version</strong>” 查询当前客户端版本。</li>
            </ul>
        </div>
    </div>;
    return Popover.show(position, content, {id: popoverId, width: 320, height: 160}, callback);
};

export default {
    show,
};
