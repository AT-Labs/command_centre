import inView from 'in-view';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { Expandable, ExpandableContent, ExpandableSummary } from '../../../Common/Expandable';

export class ControlTableRow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
        };

        this.summaryRef = React.createRef();
    }

    static getDerivedStateFromProps(props, currentState) {
        const { row, rowActive, isFocused } = props;
        let { isActive } = currentState;

        if (rowActive instanceof Function) {
            isActive = rowActive(row);
        } else {
            isActive = rowActive;
        }

        return { isActive, isFocused };
    }

    isRowFocused = state => (state.isFocused != null ? (state.isActive && state.isFocused) : state.isActive);

    componentDidUpdate(prevProps, prevState) {
        if (!this.isRowFocused(prevState) && this.isRowFocused(this.state)) this.scrollIntoView();
    }

    componentDidMount() {
        if (this.isRowFocused(this.state)) this.scrollIntoView();
    }

    scrollIntoView = () => {
        const summaryElement = this.summaryRef.current;
        inView.threshold(1);
        if (!inView.is(summaryElement)) {
            _.delay(() => summaryElement.scrollIntoView({ block: 'start', behavior: 'smooth' }), 0);
        }
    }

    render() {
        const {
            columns, level, row, rowBody, id, isExpandable, rowClassName,
        } = this.props;

        return isExpandable
            ? (
                <Expandable
                    id={ id }
                    isActive={ this.state.isActive }
                    onToggle={ this.props.rowActive
                        ? () => this.props.rowOnClick(row)
                        : () => this.setState(prevState => ({ isActive: !prevState.isActive }))
                    }
                    level={ level }>
                    <ExpandableSummary className={ rowClassName }>
                        <div className="row" ref={ this.summaryRef }>
                            {
                                _.map(columns, column => (
                                    <div key={ _.uniqueId('control-table-row-cells') } className={ `${column.cols}` }>
                                        { column.getContent ? column.getContent(row, column.key) : _.get(row, column.key)}
                                    </div>
                                ))
                            }
                        </div>
                    </ExpandableSummary>
                    <ExpandableContent>
                        { rowBody }
                    </ExpandableContent>
                </Expandable>
            )
            : (
                <div className={ `standard-row ${rowClassName}` }>
                    <div className="row">
                        {
                            _.map(columns, column => (
                                <div key={ _.uniqueId('control-table-row-cells') } className={ `${column.cols}` }>
                                    { column.getContent ? column.getContent(row, column.key) : _.get(row, column.key)}
                                </div>
                            ))
                        }
                    </div>
                </div>
            );
    }
}

ControlTableRow.propTypes = {
    id: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        key: PropTypes.string.isRequired,
        cols: PropTypes.string.isRequired,
        getContent: PropTypes.func,
    })).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    isFocused: PropTypes.bool,
    isExpandable: PropTypes.bool.isRequired,
    row: PropTypes.object.isRequired,
    rowOnClick: PropTypes.func,
    rowActive: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    rowBody: PropTypes.element,
    rowClassName: PropTypes.string,
    level: PropTypes.number.isRequired,
};

ControlTableRow.defaultProps = {
    rowActive: null,
    rowOnClick: null,
    rowBody: null,
    isFocused: null,
    rowClassName: null,
};

export default ControlTableRow;
