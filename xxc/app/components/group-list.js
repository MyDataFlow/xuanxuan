import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import Icon from './icon';
import Heading from './heading';
import ListItem from './list-item';
import Lang from '../lang';

/**
 * GroupList component
 *
 * @export
 * @class GroupList
 * @extends {Component}
 */
export default class GroupList extends PureComponent {
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
        collapseIcon: 'chevron-right',
        expandIcon: 'chevron-down',
        hideEmptyGroup: true,
        checkIsGroup: null,
        onExpandChange: null,
        forceCollapse: false,
        startPageSize: 20,
        morePageSize: 10,
        defaultPage: 1
    }

    /**
     * Properties types
     *
     * @static
     * @memberof GroupList
     * @return {Object}
     */
    static propTypes = {
        headingCreator: PropTypes.func,
        checkIsGroup: PropTypes.func,
        itemCreator: PropTypes.func,
        onExpandChange: PropTypes.func,
        group: PropTypes.object,
        className: PropTypes.string,
        children: PropTypes.any,
        defaultExpand: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        toggleWithHeading: PropTypes.bool,
        forceCollapse: PropTypes.bool,
        hideEmptyGroup: PropTypes.bool,
        collapseIcon: PropTypes.string,
        expandIcon: PropTypes.string,
        startPageSize: PropTypes.number,
        morePageSize: PropTypes.number,
        defaultPage: PropTypes.number,
    }

    static render(list, props, page = 0, onRequestMore = null) {
        const listViews = [];
        props = Object.assign({}, GroupList.defaultProps, props);
        const maxIndex = page ? Math.min(list.length, props.startPageSize + (page > 1 ? (page - 1) * props.morePageSize : 0)) : list.length;
        for (let i = 0; i < maxIndex; ++i) {
            const item = list[i];
            if ((props.checkIsGroup && props.checkIsGroup(item)) || (!props.checkIsGroup && (item.type === 'group' || item.list))) {
                if (props.hideEmptyGroup && (!item.list || !item.list.length)) {
                    continue;
                }
                listViews.push(<GroupList
                    key={item.key || item.id || i}
                    group={(props && props.listConverter) ? props.listConverter(item) : item}
                    itemCreator={props && props.itemCreator}
                    toggleWithHeading={props && props.toggleWithHeading}
                    headingCreator={props && props.headingCreator}
                    defaultExpand={props && props.defaultExpand}
                    expandIcon={props && props.expandIcon}
                    collapseIcon={props && props.collapseIcon}
                    hideEmptyGroup={props && props.hideEmptyGroup}
                    checkIsGroup={props && props.checkIsGroup}
                    forceCollapse={props && props.forceCollapse}
                    onExpandChange={props && props.onExpandChange}
                    startPageSize={props && props.startPageSize}
                    morePageSize={props && props.morePageSize}
                    defaultPage={props && props.defaultPage}
                />);
            } else if (props && props.itemCreator) {
                listViews.push(props.itemCreator(item, i));
            } else {
                listViews.push(<ListItem key={item.key || item.id || i} {...item} />);
            }
        }
        const notShowCount = list.length - maxIndex;
        if (notShowCount) {
            listViews.push(<ListItem key="showMore" icon="chevron-double-down" className="flex-middle item muted" title={<span className="title small">{Lang.format('common.clickShowMoreFormat', notShowCount)}</span>} onClick={onRequestMore} />);
        }
        return listViews;
    }

    constructor(props) {
        super(props);
        let {defaultExpand} = props;
        if (typeof defaultExpand === 'function') {
            defaultExpand = defaultExpand(props.group, this);
        }
        this.state = {
            expand: defaultExpand,
            page: props.defaultPage
        };
    }

    toggle(expand, callback) {
        if (expand === undefined) {
            expand = !this.state.expand;
        }
        this.setState({expand}, () => {
            if (this.props.onExpandChange) {
                this.props.onExpandChange(expand, this.props.group);
            }
            if (callback) {
                callback(expand, this.props.group);
            }
        });
    }

    expand(callback) {
        this.toggle(true, callback);
    }

    collapse(callback) {
        this.toggle(false, callback);
    }

    handleHeadingClick = e => {
        this.toggle();
    }

    get isExpand() {
        return !this.props.forceCollapse && this.state.expand;
    }

    handleRequestMorePage = () => {
        this.setState({page: this.state.page + 1});
    }

    /**
     * React render method
     *
     * @returns
     * @memberof GroupList
     */
    render() {
        const {
            forceCollapse,
            headingCreator,
            hideEmptyGroup,
            checkIsGroup,
            itemCreator,
            group,
            toggleWithHeading,
            defaultExpand,
            expandIcon,
            collapseIcon,
            onExpandChange,
            className,
            children,
            startPageSize,
            morePageSize,
            defaultPage,
            ...other
        } = this.props;

        const {
            title,
            list,
            root,
        } = group;

        if (root) {
            return (<div className={HTML.classes('app-group-list-root list', className)} {...other}>
                {GroupList.render(list, this.props, this.state.page, this.handleRequestMorePage)}
            </div>);
        }

        const expand = this.isExpand;

        let headingView = null;
        if (headingCreator) {
            headingView = headingCreator(group, this);
        } else if (title) {
            if (React.isValidElement(title)) {
                headingView = title;
            } else if (typeof title === 'object') {
                headingView = <Heading {...title} />;
            } else if (title) {
                const icon = expand ? expandIcon : collapseIcon;
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
                headingView = (<header onClick={toggleWithHeading ? this.handleHeadingClick : null} className="heading">
                    {iconView}
                    <div className="title">{title}</div>
                </header>);
            }
        }

        return (<div
            className={HTML.classes('app-group-list list', className, {'is-expand': expand, 'is-collapse': !expand})}
            {...other}
        >
            {headingView}
            {expand && list && GroupList.render(list, this.props, this.state.page, this.handleRequestMorePage)}
            {children}
        </div>);
    }
}
