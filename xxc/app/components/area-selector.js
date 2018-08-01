import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * 判定一个点是否在矩形区域内
 *
 * @access private
 * @param {{left: Number, top: Number}} point 要判定的点位置
 * @param {{left: Number, top: Number, width: Number, height: Number}} rect 要判定对矩形区域
 * @return {Bool} 如果在矩形区域内则返回 <code>true</code> 否则 返回 <code>false</code>
 */
const isPiontInRect = (point, rect) => (
    rect.width > 0 && rect.height > 0
        && point.left >= rect.left
        && point.left <= (rect.left + rect.width)
        && point.top >= rect.top
        && point.top <= (rect.top + rect.height)
);

/**
 * 判定一个点在矩形区域的方位
 *
 * @access private
 * @param {{left: Number, top: Number}} pos
 * @param {{left: Number, top: Number, width: Number, height: Number}} rect 要判定对矩形区域
 * @return {String}
 */
const caculatePosition = (pos, area) => {
    const halfHotSize = 5;
    const hotSize = halfHotSize + halfHotSize;
    if (isPiontInRect(pos, {
        left: area.left + halfHotSize,
        top: area.top + halfHotSize,
        width: area.width - hotSize,
        height: area.height - hotSize
    })) {
        return 'center';
    }
    if (isPiontInRect(pos, {
        left: area.left - halfHotSize,
        top: area.top + halfHotSize,
        width: hotSize,
        height: area.height - hotSize
    })) {
        return 'left';
    }
    if (isPiontInRect(pos, {
        left: (area.left + area.width) - halfHotSize,
        top: area.top + halfHotSize,
        width: hotSize,
        height: area.height - hotSize
    })) {
        return 'right';
    }
    if (isPiontInRect(pos, {
        left: area.left + halfHotSize,
        top: area.top - halfHotSize,
        width: area.width - hotSize,
        height: hotSize
    })) {
        return 'top';
    }
    if (isPiontInRect(pos, {
        left: area.left + halfHotSize,
        top: (area.top + area.height) - halfHotSize,
        width: area.width - hotSize,
        height: hotSize
    })) {
        return 'bottom';
    }
    if (isPiontInRect(pos, {
        left: area.left - halfHotSize,
        top: area.top - halfHotSize,
        width: hotSize,
        height: hotSize
    })) {
        return 'top-left';
    }
    if (isPiontInRect(pos, {
        left: (area.left + area.width) - halfHotSize,
        top: area.top - halfHotSize,
        width: hotSize,
        height: hotSize
    })) {
        return 'top-right';
    }
    if (isPiontInRect(pos, {
        left: area.left - halfHotSize,
        top: (area.top + area.height) - halfHotSize,
        width: hotSize,
        height: hotSize
    })) {
        return 'bottom-left';
    }
    if (isPiontInRect(pos, {
        left: (area.left + area.width) - halfHotSize,
        top: (area.top + area.height) - halfHotSize,
        width: hotSize,
        height: hotSize
    })) {
        return 'bottom-right';
    }
    return null;
};

/**
 * Range area selector component
 *
 * @public
 * @export
 * @class AreaSelector
 * @extends {Component}
 */
export default class AreaSelector extends Component {
    /**
     * Property default values
     *
     * @static
     * @memberof AreaSelector
     */
    static defaultProps = {
        onSelectArea: null,
        toolbarStyle: null,
        toolbarHeight: 40,
        style: null,
        toolbar: null,
        img: null
    };

    /**
     * Property types
     *
     * @static
     * @memberof AreaSelector
     */
    static propTypes = {
        onSelectArea: PropTypes.func,
        toolbarStyle: PropTypes.object,
        toolbarHeight: PropTypes.number,
        style: PropTypes.object,
        toolbar: PropTypes.any,
        img: PropTypes.string
    };

    /**
     * Creates an instance of AreaSelector.
     *
     * @public
     * @param {Object} props
     * @memberof AreaSelector
     */
    constructor(props) {
        super(props);

        /**
         * React state
         */
        this.state = {
            select: null,
            resizeable: false,
        };
    }

