import React, {Component} from 'react';
import Modal              from 'Components/modal';
import Slider             from 'material-ui/Slider';
import {App, Lang}        from 'App';
import MessageListItem    from './message-list-item';
import Message            from 'Models/chat/chat-message';
import R                  from 'Resource';
import FlatButton         from 'material-ui/FlatButton';

const DEFAULT_CONFIG = {
    size: 13,
    lineHeight: 1.5384615385,
    title: '1em',
    titleLineHeight: 1.53846153846
};

const CONFIGS = [
    {
        size: 12,
        lineHeight: 1.5,
        title: '1em',
        titleLineHeight: 1.5
    }, DEFAULT_CONFIG, {
        size: 14,
        lineHeight: 1.5,
        title: '1em',
        titleLineHeight: 1.4285714286
    }, {
        size: 15,
        lineHeight: 1.5,
        title: '0.8666667em',
        titleLineHeight: 1.5
    }, {
        size: 18,
        lineHeight: 1.5,
        title: '0.8666667em',
        titleLineHeight: 1.5
    }, {
        size: 20,
        lineHeight: 1.5,
        title: '0.75em',
        titleLineHeight: 1.5
    }, {
        size: 24,
        lineHeight: 1.5,
        title: '0.666667em',
        titleLineHeight: 1.5
    }, {
        size: 30,
        lineHeight: 1.5,
        title: '0.6em',
        titleLineHeight: 1.5
    }, {
        size: 36,
        lineHeight: 1.5,
        title: '0.5em',
        titleLineHeight: 1.5
    }
];

class ChangeFontSizeView extends Component {

    state = {
        select: 1
    };

    static defaultProps = {
        hidePreviewBox: false,
        hideActions: false,
        showHeader: false
    };

    componentWillMount() {
        let selectConfig = App.user.getConfig('ui.chat.fontSize', CONFIGS[1]);
        let configs = CONFIGS.slice();
        let selectIndex = configs.findIndex(cfg => {
            return selectConfig.size === cfg.size;
        });
        if(selectIndex > -1) {
            configs[selectIndex] = selectConfig;
        } else {
            selectConfig.select = true;
            configs.push(selectConfig);
            configs.sort((x, y) => x - y);
            selectIndex = configs.findIndex(cfg => {
                return cfg.select;
            });
        }
        this.setState({select: selectIndex});
        this.configs = configs;
        this.message = new Message({
            sender: App.user,
            date: new Date(),
            id: 999
        });
    }

    change(select, configs) {
        if(configs !== undefined) {
            this.configs = configs;
        }
        if(select !== undefined) {
            this.setState({select});
        } else {
            select = this.state.select;
        }
        let config = this.configs[select];
        App.user.setConfig('ui.chat.fontSize', config);

        clearTimeout(this.saveUserTask);
        this.saveUserTask = setTimeout(() => {
            App.emit(R.event.user_config_change, App.user.config);
        }, 2000);
    }

    _handleFontSizeChange(e, select) {
        this.change(select);
    }

    _handleRestoreDefaultClick() {
        this.change(1, CONFIGS.slice());
    }

    _handleCloseBtnClick() {
        this.props.onCloseClick && this.props.onCloseClick();
    }

    render() {
        let {
            onCloseClick,
            hidePreviewBox,
            hideActions,
            showHeader,
            ...other
        } = this.props;

        let fontSize = this.configs[this.state.select];
        if(!hidePreviewBox) {
            let message = this.message;
            message.content = Lang.chat.changeFontSizePlacehoder.format(fontSize.size);
            message.markForceRender();
        }
        return <div {...other}>
            {showHeader ? <div className="clearfix" style={{padding: '10px 10px 0'}}>
                <strong>{Lang.chat.changeFontSize}</strong>
                <div style={{float: 'right'}}><small className="muted">{Lang.chat.currentFontSize.format(fontSize.size)}</small> &nbsp; {DEFAULT_CONFIG.size !== fontSize.size ? <a onClick={this._handleRestoreDefaultClick.bind(this)} href="###">{Lang.common.restoreDefault}</a> : null}</div>
            </div> : null}
            {hidePreviewBox ? null : <div style={{padding: 20, border: '1px solid rgba(0,0,0,.1)'}}><MessageListItem fontSize={fontSize} className={'message message-t-' + message.type} key={message.gid} message={message} hideAvatar={false} hideTime={false} style={{marginBottom: 0}} /></div>}
            <Slider min={0} max={this.configs.length - 1} step={1} value={this.state.select} onChange={this._handleFontSizeChange.bind(this)} sliderStyle={{marginBottom: 20}} style={{paddingLeft: 10, paddingRight: 10}} />
            {hideActions ? null : <div className="clearfix" style={{margin: '0 -10px'}}>
                <FlatButton secondary={true} style={{float: 'left'}} label={Lang.common.restoreDefault} onClick={this._handleRestoreDefaultClick.bind(this)}/>
                <FlatButton primary={true} style={{float: 'right'}} label={Lang.common.close} onClick={this._handleCloseBtnClick.bind(this)}/>
            </div>}
        </div>
    }
}

export {DEFAULT_CONFIG as defaultFontSize};
export default ChangeFontSizeView;
