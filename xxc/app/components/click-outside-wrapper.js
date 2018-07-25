import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

/**
 * Click outside wrapper component
 * 允许监听元素外点击事件的容器元素，可以很方便的使用此组件制作点击外部即关闭的弹出层
 *
 * @example <caption>制作一个点击外部即关闭的对话框</caption>
 * let isDialogOpen = true;
 * const renderDialog = props => {
 *     return isDialogOpen ? (<ClickOutsideWrapper
 *         onClickOutside={e => {
 *              isDialogOpen = false;
 *         }}
 *     >
 *          <h1>Dialog heading</h1>
 *          <div>dialog content...</div>
 *     </ClickOutsideWrapper>) : null;
 * };
 *
 * @export
 * @class ClickOutsideWrapper
 * @extends {Component}
 */
export default class ClickOutsideWrapper extends PureComponent {
    /**
     * Default properties values
     *
     * @static
     * @memberof ClickOutsideWrapper
     */
    static defaultProps = {
        onClickOutside: null,
        children: null
    }

    /**
     * Properties types
     *
     * @static
     * @memberof ClickOutsideWrapper
     */
    static propTypes = {
        onClickOutside: PropTypes.func,
        children: PropTypes.any
    }

    /**
     * React life cycle method: componentDidMount
     *
     * @private
     * @memberof ClickOutsideWrapper
     */
    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * React life cycle method: componentWillUnmount
     *
     * @private
     * @memberof ClickOutsideWrapper
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * Handle click outside event
     *
     * @memberof ClickOutsideWrapper
     */
    handleClickOutside = event => {
        if (this.props.onClickOutside && this._wrapper && !this._wrapper.contains(event.target)) {
            this.props.onClickOutside(event, this);
        }
    }

    /**
     * React life cycle method: ClickOutsideWrapper
     *
     * @private
     * @returns
     * @memberof ClickOutsideWrapper
     */
    render() {
        const {
            onClickOutside,
            children,
            ...other
        } = this.props;

        return (
            <div ref={e => {this._wrapper = e;}} {...other}>
                {children}
            </div>
        );
    }
}
