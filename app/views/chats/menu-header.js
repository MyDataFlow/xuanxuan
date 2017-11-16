import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import SearchControl from '../../components/search-control';
import Icon from '../../components/icon';
import Lang from '../../lang';
import ChatCreateDialog from './chat-create-dialog';
import replaceViews from '../replace-views';

class MenuHeader extends Component {
    static propTypes = {
        className: PropTypes.string,
        onSearchChange: PropTypes.func,
        children: PropTypes.any,
        defaultSearch: PropTypes.string,
        filter: PropTypes.string,
    };

    static defaultProps = {
        className: null,
        onSearchChange: null,
        children: null,
        defaultSearch: null,
        filter: null
    };

    static get MenuHeader() {
        return replaceViews('chats/menu-header', MenuHeader);
    }

    handleCreateBtnClick = () => {
        ChatCreateDialog.show();
    }

    render() {
        const {
            className,
            children,
            onSearchChange,
            defaultSearch,
            filter,
            ...other
        } = this.props;

        return (<div className={HTML.classes('app-chats-menu-header', className)} {...other}>
            <SearchControl
                defaultValue={defaultSearch}
                className="app-chats-search"
                onSearchChange={onSearchChange}
                placeholder={Lang.string(`chats.search.${filter}`)}
            />
            <div className="app-chats-create-btn hint--bottom" data-hint={Lang.string('chats.create.label')}>
                <button type="button" className="btn rounded iconbutton" onClick={this.handleCreateBtnClick}><Icon name="comment-plus-outline" className="icon-2x" /></button>
            </div>
            {children}
        </div>);
    }
}

export default MenuHeader;
