import React, {Component, PropTypes} from 'react';
import Icon from './icon';
import Avatar from './avatar';
import Lang from '../lang';
import HTML from '../utils/html-helper';

/**
 * Image cutter component
 *
 * @class ImageHolder
 * @extends {Component}
 */
export default class ImageHolder extends Component {
    static defaultProps = {
        style: null,
        source: null,
        thumbnail: null,
        width: 0,
        height: 0,
        alt: '',
        status: 'ok', // 'loading', 'upload', 'ok', 'broken',
        progress: 0,
        className: '',
    };

    static propTypes = {
        style: PropTypes.object,
        source: PropTypes.string,
        thumbnail: PropTypes.string,
        width: PropTypes.number,
        height: PropTypes.number,
        progress: PropTypes.number,
        status: PropTypes.string,
        alt: PropTypes.string,
        className: PropTypes.string
    };

    render() {
        let {
            style,
            source,
            thumbnail,
            width,
            height,
            status,
            progress,
            alt,
            className,
            ...other
        } = this.props;

        style = Object({
            maxWidth: width || 'initial',
        }, style);

        const innerStyle = {
            paddingBottom: width ? `${(100 * height) / width}%` : 0,
            background: width && status !== 'ok' ? '#f1f1f1' : 'transparent',
        };

        const imgStyle = {
            position: width ? 'absolute' : 'static',
            top: 0,
            left: 0,
            margin: 0
        };

        if (status === 'broken') {
            return <Avatar className="avatar-xl warning-pale text-warning app-message-image-placeholder" icon="image-broken" title={Lang.string('file.uploadFailed')} />;
        }

        let imgView = null;
        if (source) {
            imgView = <img src={source} style={imgStyle} alt={alt || source} data-fail={Lang.string('file.downloadFailed')} onError={e => e.target.classList.add('broken')} />;
        } else if (thumbnail) {
            imgView = <img src={thumbnail} style={imgStyle} alt={alt || thumbnail} />;
        } else if (status === 'broken') {
            imgView = <div className="dock center-content"><Icon name="image-broken" className="muted icon-5x" /></div>;
        } else if (status === 'loading') {
            imgView = <div className={`img-hold-progress${!progress ? ' img-hold-waiting' : ''}`}><div className="dock center-content"><Icon name="image-filter-hdr" className="muted icon-5x" /></div><div className="text">{Lang.string('file.downloading')}{progress ? `${Math.floor(progress)}%` : ''}</div><div className="progress"><div className="bar" style={{width: progress ? `${progress}%` : '100%'}} /></div></div>;
        } else if (status === 'upload') {
            imgView = <div className={`img-hold-progress${!progress ? ' img-hold-waiting' : ''}`}><div className="dock center-content"><Icon name="image-filter-hdr" className="muted icon-5x" /></div><div className="text">{Lang.string('file.uploading')}{progress ? `${Math.floor(progress)}%` : ''}</div><div className="progress"><div className="bar" style={{width: progress ? `${progress}%` : '100%'}} /></div></div>;
        }

        return (<div
            className={HTML.classes('img-holder', className)}
            style={style}
            {...other}
        >
            <div className="img-hold-box" style={innerStyle}>
                {imgView}
            </div>
        </div>);
    }
}
