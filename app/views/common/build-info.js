import React, {Component} from 'react';
import Config from 'Config';
import Platform from 'Platform';
import DateHelper from '../../utils/date-helper';

const setting = Platform.setting || Config;
const PKG = setting.pkg;

class BuildInfo extends Component {
    handleLogoClick = () => {
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
        return <div onClick={this.handleLogoClick} {...this.props}>v{PKG.version}{PKG.distributeTime ? (` (${DateHelper.format(PKG.distributeTime, 'YYYYMMDDHHmm')})`) : null} {setting.system.specialVersion ? (` for ${setting.system.specialVersion}`) : ''} {DEBUG ? '[debug]' : ''}</div>;
    }
}

export default BuildInfo;
