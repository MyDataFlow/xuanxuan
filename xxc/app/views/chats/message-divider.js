import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import DateHelper from '../../utils/date-helper';
import Lang from '../../lang';
import replaceViews from '../replace-views';

class MessageDivider extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.any,
        date: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        date: null,
        children: null,
    };

    static get MessageDivider() {
        return replaceViews('chats/message-divider', MessageDivider);
    }

    render() {
        const {
            date,
            className,
            children,
            ...other
        } = this.props;

        let dateStr = null;
        if (date) {
            dateStr = DateHelper.formatDate(date, 'YYYY-M-d');
            if (DateHelper.isToday(date)) {
                dateStr = `${Lang.string('time.today')} ${dateStr}`;
            } else if (DateHelper.isYestoday(date)) {
                dateStr = `${Lang.string('time.yestoday')} ${dateStr}`;
            }
        }

        return (<div className={HTML.classes('app-message-divider', className)} {...other}>
            <div className="content">{dateStr}{children}</div>
        </div>);
    }
}

export default MessageDivider;
