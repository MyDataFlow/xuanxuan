import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import SearchControl from '../../components/search-control';
import Button from '../../components/button';
import OpenedApp from '../../exts/opened-app';
import Exts from '../../exts';
import ExtensionListItem from './extension-list-item';

const extensionTypes = [
    {type: '', label: Lang.string('ext.extensions.all')},
    {type: 'app', label: Lang.string('ext.extensions.apps')},
    {type: 'plugin', label: Lang.string('ext.extensions.plugins')},
    {type: 'theme', label: Lang.string('ext.extensions.themes')},
];

export default class ExtensionsView extends Component {
    static propTypes = {
        className: PropTypes.string,
        app: PropTypes.instanceOf(OpenedApp).isRequired,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        const {app} = props;
        this.state = {
            search: '',
            showInstalled: true,
            type: (app.params && app.params.type) ? app.params.type : ''
        };
    }

    handleNavItemClick(extType) {
        this.props.app.params = {type: extType.type};
        this.setState({type: extType.type});
    }

    handleSearchChange = search => {
        this.setState({search});
    };

    render() {
        const {
            className,
            app,
        } = this.props;

        const {search, type} = this.state;
        const extensions = search ? Exts.all.search(search, type) : Exts.all.getTypeList(type);

        return (<div className={HTML.classes('app-ext-extensions', className)}>
            <header className="app-ext-extensions-header has-padding heading divider">
                <nav className="nav">
                    {
                        extensionTypes.map(extType => {
                            return <a onClick={this.handleNavItemClick.bind(this, extType)} className={extType.type === this.state.type ? 'active' : ''}>{extType.label}</a>;
                        })
                    }
                </nav>
                <div className="flex-auto">
                    <SearchControl onSearchChange={this.handleSearchChange} />
                </div>
                <nav className="toolbar flex-none">
                    <div className="nav-item has-padding-sm hint--left" data-hint={Lang.string('ext.extensions.installLocalExtTip')}>
                        <Button className="rounded outline green" icon="package-variant" label={Lang.string('ext.extensions.installLocalExtension')} />
                    </div>
                </nav>
            </header>
            <div className="app-exts-list list has-padding multi-lines with-avatar">
                <div className="heading">
                    <div className="title">{Lang.string(search ? 'ext.extensions.searchResult' : 'ext.extensions.installed')} ({extensions.length})</div>
                </div>
                {
                    extensions.map(ext => {
                        return <ExtensionListItem className="item flex-middle" extension={ext} />;
                    })
                }
            </div>
        </div>);
    }
}
