import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Input, Label } from 'reactstrap';
import { FaSistrix } from 'react-icons/fa';
import DetailLoader from '../Loader/DetailLoader';

class Pane extends Component {
    static propTypes = {
        staticItemList: PropTypes.array.isRequired,
        valueKey: PropTypes.string.isRequired,
        labelKey: PropTypes.string.isRequired,
        onAction: PropTypes.func.isRequired,
        paneLabel: PropTypes.string.isRequired,
        height: PropTypes.number.isRequired,
        paneClassName: PropTypes.string.isRequired,
        paneId: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        minValueLength: PropTypes.number,
        showSearch: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool,
        selectAllBtn: PropTypes.bool.isRequired,
        selectAllBtnValue: PropTypes.string.isRequired,
        defaultContent: PropTypes.node.isRequired,
    }

    static defaultProps = {
        isLoading: false,
        minValueLength: 0,
    }

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
        };
    }

    staticItemList = () => {
        const { labelKey, staticItemList, showSearch, minValueLength } = this.props;
        const { searchText } = this.state;

        if (showSearch && searchText.length >= minValueLength) {
            return staticItemList ? staticItemList.filter(item => String(item[labelKey]).toLowerCase().includes(searchText.toLowerCase())) : [];
        }

        if (!showSearch) return staticItemList;

        return [];
    }

    renderListItemButton = (value, items) => (
        <Button
            className="picklist__list-btn w-100 border-0 rounded-0 text-left"
            onClick={ () => this.props.onAction(items) }>
            { value }
        </Button>
    )

    render() {
        const {
            valueKey,
            labelKey,
            height,
            paneLabel,
            paneClassName,
            paneId,
            placeholder,
            showSearch,
            selectAllBtn,
            selectAllBtnValue,
        } = this.props;

        const listItems = this.staticItemList();
        const innerDivStyle = {
            height,
        };

        return (
            <div className={ `picklist-pane ${paneClassName} border border-primary rounded pt-2 w-50` }>
                <div style={ innerDivStyle } className="picklist-pane__inner d-flex flex-column">
                    { showSearch && (
                        <div>
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
                                    onChange={ e => this.setState({ searchText: e.target.value }) } />
                            </div>
                        </div>
                    ) }
                    { !showSearch && <h4 className="mb-2 font-weight-bold">{ paneLabel }</h4> }
                    { this.props.isLoading && <div className="container-fluid py-3"><DetailLoader centered /></div> }
                    { !this.props.isLoading && !listItems.length && this.props.defaultContent }
                    { !this.props.isLoading && (
                        <ul className="picklist__list pl-0">
                            { listItems.length > 1 && selectAllBtn && (
                                <li>
                                    { this.renderListItemButton(selectAllBtnValue, listItems) }
                                </li>
                            )}
                            { listItems.map(option => (
                                <li key={ option[valueKey] }>
                                    { this.renderListItemButton(option[labelKey], [option]) }
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
