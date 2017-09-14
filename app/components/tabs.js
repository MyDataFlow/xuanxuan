import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../utils/html-helper';

class TabPane extends Component {
    static defaultProps = {
        label: 'tab',
    };

    render() {
        let {
            label,
            children,
            ...other
        } = this.props;

        return <div {...other}>{children}</div>;
    }
}

class Tabs extends Component {

    static defaultProps = {
        navClassName: '',
        activeClassName: 'active',
        cache: false
    };

    constructor(props) {
        super(props);
        this.state = {
            activePaneKey: this.props.defaultActivePaneKey
        };
    }

    handleNavClick(key) {
        if(key !== this.state.activePaneKey) {
            const oldKey = this.state.activePaneKey;
            this.setState({activePaneKey: key}, () => {
                this.props.onPaneChange && this.props.onPaneChange(key, oldKey);
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

        return <div className={HTML.classes('tabs', className)} {...other}>
            <nav className={HTML.classes('nav', navClassName)}>
            {
                children.map(item => {
                    return <a key={item.key} className={item.key === this.state.activePaneKey ? activeClassName : ''} onClick={this.handleNavClick.bind(this, item.key)}>{item.props.label}</a>
                })
            }
            </nav>
            <div className={HTML.classes('content', contentClassName)}>
            {
                children.map(item => {
                    if(item.key === this.state.activePaneKey) {
                        return <div key={item.key} className={HTML.classes('tab-pane active', tabPaneClass)}>{item}</div>;
                    }
                    if(cache) {
                        return <div key={item.key} className={HTML.classes('tab-pane hidden', tabPaneClass)}>{item}</div>;
                    } else {
                        return null;
                    }
                })
            }
            </div>
        </div>;
    }
}

export default {Tabs, TabPane};
