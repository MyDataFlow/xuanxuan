import Emojione from 'emojione';
import Config   from 'Config';

Emojione.imagePathPNG = Config.emojioneImagesPath;
Emojione.imageType = 'png';

if(DEBUG) {
    global.$.Emojione = Emojione;
}

export default Emojione;
