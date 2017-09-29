import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import Member from '../../core/models/member';
import UserAvatar from './user-avatar';
import Avatar from '../../components/avatar';
import StatusDot from './status-dot';
import Config from 'Config';
import BuildInfo from '../common/build-info';
import Platform from 'Platform';

class About extends Component {

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
        let {
            className,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-about center-content space', className)}
        >
            <section className="text-center">
                <img onClick={this.handleLogoClick} src={`${Config.media['image.path']}logo.png`} />
                <BuildInfo className="space-sm"/>
                <div className="space-xl"><a target="_blank" className="btn rounded text-primary strong" href={Config.pkg.homepage}><strong>{Config.pkg.homepage}</strong></a></div>
                <div><a target="_blank" className="btn rounded" href="https://github.com/easysoft/xuanxuan/blob/master/LICENSE">{`Open source license ${Config.pkg.license}`}</a></div>
                <div><a target="_blank" className="btn rounded" href="http://cnezsoft.com/">{Lang.format('common.copyrightFormat', {year: new Date().getFullYear(), name: Config.pkg.company})}</a></div>
                <div><a target="_blank" className="btn rounded" href="http://emojione.com/">Emoji provided free by EmojiOne</a></div>
            </section>
            {children}
        </div>;
    }
}

export default About;
