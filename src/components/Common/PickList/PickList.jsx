import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash-es';

import Pane from './Pane';
import './Picklist.scss';

class PickList extends Component {
    static propTypes = {
        staticItemList: PropTypes.array.isRequired,
        minValueLength: PropTypes.number.isRequired,
        valueKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
        labelKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
        onChange: PropTypes.func,
        height: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
        secondPaneHeight: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
        width: PropTypes.string,
        isLoading: PropTypes.bool,
        selectedValues: PropTypes.array,
        selectBtnLabel: PropTypes.string,
        RemoveBtnLabel: PropTypes.string,
        deselectRoutes: PropTypes.bool,

        leftPanelDefaultContent: PropTypes.node,
        leftPanelSelectAllBtn: PropTypes.bool,
        leftPanelSelectAllBtnValue: PropTypes.string,
        leftPanelShowSearch: PropTypes.bool,
        leftPaneLabel: PropTypes.string,
        leftPaneClassName: PropTypes.string,
        leftPanePlaceholder: PropTypes.string,

        rightPanelDefaultContent: PropTypes.node,
        rightPanelSelectAllBtn: PropTypes.bool,
        rightPanelSelectAllBtnValue: PropTypes.string,
        rightPanelShowSearch: PropTypes.bool,
        rightPaneLabel: PropTypes.string,
        rightPaneClassName: PropTypes.string,
        rightPanePlaceholder: PropTypes.string,
        rightPaneShowCheckbox: PropTypes.bool,

        isVerticalLayout: PropTypes.bool,
    }

    static defaultProps = {
        valueKey: undefined,
        labelKey: undefined,
        onChange: () => {},
        height: 300,
        secondPaneHeight: 300,
        width: 'w-50',
        isLoading: false,
        selectedValues: [],
        deselectRoutes: false,

        leftPanelDefaultContent: false,
        leftPanelSelectAllBtn: false,
        leftPanelSelectAllBtnValue: '',
        leftPanelShowSearch: true,
        leftPaneLabel: '',
        leftPaneClassName: '',
        leftPanePlaceholder: 'Search',

        rightPanelDefaultContent: false,
        rightPanelSelectAllBtn: false,
        rightPanelSelectAllBtnValue: '',
        rightPanelShowSearch: true,
        rightPaneLabel: 'Items',
        rightPaneClassName: '',
        rightPanePlaceholder: 'Search',
        rightPaneShowCheckbox: true,

        isVerticalLayout: false,

        selectBtnLabel: 'Select',
        RemoveBtnLabel: 'Remove',

    }

    constructor(props) {
        super(props);

        this.state = {
            picklistSelectedValues: props.selectedValues,
            pickListClasses: 'picklist w-100',
        };
    }

    componentDidMount() {
        this.setLayout();
    }

    componentDidUpdate(prevProps) {
        if (this.props.deselectRoutes && this.props.deselectRoutes !== prevProps.deselectRoutes) {
            this.updateSelectedValues();
        }

        if (!isEqual(this.props.selectedValues, prevProps.selectedValues)) {
            this.setSelectedValuesPickedExternally();
        }
    }

    updateSelectedValues = () => {
        this.setState({
            picklistSelectedValues: [],
        });
    }

    setSelectedValuesPickedExternally = () => {
        this.setState({
            picklistSelectedValues: this.props.selectedValues,
        });
    }

    add = (items) => {
        const { valueKey } = this.props;
        this.setState((prevState) => {
            const values = [...prevState.picklistSelectedValues];
            items.forEach((option) => {
                const found = values.find(o => o[valueKey || option.valueKey] === option[valueKey || option.valueKey]);
                if (!found) values.push(option);
            });
            this.props.onChange(values);
            return {
                picklistSelectedValues: values,
            };
        });
    }

    remove = (items) => {
        const { valueKey } = this.props;
        this.setState((prevState) => {
            const values = [...prevState.picklistSelectedValues];
            const keys = items.map(opt => opt[valueKey || opt.valueKey]);
            keys.forEach((key) => {
                const index = values.map(o => o[valueKey || o.valueKey]).indexOf(key);
                if (index > -1) values.splice(index, 1);
            });
            this.props.onChange(values);
            return {
                picklistSelectedValues: values,
            };
        });
    }

    getAvailableOptions = () => {
        const { staticItemList, valueKey } = this.props;
        return staticItemList.filter(option => this.state.picklistSelectedValues.find(v => v[valueKey || option.valueKey] === option[valueKey || option.valueKey]) === undefined);
    }

    setLayout = () => {
        if (!this.props.isVerticalLayout) {
            this.setState(prevState => ({ pickListClasses: `${prevState.pickListClasses} d-flex` }));
        }
    }

    showSecondPane = () => !this.props.isVerticalLayout || (this.props.isVerticalLayout && this.state.picklistSelectedValues.length > 0);

    render() {
        return (
            <section className={ this.state.pickListClasses }>
                <Pane
                    actionBtnLabel={ this.props.selectBtnLabel }
                    actionElement="Add all"
                    defaultContent={ this.props.leftPanelDefaultContent }
                    height={ this.props.height }
                    isVerticalLayout={ this.props.isVerticalLayout }
                    labelKey={ this.props.labelKey }
                    minValueLength={ this.props.minValueLength }
                    onAction={ items => this.add(items) }
                    onChange={ items => this.onChange(items) }
                    paneClassName={ this.props.leftPaneClassName }
                    paneId="picklist__pane-left"
                    paneLabel={ this.props.leftPaneLabel }
                    panelId="left-pane"
                    placeholder={ this.props.leftPanePlaceholder }
                    selectAllBtn={ this.props.leftPanelSelectAllBtn }
                    selectAllBtnValue={ this.props.leftPanelSelectAllBtnValue }
                    showSearch={ this.props.leftPanelShowSearch }
                    staticItemList={ this.getAvailableOptions() }
                    width={ this.props.width }
                    valueKey={ this.props.valueKey } />
                {this.showSecondPane() && (
                    <Pane
                        actionBtnLabel={ this.props.RemoveBtnLabel }
                        actionElement="Remove all"
                        defaultContent={ this.props.rightPanelDefaultContent }
                        height={ this.props.secondPaneHeight }
                        isContentLoading={ this.props.isLoading }
                        isVerticalLayout={ this.props.isVerticalLayout }
                        labelKey={ this.props.labelKey }
                        onAction={ items => this.remove(items) }
                        paneClassName={ this.props.rightPaneClassName }
                        paneId="picklist__pane-right"
                        panelId="right-pane"
                        paneLabel={ this.props.rightPaneLabel }
                        placeholder={ this.props.rightPanePlaceholder }
                        staticItemList={ this.state.picklistSelectedValues }
                        selectAllBtn={ this.props.rightPanelSelectAllBtn }
                        selectAllBtnValue={ this.props.rightPanelSelectAllBtnValue }
                        showSearch={ this.props.rightPanelShowSearch }
                        width={ this.props.width }
                        valueKey={ this.props.valueKey }
                        showCheckbox={ this.props.rightPaneShowCheckbox } />
                )}
            </section>
        );
    }
}

export default PickList;
