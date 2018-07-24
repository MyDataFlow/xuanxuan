import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Icon from './icon';
import Avatar from './avatar';
import Lang from '../lang';
import {classes} from '../utils/html-helper';

/**
 * Image cutter component
 *
 * @class ImageHolder
 * @extends {Component}
 */
export default class ImageHolder extends PureComponent {
    static propTypes = {
        style: PropTypes.object,
        source: PropTypes.string,
        thumbnail: PropTypes.string,
        width: PropTypes.number,
        height: PropTypes.number,
        progress: PropTypes.number,
        status: PropTypes.string,
        alt: PropTypes.string,
        className: PropTypes.string,
        loadingText: PropTypes.string,
        previewUrl: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        style: null,
        source: null,
        thumbnail: null,
        width: 0,
        height: 0,
        alt: '',
        status: 'ok', // 'loading', 'ok', 'broken',
        progress: 0,
        className: '',
        loadingText: '',
        previewUrl: null,
        children: null,
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
            loadingText,
            previewUrl,
            children,
            ...other
        } = this.props;

        style = Object({
            maxWidth: width || 'initial',
        }, style);

        const innerStyle = {
            paddingBottom: width ? `${(100 * height) / width}%` : 0,
            backgroundColor: width && status !== 'ok' ? '#f1f1f1' : 'transparent',
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
            if (previewUrl) {
                innerStyle.backgroundImage = `url('${previewUrl}')`;
                innerStyle.backgroundRepeat = 'no-repeat';
                innerStyle.backgroundSize = 'contain';
                innerStyle.backgroundPosition = 'center';
            }
            imgView = <div className={`img-hold-progress${!progress ? ' img-hold-waiting' : ''}`}><div className="dock center-content">{previewUrl ? null : <Icon name="image-filter-hdr" className="muted icon-5x" />}</div><div className="text flex flex-middle"><Icon name="loading" className="inline-block spin inline-block text-shadow-white" /> &nbsp; {loadingText}{progress ? `${Math.floor(progress)}%` : ''}</div><div className="progress"><div className="bar" style={{width: progress ? `${progress}%` : '100%'}} /></div></div>;
        }

        return (<div
            className={classes('img-holder', className)}
            style={style}
            {...other}
        >
            <div className="img-hold-box" style={innerStyle}>
                {imgView}
            </div>
            {children}
        </div>);
    }
}
