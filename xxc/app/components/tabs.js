import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import TabPane from './tab-pane';

class Tabs extends PureComponent {
    static propTypes = {
        navClassName: PropTypes.string,
        activeClassName: PropTypes.string,
        tabPaneClass: PropTypes.string,
        contentClassName: PropTypes.string,
        className: PropTypes.string,
        children: PropTypes.any,
        cache: PropTypes.bool,
        defaultActivePaneKey: PropTypes.any,
        onPaneChange: PropTypes.func,
    };

    static defaultProps = {
        navClassName: '',
        activeClassName: 'active',
        contentClassName: 'active',
        tabPaneClass: '',
        className: '',
        cache: false,
        defaultActivePaneKey: null,
        onPaneChange: null,
        children: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            activePaneKey: this.props.defaultActivePaneKey
        };
    }

    handleNavClick(key) {
        if (key !== this.state.activePaneKey) {
            const oldKey = this.state.activePaneKey;
            this.setState({activePaneKey: key}, () => {
                if (this.props.onPaneChange) {
                    this.props.onPaneChange(key, oldKey);
                }
            });
        }
    }

    render() {
        let {
            defaultActivePaneKey,
            cache,
            navClassName,
            tabPaneClass,
            activeClassName,
            contentClassName,
            onPaneChange,
            className,
            children,
            ...other
        } = this.props;

        if (!Array.isArray(children)) {
            children = [children];
        }

        return (<div className={HTML.classes('tabs', className)} {...other}>
            <nav className={HTML.classes('nav', navClassName)}>
                {
                    children.map(item => {
                        return <a key={item.key} className={item.key === this.state.activePaneKey ? activeClassName : ''} onClick={this.handleNavClick.bind(this, item.key)}>{item.props.label}</a>;
                    })
                }
            </nav>
            <div className={HTML.classes('content', contentClassName)}>
                {
                    children.map(item => {
                        if (item.key === this.state.activePaneKey) {
                            return <div key={item.key} className={HTML.classes('tab-pane active', tabPaneClass)}>{item}</div>;
                        }
                        if (cache) {
                            return <div key={item.key} className={HTML.classes('tab-pane hidden', tabPaneClass)}>{item}</div>;
                        }
                        return null;
                    })
                }
            </div>
        </div>);
    }
}

export default {Tabs, TabPane};
