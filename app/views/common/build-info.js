import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Config from 'Config';
import Platform from 'Platform';

const PKG = Config.pkg;

class BuildInfo extends Component {

    handleLogoClick = e => {
        const now = new Date().getTime();
        if(!this.lastClickTime) {
            this.lastClickTime = now;
        }

        if(!this.clickTimes) {
            this.clickTimes = 1;
        } else if(now - this.lastClickTime < 400) {
            this.clickTimes++;
            this.lastClickTime = now;
            if(this.clickTimes >= 5) {
                if(Platform.ui.openDevTools) {
                    Platform.ui.openDevTools();
                }
            }
        } else {
            this.clickTimes = 0;
            this.lastClickTime = 0;
        }
    }

    render() {
        return <div onClick={this.handleLogoClick} {...this.props}>v{PKG.version}{PKG.distributeTime ? (' (' + Moment(PKG.distributeTime).format('YYYYMMDDHHmm') + ')') : null} {Config.system.specialVersion ? (' for ' + Config.system.specialVersion) : ''} {DEBUG ? '[debug]' : ''}</div>;
    }
}

export default BuildInfo;
