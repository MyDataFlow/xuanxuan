import React   from 'react';
import PKG     from '../../package.json';
import Moment  from 'moment';
import App     from 'App';

const BuildInfo = React.createClass({
    render() {
        return <div {...this.props}>v{PKG.version}{PKG.distributeTime ? (' (' + Moment(PKG.distributeTime).format('YYYYMMDDHHmm') + ')') : null} {App.config.specialVersion ? (' for ' + App.config.specialVersion) : ''} {DEBUG ? '[debug]' : ''}</div>
    }
});

export default BuildInfo;
