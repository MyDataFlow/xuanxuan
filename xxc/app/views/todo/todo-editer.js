import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import StringHelper from '../../utils/string-helper';
import DateHelper from '../../utils/date-helper';
import Lang from '../../lang';
import replaceViews from '../replace-views';
import InputControl from '../../components/input-control';
import SelectBox from '../../components/select-box';
import Button from '../../components/button';
import App from '../../core';

const timeToInt = time => {
    if (time) {
        const timeNums = time.split(':').map(x => {
            return Number.parseInt(x, 10);
        });
        return (timeNums[0] * 60) + timeNums[1];
    }
    return 0;
};

class TodoEditor extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        defaultTodo: PropTypes.object,
        onRequestClose: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        defaultTodo: null,
        onRequestClose: null,
    };

    static get TodoEditor() {
        return replaceViews('todo/todo-editor', TodoEditor);
    }

    constructor(props) {
        super(props);
        this.state = {
            todo: props.defaultTodo || {},
            loading: false,
            errorMessage: '',
            errorControl: ''
        };
        if (!this.state.todo.date) {
            this.state.todo.date = DateHelper.formatDate(new Date(), 'yyyy-MM-dd');
        }
    }

    handleTodoChange(name, val) {
        const {todo, errorControl} = this.state;
        todo[name] = val;
        const newState = {todo: Object.assign({}, todo), errorMessage: ''};
        if (name === errorControl) {
            newState.errorControl = '';
        }
        this.setState(newState);
    }

    checkTodo() {
        const {todo} = this.state;
        if (StringHelper.isEmpty(todo.name)) {
            this.setState({errorControl: 'name', errorMessage: Lang.format('common.requiredField.format', Lang.string('todo.label.name'))});
            return false;
        }
        if (StringHelper.isEmpty(todo.date)) {
            this.setState({errorControl: 'date', errorMessage: Lang.format('common.requiredField.format', Lang.string('todo.label.date'))});
            return false;
        }
        const isBeginEmpty = StringHelper.isEmpty(todo.begin);
        const isEndEmpty = StringHelper.isEmpty(todo.end);
        if (isBeginEmpty !== isEndEmpty) {
            this.setState({errorControl: isBeginEmpty ? 'begin' : 'end', errorMessage: Lang.string('todo.beginAndEndBothRequired')});
            return false;
        }
        if (!isBeginEmpty && !isEndEmpty) {
            const beginVal = timeToInt(todo.begin);
            const endVal = timeToInt(todo.end);
            console.log('>', beginVal, todo.begin, endVal, todo.end, endVal < beginVal);
            if (endVal < beginVal) {
                this.setState({errorControl: 'end', errorMessage: Lang.string('todo.beginMustBeforeEnd')});
                return false;
            }
        }
        return true;
    }

    handleSubmitBtnClick = () => {
        if (this.checkTodo()) {
            this.setState({loading: true}, () => {
                const {todo} = this.state;
                App.todo.createTodo(todo).then(newTodo => {
                    const state = {loading: false};
                    if (newTodo && newTodo.id) {
                        App.ui.showMessger(Lang.string('todo.createSuccess'), {type: 'success'});
                        if (this.props.onRequestClose) {
                            this.props.onRequestClose();
                        }
                    } else {
                        state.errorMessage = Lang.error('COMMON_ERROR');
                    }
                    this.setState(state);
                });
            });
        }
    };

    render() {
        const {
            className,
            defaultTodo,
            onRequestClose,
            ...other
        } = this.props;

        const {todo, loading, errorMessage, errorControl} = this.state;

        return (<div
            {...other}
            className={HTML.classes('app-todo-editor relative load-indicator has-padding-v', className, {loading, disabled: loading})}
        >
            {errorMessage ? <div className="box red rounded space-sm">{errorMessage}</div> : null}
            <InputControl
                className={errorControl === 'name' ? 'has-error' : ''}
                value={todo.name}
                label={Lang.string('todo.label.name')}
                autoFocus
                placeholder={Lang.string('common.required')}
                onChange={this.handleTodoChange.bind(this, 'name')}
            />
            <div className={`control${errorControl === 'desc' ? ' has-error' : ''}`}>
                <label>{Lang.string('todo.label.desc')}</label>
                <textarea
                    className="textarea rounded"
                    rows="10"
                    value={todo.desc}
                    placeholder={`${Lang.string('todo.label.desc')} (${Lang.string('todo.input.desc.hint')})`}
                    onChange={e => this.handleTodoChange('desc', e.target.value)}
                />
            </div>
            <div className="row gutter-sm">
                <div className="cell">
                    <div className="control">
                        <label>{Lang.string('todo.label.pri')}</label>
                        <SelectBox value={todo.pri} options={[1, 2, 3, 4, '']} onChange={this.handleTodoChange.bind(this, 'pri')} />
                    </div>
                </div>
                <div className="cell">
                    <InputControl
                        className={errorControl === 'date' ? 'has-error' : ''}
                        inputType="date"
                        value={todo.date}
                        label={Lang.string('todo.label.date')}
                        placeholder={Lang.string('todo.label.date') + Lang.string('common.required')}
                        onChange={this.handleTodoChange.bind(this, 'date')}
                    />
                </div>
                <div className="cell">
                    <div className="row">
                        <div className="cell">
                            <InputControl
                                className={errorControl === 'begin' ? 'has-error' : ''}
                                inputType="time"
                                value={todo.begin}
                                label={Lang.string('todo.label.begin')}
                                onChange={this.handleTodoChange.bind(this, 'begin')}
                            />
                        </div>
                        <div className="cell">
                            <InputControl
                                className={errorControl === 'end' ? 'has-error' : ''}
                                inputType="time"
                                value={todo.end}
                                label={Lang.string('todo.label.end')}
                                onChange={this.handleTodoChange.bind(this, 'end')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="has-padding-v toolbar">
                <Button className="primary btn-wide" label={Lang.string('common.confirm')} onClick={this.handleSubmitBtnClick} /> &nbsp;
                <Button className="primary-pale text-primary btn-wide" label={Lang.string('common.cancel')} onClick={onRequestClose} />
            </div>
        </div>);
    }
}

export default TodoEditor;
