import React, {
    Component,
    PropTypes
}                          from 'react';
import ReactDOM            from 'react-dom';
import Theme               from 'Theme';
import App                 from 'App';
import Lang                from 'Lang';
import Helper              from 'Helper';
import Checkbox            from 'material-ui/Checkbox';
import DEFAULT             from 'Models/user-default-config';
import DropDownMenu        from 'material-ui/DropDownMenu';
import MenuItem            from 'material-ui/MenuItem';
import FlatButton          from 'material-ui/FlatButton';
import ShortcutField       from 'Components/shortcut-field';

/**
 * User setting view
 */
class UserSettingView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            config: Object.assign({}, DEFAULT, this.props.config)
        };
    }

    changeConfig(name, value) {
        let {config} = this.state;
        config[name] = value;
        this.setState({config});
        this.configChanged = true;
    }

    getConfig() {
        return this.state.config;
    }

    resetConfig() {
        let config = Object.assign({}, DEFAULT);
        this.setState({config});
        this.globalShortcutField.setValue(config['shortcuts.captureScreen']);
        this.configChanged = true;
    }

    render() {
        const STYLE = {
            container: {},
            header: {borderBottom: '1px solid ' + Theme.color.border, padding: '8px 4px', fontSize: '13px', color: Theme.color.icon},
            body: {padding: '16px 0 16px 32px'},
            checkbox: {marginBottom: 8},
            insetBody: {paddingLeft: 40}
        };

        return <div style={STYLE.container}>
          <section>
            <header style={STYLE.header}>{Lang.settings.chat}</header>
            <div style={STYLE.body}>
              <Checkbox
                label={Lang.settings.showMeOnMenu}
                style={STYLE.checkbox}
                checked={this.state.config['ui.chat.menu.showMe']}
                onCheck={(e, isChecked) => this.changeConfig('ui.chat.menu.showMe', isChecked)}
              />
              <Checkbox
                label={Lang.settings.sendHDEmoticon}
                style={STYLE.checkbox}
                checked={this.state.config['ui.chat.sendHDEmoticon']}
                onCheck={(e, isChecked) => this.changeConfig('ui.chat.sendHDEmoticon', isChecked)}
              />
              <Checkbox
                label={Lang.settings.showMessageTip}
                style={STYLE.checkbox}
                checked={this.state.config['ui.chat.showMessageTip']}
                onCheck={(e, isChecked) => this.changeConfig('ui.chat.showMessageTip', isChecked)}
              />
              <Checkbox
                label={Lang.settings.enableSearchInEmojionePicker}
                style={STYLE.checkbox}
                checked={this.state.config['ui.chat.enableSearchInEmojionePicker']}
                onCheck={(e, isChecked) => this.changeConfig('ui.chat.enableSearchInEmojionePicker', isChecked)}
              />
              <Checkbox
                label={Lang.settings.enableAnimate}
                style={STYLE.checkbox}
                checked={this.state.config['ui.animate.enable']}
                onCheck={(e, isChecked) => this.changeConfig('ui.animate.enable', isChecked)}
              />
            </div>
          </section>
          <section>
            <header style={STYLE.header}>{Lang.settings.notification}</header>
            <div style={STYLE.body}>
              <Checkbox
                label={Lang.settings.enableSoundNotification}
                style={STYLE.checkbox}
                checked={this.state.config['ui.notify.enableSound']}
                onCheck={(e, isChecked) => this.changeConfig('ui.notify.enableSound', isChecked)}
              />
              <div style={STYLE.insetBody} className={this.state.config['ui.notify.enableSound'] ? '' : 'hide'}>
                <div className="clearfix" style={{marginTop: -10, marginBottom: 10}}>
                  <div className="pull-left" style={{marginTop: 18}}>{Lang.settings.playSoundCondition}</div>
                  <DropDownMenu className="pull-left" value={this.state.config['ui.notify.playSoundCondition'] || ''} onChange={(e, idx, value) => this.changeConfig('ui.notify.playSoundCondition', value)} labelStyle={{fontSize: '14px', color: Theme.color.primary1}}>
                    <MenuItem value={''} primaryText={Lang.settings.playSountOnNeed} />
                    <MenuItem value={'onWindowBlur'} primaryText={Lang.settings.playSountOnWindowBlur} />
                    <MenuItem value={'onWindowHide'} primaryText={Lang.settings.playSountOnWindowHide} />
                  </DropDownMenu>
                </div>
                <Checkbox
                  label={Lang.settings.muteOnUserIsBusy}
                  style={STYLE.checkbox}
                  checked={this.state.config['ui.notify.muteOnUserIsBusy']}
                  onCheck={(e, isChecked) => this.changeConfig('ui.notify.muteOnUserIsBusy', isChecked)}
                />
              </div>
              {Helper.isWindowsOS ? <div>
                <Checkbox
                  label={Lang.settings.flashTrayIcon}
                  style={STYLE.checkbox}
                  checked={this.state.config['ui.notify.flashTrayIcon']}
                  onCheck={(e, isChecked) => this.changeConfig('ui.notify.flashTrayIcon', isChecked)}
                />
                <div style={STYLE.insetBody} className={this.state.config['ui.notify.flashTrayIcon'] ? '' : 'hide'}>
                  <div className="clearfix" style={{marginTop: -10, marginBottom: 10}}>
                    <div className="pull-left" style={{marginTop: 18}}>{Lang.settings.flashTrayIconCondition}</div>
                    <DropDownMenu className="pull-left" value={this.state.config['ui.notify.flashTrayIconCondition'] || ''} onChange={(e, idx, value) => this.changeConfig('ui.notify.flashTrayIconCondition', value)} labelStyle={{fontSize: '14px', color: Theme.color.primary1}}>
                      <MenuItem value={''} primaryText={Lang.settings.playSountOnNeed} />
                      <MenuItem value={'onWindowBlur'} primaryText={Lang.settings.playSountOnWindowBlur} />
                      <MenuItem value={'onWindowHide'} primaryText={Lang.settings.playSountOnWindowHide} />
                    </DropDownMenu>
                  </div>
                </div>
              </div> : null}
            </div>
          </section>
          <section>
            <header style={STYLE.header}>{Lang.settings.navbar}</header>
            <div style={STYLE.body}>
              <Checkbox
                label={Lang.settings.onlyShowNoticeCountOnRecents}
                style={STYLE.checkbox}
                checked={this.state.config['ui.navbar.onlyShowNoticeCountOnRecents']}
                onCheck={(e, isChecked) => this.changeConfig('ui.navbar.onlyShowNoticeCountOnRecents', isChecked)}
              />
              <Checkbox
                label={Lang.settings.showAvatarOnBottom}
                style={STYLE.checkbox}
                checked={this.state.config['ui.navbar.avatarPosition'] !== 'top'}
                onCheck={(e, isChecked) => this.changeConfig('ui.navbar.avatarPosition', isChecked ? 'bottom' : 'top')}
              />
            </div>
          </section>
          <section>
            <header style={STYLE.header}>{Lang.settings.windows}</header>
            <div style={STYLE.body}>
              <Checkbox
                label={Lang.settings.removeFromTaskbarOnHide}
                style={STYLE.checkbox}
                checked={this.state.config['ui.app.removeFromTaskbarOnHide']}
                onCheck={(e, isChecked) => this.changeConfig('ui.app.removeFromTaskbarOnHide', isChecked)}
              />
              <Checkbox
                label={Lang.settings.hideWindowOnBlur}
                style={STYLE.checkbox}
                checked={this.state.config['ui.app.hideWindowOnBlur']}
                onCheck={(e, isChecked) => this.changeConfig('ui.app.hideWindowOnBlur', isChecked)}
              />
              <div className="clearfix" style={{marginTop: -10, marginBottom: 10}}>
                <div className="pull-left" style={{marginTop: 18}}>{Lang.settings.onClickCloseButton}</div>
                <DropDownMenu className="pull-left" value={this.state.config['ui.app.onClose'] || ''} onChange={(e, idx, value) => this.changeConfig('ui.app.onClose', value)} labelStyle={{fontSize: '14px', color: Theme.color.primary1}}>
                  <MenuItem value={'ask'} primaryText={Lang.settings.askEveryTime} />
                  <MenuItem value={'minimize'} primaryText={Lang.settings.minimizeMainWindow} />
                  <MenuItem value={'close'} primaryText={Lang.settings.quitApp} />
                </DropDownMenu>
              </div>
            </div>
          </section>
          {
            App.config.screenCaptureDisabled ? null : <section>
                <header style={STYLE.header}>{Lang.settings.shortcuts}</header>
                <div style={STYLE.body}>
                <div className="clearfix" style={{marginTop: -10}}>
                    <div className="pull-left" style={{marginTop: 14}}>{Lang.settings.globalCaptureScreen}</div>
                    <ShortcutField ref={e => this.globalShortcutField = e} className="pull-left" fullWidth={true} value={this.state.config['shortcut.captureScreen'] || 'Ctrl+Alt+Z'} checkGlobal={true} onChange={newShortcut => this.changeConfig('shortcut.captureScreen', newShortcut)} style={{width: 150, marginLeft: 24}}/>
                </div>
                </div>
            </section>
          }
        </div>;
    }
}

export default UserSettingView;
