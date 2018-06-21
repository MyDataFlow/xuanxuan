import React, {PureComponent} from 'react';
import Config from 'Config';
import Platform from 'Platform';
import DateHelper from '../../utils/date-helper';
import replaceViews from '../replace-views';

const PKG = Config.pkg;

class BuildInfo extends PureComponent {
    static get BuildInfo() {
        return replaceViews('common/build-info', BuildInfo);
    }

    handleClick = () => {
        const now = new Date().getTime();
        if (!this.lastClickTime) {
            this.lastClickTime = now;
        }

        if (!this.clickTimes) {
            this.clickTimes = 1;
        } else if (now - this.lastClickTime < 400) {
            this.clickTimes += 1;
            this.lastClickTime = now;
            if (this.clickTimes >= 5) {
                if (Platform.ui.openDevTools) {
                    Platform.ui.openDevTools();
                }
            }
        } else {
            this.clickTimes = 0;
            this.lastClickTime = 0;
        }
    }

    render() {
        return <div onClick={this.handleClick} {...this.props}>v{PKG.version}{PKG.distributeTime ? (` (${DateHelper.format(PKG.distributeTime, 'YYYYMMDDHHmm')})`) : null}{PKG.buildVersion ? `.${PKG.buildVersion}` : null} {Config.system.specialVersion ? (` for ${Config.system.specialVersion}`) : ''} {DEBUG ? '[debug]' : ''}</div>;
    }
}

export default BuildInfo;
