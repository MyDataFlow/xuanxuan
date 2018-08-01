import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import Icon from './icon';
import Lang from '../lang';

class Pager extends PureComponent {
    static propTypes = {
        page: PropTypes.number,
        recTotal: PropTypes.number,
        recPerPage: PropTypes.number,
        pageRecCount: PropTypes.number,
        className: PropTypes.string,
        onPageChange: PropTypes.func,
    };

    static defaultProps = {
        page: 1,
        recTotal: 0,
        recPerPage: 20,
        onPageChange: null,
        className: null,
        pageRecCount: 0,
    };

    handlePrevBtnClick = () => {
        if (this.props.page > 1) {
            this.props.onPageChange(this.props.page - 1);
        }
    }

    handleNextBtnClick = () => {
        if (this.props.page < this.totalPage) {
            this.props.onPageChange(this.props.page + 1);
        }
    }

    render() {
        const {
            page,
            className,
            recTotal,
            pageRecCount,
            recPerPage,
            onPageChange,
            ...other
        } = this.props;

        this.totalPage = Math.ceil(recTotal / recPerPage);

        return (<div {...other} className={HTML.classes('pager flex flex-middle', className)}>
            <div className="hint--bottom" data-hint={Lang.string('pager.prev')}>
                <button disabled={page <= 1} type="button" className="iconbutton btn rounded" onClick={this.handlePrevBtnClick}><Icon name="chevron-left" /></button>
            </div>
            {recTotal ? <div className="hint--bottom" data-hint={((page - 1) * recPerPage + 1) + ' ~ ' + Math.min(recTotal, (page - 1) * recPerPage + pageRecCount) + ' / ' + recTotal}><strong>{page}</strong> / <strong>{this.totalPage}</strong></div> : null}
            <div className="hint--bottom" data-hint={Lang.string('pager.next')}>
                <button disabled={page >= this.totalPage} type="button" className="iconbutton btn rounded" onClick={this.handleNextBtnClick}><Icon name="chevron-right" /></button>
            </div>
        </div>);
    }
}

export default Pager;