    /**
     * Set select range
     * 设置选择的范围
     *
     * @param {{left: Number, top: Number, width: Number, height: Number}} select 选择对范围对象
     * @returns {Void}
     * @memberof AreaSelector
     */
    setSelect(select) {
        if (select) {
            select.height = Math.max(0, Math.min(this.contianer.clientHeight, select.height));
            select.width = Math.max(0, Math.min(this.contianer.clientWidth, select.width));

            select.top = Math.max(0, Math.min(this.contianer.clientHeight - select.height, select.top));
            select.left = Math.max(0, Math.min(this.contianer.clientWidth - select.width, select.left));
        }

        if (!this.state.select || (this.state.select && (this.state.select.left !== select.left || this.state.select.top !== select.top || this.state.select.width !== select.width || this.state.select.height !== select.height))) {
            select.x = select.left;
            select.y = select.top;
            this.setState({select});
            return this.props.onSelectArea && this.props.onSelectArea(select);
        }
    }

    /**
     * @private
     */
    handleMouseDown = e => {
        this.mouseDownPos = {left: e.clientX, top: e.clientY};
        this.mouseDownSelect = Object.assign({}, this.state.select);
        if (this.state.resizeable) {
            this.mouseActionPosition = caculatePosition(this.mouseDownPos, this.mouseDownSelect);
        }
    }

    /**
     * @private
     */
    handleMouseMove = e => {
        if (this.mouseDownPos) {
            this.mouseMovePos = {left: e.clientX, top: e.clientY};
            if (!this.state.resizeable) {
                this.setSelect({
                    left: Math.min(this.mouseDownPos.left, this.mouseMovePos.left),
                    top: Math.min(this.mouseDownPos.top, this.mouseMovePos.top),
                    width: Math.abs(this.mouseMovePos.left - this.mouseDownPos.left),
                    height: Math.abs(this.mouseMovePos.top - this.mouseDownPos.top),
                });
            } else {
                const select = this.state.select;
                if (select) {
                    const position = this.mouseActionPosition;
                    const deltaX = this.mouseMovePos.left - this.mouseDownPos.left;
                    const deltaY = this.mouseMovePos.top - this.mouseDownPos.top;
                    let newSelect = null;

                    switch (position) {
                    case 'center':
                        newSelect = {
                            top: this.mouseDownSelect.top + deltaY,
                            left: this.mouseDownSelect.left + deltaX,
                            width: select.width,
                            height: select.height
                        };
                        break;
                    case 'left':
                        newSelect = {
                            top: select.top,
                            left: this.mouseDownSelect.left + deltaX,
                            width: this.mouseDownSelect.width - deltaX,
                            height: select.height
                        };
                        break;
                    case 'right':
                        newSelect = {
                            top: select.top,
                            left: select.left,
                            width: this.mouseDownSelect.width + deltaX,
                            height: select.height
                        };
                        break;
                    case 'top':
                        newSelect = {
                            top: this.mouseDownSelect.top + deltaY,
                            left: select.left,
                            width: select.width,
                            height: this.mouseDownSelect.height - deltaY
                        };
                        break;
                    case 'bottom':
                        newSelect = {
                            top: select.top,
                            left: select.left,
                            width: select.width,
                            height: this.mouseDownSelect.height + deltaY
                        };
                        break;
                    case 'top-left':
                        newSelect = {
                            top: this.mouseDownSelect.top + deltaY,
                            left: this.mouseDownSelect.left + deltaX,
                            width: this.mouseDownSelect.width - deltaX,
                            height: this.mouseDownSelect.height - deltaY
                        };
                        break;
                    case 'top-right':
                        newSelect = {
                            top: this.mouseDownSelect.top + deltaY,
                            left: select.left,
                            width: this.mouseDownSelect.width + deltaX,
                            height: this.mouseDownSelect.height - deltaY
                        };
                        break;
                    case 'bottom-left':
                        newSelect = {
                            top: select.top,
                            left: this.mouseDownSelect.left + deltaX,
                            width: this.mouseDownSelect.width - deltaX,
                            height: this.mouseDownSelect.height + deltaY
                        };
                        break;
                    case 'bottom-right':
                        newSelect = {
                            top: select.top,
                            left: select.left,
                            width: this.mouseDownSelect.width + deltaX,
                            height: this.mouseDownSelect.height + deltaY
                        };
                        break;
                    }
                    if (newSelect) {
                        this.setSelect(newSelect);
                    }
                }
            }
        }
    }

