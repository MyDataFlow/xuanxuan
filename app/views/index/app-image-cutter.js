import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from '../../core';
import ImageCutter from '../../components/image-cutter';
import Platform from 'Platform';

class ImageCutterApp extends Component {

    onFinishCutImage = (image) => {
        Platform.remote.sendToMainWindow(Platform.remote.EVENT.capture_screen, image);
    }

    render() {
        const sourceImageFile = decodeURIComponent(this.props.match.params.file);

        return <div className="affix">
            <ImageCutter
                hideAreaSelectorOnBlur={true}
                onFinish={this.onFinishCutImage}
                sourceImage={sourceImageFile}
            />
        </div>
    }
}

export default ImageCutterApp;
