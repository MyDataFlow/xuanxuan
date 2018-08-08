import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Config from 'Config';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import {BuildInfo} from '../common/build-info';
import replaceViews from '../replace-views';

class About extends PureComponent {
    static get About() {
        return replaceViews('common/about', About);
    }

    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    render() {
        const {
            className,
            ...other
        } = this.props;

        return (<div
            {...other}
            className={HTML.classes('app-about center-content space', className)}
        >
            <section className="text-center">
                <img src={`${Config.media['image.path']}logo.png`} alt="logo" />
                <BuildInfo className="space-sm" />
                {Config.pkg.homepage ? <div className="space-xl"><a target="_blank" className="btn rounded text-primary strong" href={Config.pkg.homepage}><strong>{Config.pkg.homepage}</strong></a></div> : null}
                {Config.pkg.license ? <div><a target="_blank" className="btn rounded" href="https://github.com/easysoft/xuanxuan/blob/master/LICENSE">{`Open source license ${Config.pkg.license}`}</a></div> : null}
                {Config.pkg.company ? <div><a target="_blank" className="btn rounded" href="http://cnezsoft.com/">{Lang.format('common.copyrightFormat', {year: new Date().getFullYear(), name: Config.pkg.company})}</a></div> : null}
                {Config.ui.about ? <div>{Config.ui.about}</div> : null}
                <div><a target="_blank" className="btn rounded" href="http://emojione.com/">Thanks to EmojiOne for providing free emoji icons</a></div>
            </section>
        </div>);
    }
}

export default About;