    /**
     * @private
     */
    handleMouseUp = () => {
        this.mouseDownPos = null;
        if (!this.state.resizeable && this.state.select) {
            this.setState({resizeable: true});
        }
    }

    /**
     * React render
     *
     * @returns
     * @memberof AreaSelector
     */
    render() {
        const STYLE = {
            main: {
                backgroundColor: 'rgba(0,0,0,0.2)',
            },
            controller: {
                position: 'absolute',
                backgroundColor: 'rgba(255,255,255,0.4)',
                cursor: 'move',
                boxSizing: 'border-box',
                backgroundRepeat: 'none'
            },
            controlBase: {
                position: 'absolute',
                width: 6,
                height: 6,
                border: '1px solid #fff',
                borderRadius: 1,
                background: 'rgba(0, 0, 0, 0.6)',
            },
            controls: {
                left: {
                    left: -4,
                    top: '50%',
                    marginTop: -3,
                    cursor: 'w-resize',
                },
                top: {
                    top: -4,
                    left: '50%',
                    marginLeft: -3,
                    cursor: 'n-resize',
                },
                right: {
                    right: -4,
                    top: '50%',
                    marginTop: -3,
                    cursor: 'e-resize',
                },
                bottom: {
                    bottom: -4,
                    left: '50%',
                    marginLeft: -3,
                    cursor: 's-resize',
                },
                'top-left': {
                    left: -4,
                    top: -4,
                    cursor: 'nw-resize',
                },
                'top-right': {
                    right: -4,
                    top: -4,
                    cursor: 'ne-resize',
                },
                'bottom-left': {
                    left: -4,
                    bottom: -4,
                    cursor: 'sw-resize',
                },
                'bottom-right': {
                    right: -4,
                    bottom: -4,
                    cursor: 'se-resize',
                },
            }
        };

        let {
            toolbar,
            toolbarHeight,
            style,
            toolbarStyle,
            img,
            onSelectArea,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        if (!this.state.resizeable) {
            Object.assign(style, {cursor: 'crosshair'});
        }

        const controllerStyle = Object.assign({backgroundImage: img ? (`url("${img}")`) : 'none'}, STYLE.controller);
        if (this.state.select) {
            Object.assign(controllerStyle, {left: this.state.select.left, top: this.state.select.top, width: this.state.select.width, height: this.state.select.height, backgroundPositionX: -this.state.select.left - 1, backgroundPositionY: -this.state.select.top - 1});
        } else {
            Object.assign(controllerStyle, {display: 'none'});
        }

        let controls = null;
        if (this.state.resizeable && this.state.select) {
            controls = Object.keys(STYLE.controls).map(key => {
                const controlStyle = Object.assign({}, STYLE.controlBase, STYLE.controls[key]);
                return <div key={key} style={controlStyle} />;
            });
        }

        toolbarStyle = Object.assign({position: 'absolute', right: 0}, toolbarStyle);
        if (this.state.select && this.contianer && (this.state.select.top + this.state.select.height + toolbarHeight) < this.contianer.clientHeight) {
            toolbarStyle.top = '100%';
        } else {
            toolbarStyle.bottom = 0;
        }

        return (<div
            {...other}
            ref={e => {this.contianer = e;}}
            style={style}
            onMouseUp={this.handleMouseUp}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
        >
            <div style={controllerStyle} className="ants-border">
                {controls}
                <div style={toolbarStyle}>{toolbar}</div>
            </div>
        </div>);
    }
}
