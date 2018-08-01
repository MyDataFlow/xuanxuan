import React, {Component} from 'react';
import PropTypes from 'prop-types';
import hotkeys from 'hotkeys-js';
import AreaSelector from './area-selector';
import Icon from './icon';
import Avatar from './avatar';
import timeSequence from '../utils/time-sequence';
import ImageHelper from '../utils/image';

/**
 * Image cutter component
 *
 * @class ImageCutter
 * @extends {Component}
 */
class ImageCutter extends Component {
    static defaultProps = {
        sourceImage: null,
        style: null,
        onFinish: null,
        onCancel: null,
    };

    static propTypes = {
        sourceImage: PropTypes.string,
        style: PropTypes.object,
        onFinish: PropTypes.func,
        onCancel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            hover: true,
        };
    }

    componentDidMount() {
        this.HotkeysScope = timeSequence();
        hotkeys.setScope(this.HotkeysScope);
        hotkeys('esc', this.HotkeysScope, () => {
            this.handleCloseButtonClick();
        });
        hotkeys('enter', this.HotkeysScope, () => {
            this.handleOkButtonClick();
        });
    }

    componentWillUnmount() {
        hotkeys.deleteScope(this.HotkeysScope);
    }

    handleOkButtonClick = () => {
        if (this.select) {
            ImageHelper.cutImage(this.props.sourceImage, this.select).then(image => {
                if (this.props.onFinish) {
                    this.props.onFinish(image);
                }
            }).catch(err => {
                if (DEBUG) {
                    console.warn('Cut image error', err);
                }
            });
        } else if (this.props.onFinish) {
            this.props.onFinish(null);
        }
    }

    handleCloseButtonClick = () => {
        if (this.props.onFinish) {
            this.props.onFinish(null);
        }
    }

    handleSelectArea = (select) => {
        this.select = select;
    }

    render() {
        let {
            sourceImage,
            style,
            onFinish,
            onCancel,
            ...other
        } = this.props;

        const imageUrl = `file://${sourceImage.replace(/\\/g, '/')}`;

        style = Object({
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url("${imageUrl}")`,
            backgroundPosition: 'center',
            backgroundSize: 'contain'
        }, style);

        const toolbar = (<nav
            className="layer nav primary-pale"
            style={{marginTop: 2, marginBottom: 2}}
        >
            <a onClick={this.handleCloseButtonClick}><Icon name="close icon-2x text-danger" /></a>
            <a onClick={this.handleOkButtonClick}><Icon name="check icon-2x text-success" /></a>
        </nav>);

        return (<div
            {...other}
            className="dock user-app-no-dragable"
            style={style}
            onMouseEnter={() => {this.setState({hover: true});}}
            onMouseLeave={() => {this.setState({hover: false});}}
        >
            <AreaSelector
                onSelectArea={this.handleSelectArea}
                style={{zIndex: 2, display: this.state.hover ? 'block' : 'block'}}
                className="dock"
                img={imageUrl}
                toolbarHeight={50}
                toolbar={toolbar}
            />
            <Avatar className="state darken dock dock-right dock-top" icon="close icon-2x" onClick={this.handleCloseButtonClick} />
        </div>);
    }
}

export default ImageCutter;
