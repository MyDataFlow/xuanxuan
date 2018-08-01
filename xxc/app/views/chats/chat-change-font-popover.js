import React, {Component} from 'react';
import Popover from '../../components/popover';
import Lang from '../../lang';
import App from '../../core';
import DelayAction from '../../utils/delay-action';
import replaceViews from '../replace-views';

const DEFAULT_CONFIG = {
    size: 13,
    lineHeight: 1.5384615385,
    title: 13,
    titleLineHeight: 1.53846153846
};

const CONFIGS = [
    {
        size: 12,
        lineHeight: 1.5,
        title: 12,
        titleLineHeight: 1.5
    }, DEFAULT_CONFIG, {
        size: 14,
        lineHeight: 1.5,
        title: 14,
        titleLineHeight: 1.4285714286
    }, {
        size: 15,
        lineHeight: 1.5,
        title: 15,
        titleLineHeight: 1.6
    }, {
        size: 18,
        lineHeight: 1.5,
        title: 15,
        titleLineHeight: 1.6
    }, {
        size: 20,
        lineHeight: 1.5,
        title: 16,
        titleLineHeight: 1.75
    }, {
        size: 24,
        lineHeight: 1.5,
        title: 16,
        titleLineHeight: 1.75
    }, {
        size: 30,
        lineHeight: 1.5,
        title: 18,
        titleLineHeight: 1.666666667
    }, {
        size: 36,
        lineHeight: 1.5,
        title: 18,
        titleLineHeight: 1.666666667
    }
];

class ChangeFontView extends Component {
    static get ChangeFontView() {
        return replaceViews('chats/chat-change-font-popover', ChangeFontView);
    }

    constructor(props) {
        super(props);
        this.state = {select: 1};

        const userFontSize = App.profile.userConfig.chatFontSize;
        if (userFontSize) {
            const userIndex = CONFIGS.findIndex(x => x.size === userFontSize.size);
            if (userIndex > -1) {
                this.state.select = userIndex;
            }
        }

        this.changeFontSizeTask = new DelayAction(() => {
            App.profile.userConfig.chatFontSize = CONFIGS[this.state.select];
        }, 200);
    }

    componentWillUnmount() {
        if (!this.changeFontSizeTask.isDone) {
            this.changeFontSizeTask.doIm();
        }
    }

    handleSliderChange = e => {
        const select = parseInt(e.target.value, 10);
        this.setState({select});
        this.changeFontSizeTask.do(select);
    }

    handleResetBtnClick = () => {
        this.setState({select: 1});
        this.changeFontSizeTask.do(1);
    }

    render() {
        const currentConfig = CONFIGS[this.state.select];
        return (<div className="box">
            <div className="flex space space-between">
                <strong>{Lang.string('chat.sendbox.toolbar.setFontSize')}</strong>
                <small className="text-gray">{Lang.format('chat.fontSize.current.format', currentConfig.size)}px  {this.state.select !== 1 ? <a className="text-primary" onClick={this.handleResetBtnClick}>{Lang.string('chat.fontSize.resetDefault')}</a> : null}</small>
            </div>
            <input className="fluid" type="range" min="0" value={this.state.select} max={CONFIGS.length - 1} step="1" onChange={this.handleSliderChange} />
        </div>);
    }
}

const show = (position, callback) => {
    const popoverId = 'app-chat-change-font-popover';
    return Popover.show(
        position,
        <ChangeFontView />,
        {id: popoverId, width: 250, height: 80},
        callback
    );
};

export default {
    show
};
