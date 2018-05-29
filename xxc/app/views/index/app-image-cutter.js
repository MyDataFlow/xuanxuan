import React, {Component} from 'react';
import Platform from 'Platform';
import ImageCutter from '../../components/image-cutter';

class ImageCutterApp extends Component {
    onFinishCutImage = (image) => {
        Platform.remote.sendToMainWindow(Platform.remote.EVENT.capture_screen, image);
    }

    render() {
        const sourceImageFile = decodeURIComponent(this.props.match.params.file);

        return (<div className="affix">
            <ImageCutter
                onFinish={this.onFinishCutImage}
                sourceImage={sourceImageFile}
            />
        </div>);
    }
}

export default ImageCutterApp;
