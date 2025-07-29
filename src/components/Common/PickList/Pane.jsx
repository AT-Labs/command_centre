import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash-es';

import { Button, Input, Label } from 'reactstrap';
import { FaSistrix } from 'react-icons/fa';
import { AiFillCloseCircle } from 'react-icons/ai';
import DetailLoader from '../Loader/DetailLoader';
import TripIcon from '../../Control/Common/Trip/TripIcon';
import Icon from '../Icon/Icon';

class Pane extends Component {
    static propTypes = {
        defaultContent: PropTypes.node.isRequired,
        height: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]).isRequired,
        isLoading: PropTypes.bool,
        isContentLoading: PropTypes.bool,
        labelKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
        minValueLength: PropTypes.number,
        onAction: PropTypes.func.isRequired,
        paneClassName: PropTypes.string.isRequired,
        paneId: PropTypes.string.isRequired,
        paneLabel: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        selectAllBtn: PropTypes.bool.isRequired,
        selectAllBtnValue: PropTypes.string.isRequired,
        showCheckbox: PropTypes.bool,
        showSearch: PropTypes.bool.isRequired,
        staticItemList: PropTypes.array.isRequired,
        valueKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
        width: PropTypes.string,
        isVerticalLayout: PropTypes.bool,
    };

    static defaultProps = {
        isLoading: false,
        isContentLoading: false,
        minValueLength: 0,
        width: 'w-50',
        isVerticalLayout: false,
        showCheckbox: true,
        labelKey: undefined,
        valueKey: undefined,
    };

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
            height: this.props.height,
        };
    }

    staticItemList = () => {
        const { labelKey, staticItemList, showSearch, minValueLength } = this.props;
        const { searchText } = this.state;
        if (showSearch && searchText.length >= minValueLength) {
            return staticItemList ? staticItemList.filter(item => String(item[labelKey || item.labelKey]).toLowerCase().includes(searchText.toLowerCase())) : [];
        }

        if (!showSearch) {
            return staticItemList;
        }

        return [];
    };

    renderListItemButton = (value, items) => {
        const { isVerticalLayout, showCheckbox } = this.props;
        if (!showCheckbox && isVerticalLayout) {
            return (
                <div className="picklist__list-btn w-100 border-0 rounded-0 text-left mb-2">
                    { this.renderIcon(items[0].type, items[0].routeType) }
                    { value }
                    <Button
                        className="btn cc-btn-link float-right p-0"
                        onClick={ () => this.onAction(items) }
                        disabled={ this.props.isContentLoading }
                    >
                        Deselect
                    </Button>
                </div>
            );
        }
        if (isVerticalLayout) {
            return (
                <div className="picklist__list-btn w-100 border-0 rounded-0 text-left mb-2">
                    { value }
                    <input
                        className="ml-0 mr-3 float-right position-relative picklist__checkbox"
                        onChange={ () => this.onAction(items) }
                        type="checkbox" />
                </div>
            );
        }
        return (
            <Button
                className="picklist__list-btn w-100 border-0 rounded-0 text-left"
                onClick={ () => this.props.onAction(items) }>
                { value }
            </Button>
        );
    };

    renderIcon = (entityType, iconType) => (
        <>
            { entityType === 'route'
                && <TripIcon type={ iconType } className="picklist__list-btn__vehicle-icon" />}
            { entityType === 'stop'
                && (
                    <div className="trip-icon">
                        <Icon icon="bus-stop" className="picklist__list-btn__vehicle-icon" />
                    </div>
                )}
        </>
    );

    onChange = (e) => {
        this.setState({ searchText: e.target.value });
    };

    onAction = (items) => {
        this.props.onAction(items);
    };

    onCleanSearch = () => {
        this.setState({ searchText: '' });
    };

    render() {
        const {
            valueKey,
            labelKey,
            paneLabel,
            paneClassName,
            paneId,
            placeholder,
            showSearch,
            selectAllBtn,
            selectAllBtnValue,
            width,
        } = this.props;

        const listItems = this.staticItemList();
        const innerDivStyle = {
            height: this.state.height,
        };

        return (
            <div className={ `picklist-pane ${paneClassName} border border-primary rounded pt-2 ${width}` }>
                <div style={ innerDivStyle } className="picklist-pane__inner d-flex flex-column">
                    { showSearch && (
                        <div className="picklist-pane__search-container">
                            <Label for={ paneId } className="pl-1 font-weight-bold">{ paneLabel }</Label>
                            <div className="position-relative px-1 pb-3">
                                <FaSistrix
                                    className="picklist__icon text-secondary position-absolute mt-2 ml-2"
                                    size={ 20 } />
                                <Input
                                    type="text"
                                    id={ paneId }
                                    className="picklist__input form-control cc-form-control w-100 pl-5 pr-3"
                                    placeholder={ placeholder }
                                    value={ this.state.searchText }
                                    onChange={ e => this.onChange(e) } />
                                {!isEmpty(this.state.searchText)
                                    && (
                                        <Button
                                            className="position-absolute picklist__close-button"
                                            onClick={ this.onCleanSearch }>
                                            <AiFillCloseCircle
                                                className="picklist__icon-close position-absolute"
                                                size={ 20 } />
                                        </Button>
                                    )}
                            </div>
                        </div>
                    ) }
                    { !showSearch && <h3 className="mt-2 mb-2 font-weight-bold">{ paneLabel }</h3> }
                    { this.props.isLoading && <div className="container-fluid py-3"><DetailLoader centered /></div> }
                    { !this.props.isLoading && !listItems.length && this.props.defaultContent }
                    { !this.props.isLoading && (
                        <ul className="picklist__list pl-0 pt-4">
                            { listItems.length > 1 && selectAllBtn && (
                                <li className="mb-1">
                                    { this.renderListItemButton(selectAllBtnValue, listItems) }
                                </li>
                            )}
                            { listItems.map(option => (
                                <li key={ option[valueKey || option.valueKey] }>
                                    { this.renderListItemButton(option[labelKey || option.labelKey], [option]) }
                                </li>
                            )) }
                        </ul>
                    ) }
                </div>
            </div>
        );
    }
}

export default Pane;
