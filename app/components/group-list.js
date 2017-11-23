import React, {Component, PropTypes} from 'react';
import HTML from '../utils/html-helper';
import Icon from './icon';
import Heading from './heading';
import ListItem from './list-item';

/**
 * GroupList component
 *
 * @export
 * @class GroupList
 * @extends {Component}
 */
export default class GroupList extends Component {
    /**
     * Default properties values
     *
     * @static
     * @memberof GroupList
     * @return {Object}
     */
    static defaultProps = {
        headingCreator: null,
        itemCreator: null,
        group: null,
        className: null,
        children: null,
        defaultExpand: true,
        toggleWithHeading: true,
        onClick: null,
        collapseIcon: 'chevron-right',
        expandIcon: 'chevron-down',
    }

    /**
     * Properties types
     *
     * @static
     * @memberof GroupList
     * @return {Object}
     */
    static propTypes = {
        onClick: PropTypes.func,
        headingCreator: PropTypes.func,
        itemCreator: PropTypes.func,
        group: PropTypes.object,
        className: PropTypes.string,
        children: PropTypes.any,
        defaultExpand: PropTypes.bool,
        toggleWithHeading: PropTypes.bool,
        collapseIcon: PropTypes.string,
        expandIcon: PropTypes.string,
    }

    constructor(props) {
        super(props);
        let {defaultExpand} = props.defaultExpand;
        if (typeof defaultExpand === 'function') {
            defaultExpand = defaultExpand(props.group);
        }
        this.state = {
            expand: defaultExpand
        };
    }

    handleClick = e => {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
        console.log('onGroupListClick', Object.assign({}, e));
    };

    toggle(expand, callback) {
        if (expand === undefined) {
            expand = !this.state.expand;
        }
        this.setState({expand}, callback);
    }

    expand(callback) {
        this.toggle(true, callback);
    }

    collapse(callback) {
        this.toggle(false, callback);
    }

    /**
     * React render method
     *
     * @returns
     * @memberof GroupList
     */
    render() {
        const {
            headingCreator,
            itemCreator,
            group,
            toggleWithHeading,
            defaultExpand,
            expandIcon,
            collapseIcon,
            className,
            children,
            onClick,
            ...other
        } = this.props;

        const {
            title,
            list,
        } = group;

        let headingView = null;
        if (headingCreator) {
            headingView = headingCreator(group);
        } else if (title) {
            if (React.isValidElement(title)) {
                headingView = title;
            } else if (typeof title === 'object') {
                headingView = <Heading {...title} />;
            } else if (title) {
                const icon = this.state.expand ? expandIcon : collapseIcon;
                let iconView = null;
                if (icon) {
                    if (React.isValidElement(icon)) {
                        iconView = icon;
                    } else if (typeof icon === 'object') {
                        iconView = <Icon {...icon} />;
                    } else {
                        iconView = <Icon name={icon} />;
                    }
                }
                headingView = (<header className="heading">
                    {iconView}
                    <div className="title">{title}</div>
                </header>);
            }
        }

        return (<div
            className={HTML.classes('app-group-list list', className)}
            onClick={this.handleClick}
            {...other}
        >
            {headingView}
            {list && list.map((item, index) => {
                if (item.type === 'group' || item.list) {
                    return (<GroupList
                        group={item}
                        itemCreator={itemCreator}
                        toggleWithHeading={toggleWithHeading}
                        headingCreator={headingCreator}
                        defaultExpand={defaultExpand}
                        expandIcon={expandIcon}
                        collapseIcon={collapseIcon}
                    />);
                }
                if (itemCreator) {
                    return itemCreator(item, index);
                }
                return <ListItem {...item} />;
            })}
            {children}
        </div>);
    }
}
