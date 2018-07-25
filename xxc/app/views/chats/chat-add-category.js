import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import InputControl from '../../components/input-control';
import RadioGroup, {Radio} from '../../components/radio-group';
import SelectBox from '../../components/select-box';
import replaceViews from '../replace-views';

export default class ChatAddCategory extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.any,
        chat: PropTypes.any.isRequired,
        onCategoryChange: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        children: null,
        onCategoryChange: null,
    };

    static get ChatAddCategory() {
        return replaceViews('chats/chat-add-category', ChatAddCategory);
    }

    constructor(props) {
        super(props);
        const {chat} = props;
        this.allCategories = App.im.chats.getChatCategories(chat.isOne2One ? 'contact' : 'group');
        this.originCategory = chat.category;
        this.state = {
            type: (this.allCategories && this.allCategories.length) ? 'modify' : 'create',
            selectName: this.originCategory,
            newName: ''
        };
    }

    get category() {
        return {type: this.state.type, name: this.state.type === 'create' ? this.state.newName : this.state.selectName};
    }

    changeCategory = () => {
        if (this.props.onCategoryChange) {
            this.props.onCategoryChange(this.state.type === 'create' ? this.state.newName : this.state.selectName, this.state.type);
        }
    };

    handleRadioGroupChange = type => {
        this.setState({type}, () => {
            const control = (this.state.type === 'create' ? this.inputGroup : this.selectBox);
            if (control) {
                control.focus();
            }
            this.changeCategory();
        });
    };

    handleNewNameChange = (newName, e) => {
        this.setState({newName}, this.changeCategory);
        e.stopPropagation();
    };

    handleSelectNameChange = (selectName, e) => {
        this.setState({selectName}, this.changeCategory);
        e.stopPropagation();
    };

    isNewNameExist() {
        return this.state.newName && this.allCategories.find(x => x.id === this.state.newName);
    }

    render() {
        const {
            chat,
            className,
            children,
            onCategoryChange,
            ...other
        } = this.props;

        const isTypeCreate = this.state.type === 'create';
        let createView = null;
        if (isTypeCreate) {
            createView = (<div className="sub-control">
                <InputControl
                    ref={e => {this.inputGroup = e;}}
                    value={this.state.newName}
                    onChange={this.handleNewNameChange}
                    label={false}
                    placeholder={Lang.string('chats.menu.group.createTip')}
                    helpText={this.isNewNameExist() ? Lang.string('chats.menu.group.existsTip') : null}
                />
            </div>);
        }

        let modifyView = null;
        const hasExistCategory = this.allCategories && this.allCategories.length;
        if (!isTypeCreate && hasExistCategory) {
            const options = this.allCategories.map(x => {
                let title = x.title;
                if (!x.id) {
                    const defaultTitle = Lang.string('chats.menu.group.default');
                    if (defaultTitle !== title) {
                        title += ` (${defaultTitle})`;
                    }
                } else if (x.id === this.originCategory) {
                    title += ` (${Lang.string('chats.menu.group.current')})`;
                }
                return {label: title, value: x.id};
            });
            modifyView = (<div className="sub-control">
                <SelectBox ref={e => {this.selectBox = e;}} value={this.state.selectName} onChange={this.handleSelectNameChange} options={options} />
            </div>);
        }

        const langAddExist = Lang.string('chats.menu.group.addExist');
        return (<div className={HTML.classes('app-chats-add-category', className)} {...other}>
            {children}
            <RadioGroup onChange={this.handleRadioGroupChange}>
                <Radio name="chat-category" disabled={!hasExistCategory} label={hasExistCategory ? langAddExist : <span>{langAddExist} (<small>{Lang.string('chats.menu.group.noCategoryToAdd')}</small>)</span>} checked={!isTypeCreate} value="modify">{modifyView}</Radio>
                <Radio name="chat-category" label={Lang.string('chats.menu.group.create')} checked={isTypeCreate} value="create">{createView}</Radio>
            </RadioGroup>
        </div>);
    }
}
