import _ from 'lodash-es';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import classNames from 'classnames';
import { generateUniqueID } from '../../../utils/helpers';
import Loader from '../Loader/Loader';

import './AutoRefreshTable.scss';

const { REACT_APP_DEFAULT_POLLING_PERIOD_MILLISECONDS } = process.env;

export default class AutoRefreshTable extends Component {
    static propTypes = {
        fetchRows: PropTypes.func.isRequired,
        rows: PropTypes.array,

        columns: PropTypes.arrayOf(PropTypes.shape({
            header: PropTypes.string,
            formatter: PropTypes.func,
            headerClassName: PropTypes.string,
            cellClassName: PropTypes.string,
        })).isRequired,

        title: PropTypes.string,
        emptyMessage: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        noteMessage: PropTypes.string,
        isAlternativelyStriped: PropTypes.bool,
        shouldShowHeader: PropTypes.bool,
        onRowClick: PropTypes.func,
        hover: PropTypes.bool,
        clickable: PropTypes.bool,
        refresh: PropTypes.bool,
        pollingInternval: PropTypes.number,
        striped: PropTypes.bool,
        isRowStyled: PropTypes.func,
        rowClassName: PropTypes.string,
    }

    static defaultProps = {
        title: null,
        rows: null,
        noteMessage: null,
        isAlternativelyStriped: false,
        shouldShowHeader: true,
        onRowClick: () => {},
        hover: false,
        clickable: false,
        refresh: true,
        pollingInternval: null,
        striped: true,
        isRowStyled: () => false,
        rowClassName: '',
    }

    componentDidMount = () => {
        const { refresh } = this.props;
        this.props.fetchRows();
        if (refresh) {
            this.intervalHandler = setInterval(() => this.props.fetchRows(), this.props.pollingInternval || REACT_APP_DEFAULT_POLLING_PERIOD_MILLISECONDS);
        }
    }

    componentWillUnmount = () => clearInterval(this.intervalHandler);

    renderTable = (columns, rows) => (
        <Table
            className={
                classNames('table-layout-fixed my-0', {
                    'table--clickable': this.props.clickable,
                    'table--alternatively-striped': this.props.isAlternativelyStriped,
                })
            }
            striped={ this.props.striped }
            borderless
            hover={ this.props.hover }
        >
            { this.props.shouldShowHeader && (
                <thead>
                    <tr>
                        { columns.map((column) => {
                            const { header, headerClassName } = column;
                            return <th key={ header } className={ headerClassName }>{header}</th>;
                        })}
                    </tr>
                </thead>
            )}
            { !_.isEmpty(rows) && (
                <tbody>
                    { rows.map(row => (
                        <tr onClick={ () => this.props.onRowClick(row) }
                            className={
                                classNames('align-items-center', {
                                    [this.props.rowClassName]: this.props.isRowStyled(row),
                                })
                            }
                            key={ generateUniqueID() }>
                            {
                                columns.map(({ formatter, cellClassName }) => (
                                    <td key={ generateUniqueID() }
                                        className={ cellClassName }>{formatter(row)}
                                    </td>
                                ))
                            }
                        </tr>
                    )) }
                </tbody>
            )}
        </Table>
    )

    renderEmptyMessage = (rows, emptyMessage) => rows
        && _.isEmpty(rows)
        && <p className="auto-refresh-table__empty-message col-12 text-muted my-3">{ emptyMessage }</p>;

    renderNoteMessage = (rows, noteMessage) => noteMessage
        && !_.isEmpty(rows)
        && <p className="auto-refresh-table__note-message col-12 text-danger my-3">{ noteMessage }</p>;

    render() {
        const {
            rows, columns, className, title, emptyMessage, noteMessage,
        } = this.props;
        return (
            <section className={ `auto-refresh-table ${className}` }>
                <h4 className="col-12 text-uppercase mb-0">
                    { title }
                </h4>
                {this.renderTable(columns, rows)}
                <h4 className="col-12 text-uppercase mb-0">
                    {!rows && <Loader className="my-3" /> }
                </h4>
                {this.renderNoteMessage(rows, noteMessage)}
                {this.renderEmptyMessage(rows, emptyMessage) }
            </section>
        );
    }
}
