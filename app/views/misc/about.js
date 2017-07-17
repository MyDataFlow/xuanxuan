import React               from 'react';
import Theme               from '../../theme';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang, Config} from 'App';
import BuildInfo           from './build-info';
import FlatButton          from 'material-ui/FlatButton';
import Helper              from 'Helper';
import PKG                 from '../../package.json';

// display app component
const About = React.createClass({
    mixins: [PureRenderMixin],

    render() {
        const STYLE = {
            main: {
                backgroundColor: Theme.color.canvas
            },
            logo: {
                maxWidth: 150,
                margin: '0 auto 20px'
            },
            btnLabel: {
                textTransform: 'none',
                fontWeight: 'normal'
            }
        };

        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}>
          <div className='text-center'>
            <div style={STYLE.logo}><img src={App.config.imagesResourcePath + 'logo.png'} /></div>
            <BuildInfo style={{fontSize: '12px'}}/>
            <br/><br/>
            <FlatButton onClick={e => {
                App.openExternal(PKG.homepage);
            }} label={PKG.homepage} primary={true} labelStyle={{textTransform: 'none'}} />
            <br/>
            <FlatButton onClick={e => {
                App.openExternal('https://github.com/easysoft/xuanxuan/blob/master/LICENSE');
            }} label={`Open source license ${PKG.license}`} labelStyle={STYLE.btnLabel} />
            <br/>
            <FlatButton onClick={e => {
                App.openExternal('http://cnezsoft.com/');
            }} label={Lang.common.copyrightFormat.format({year: new Date().getFullYear(), name: PKG.company})} labelStyle={STYLE.btnLabel} />
            <br/>
            <FlatButton onClick={e => {
                App.openExternal('http://emojione.com/');
            }} label="Emoji provided free by EmojiOne" labelStyle={STYLE.btnLabel} />
            <br/>
          </div>
        </div>
    }
});

export default About;
