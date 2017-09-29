import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import SearchControl from '../../components/search-control';
import Icon from '../../components/icon';
import Lang from '../../lang';
import ChatCreateDialog from './chat-create-dialog';

class MenuHeader extends Component {

    handleCreateBtnClick = () => {
        ChatCreateDialog.show();
    }

    render() {
        let {
            className,
            style,
            children,
            onSearchChange,
            defaultSearch,
            filter,
            ...other
        } = this.props;

        return <div className={HTML.classes('app-chats-menu-header', className)} style={style} {...other}>
            <SearchControl
                defaultValue={defaultSearch}
                className="app-chats-search"
                onSearchChange={onSearchChange}
                placeholder={Lang.string(`chats.search.${filter}`)}
            />
            <div className="app-chats-create-btn hint--bottom" data-hint={Lang.string('chats.create.label')}>
                <button type="button" className="btn rounded iconbutton" onClick={this.handleCreateBtnClick}><Icon name="comment-plus-outline" className="icon-2x"/></button>
            </div>
            {children}
        </div>;
    }
}

export default MenuHeader;
