import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Config from 'Config';

const PKG = Config.pkg;

class BuildInfo extends Component {
    render() {
        return <div {...this.props}>v{PKG.version}{PKG.distributeTime ? (' (' + Moment(PKG.distributeTime).format('YYYYMMDDHHmm') + ')') : null} {Config.system.specialVersion ? (' for ' + system.config.specialVersion) : ''} {DEBUG ? '[debug]' : ''}</div>;
    }
}

export default BuildInfo;
