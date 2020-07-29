import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';

import Pane from './Pane';
import './Picklist.scss';

class Picklist extends Component {
    static propTypes = {
        staticItemList: PropTypes.array.isRequired,
        minValueLength: PropTypes.number.isRequired,
        valueKey: PropTypes.string,
        labelKey: PropTypes.string,
        onChange: PropTypes.func,
        height: PropTypes.number,
        isLoading: PropTypes.bool,
        selectedValues: PropTypes.array,

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
    }

    static defaultProps = {
        valueKey: 'value',
        labelKey: 'label',
        onChange: _.noop,
        height: 300,
        isLoading: false,
        selectedValues: [],

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
    }

    constructor(props) {
        super(props);

        this.state = {
            picklistSelectedValues: props.selectedValues,
        };
    }

    add = (items) => {
        const { valueKey } = this.props;
        this.setState((prevState) => {
            const values = [...prevState.picklistSelectedValues];
            items.forEach((option) => {
                const found = values.find(o => o[valueKey] === option[valueKey]);
                if (!found) values.push(option);
            });
            this.props.onChange(values);
            return { picklistSelectedValues: values };
        });
    }

    remove = (items) => {
        const { valueKey } = this.props;
        this.setState((prevState) => {
            const values = [...prevState.picklistSelectedValues];
            const keys = items.map(opt => opt[valueKey]);
            keys.forEach((key) => {
                const index = values.map(o => o[valueKey]).indexOf(key);
                if (index > -1) values.splice(index, 1);
            });
            this.props.onChange(values);
            return { picklistSelectedValues: values };
        });
    }

    getAvailableOptions = () => {
        const { staticItemList, valueKey } = this.props;
        return staticItemList.filter(option => this.state.picklistSelectedValues.find(v => v[valueKey] === option[valueKey]) === undefined);
    }

    render() {
        return (
            <section className="picklist d-flex w-100">
                <Pane
                    paneId="picklist__pane-left"
                    paneClassName={ this.props.leftPaneClassName }
                    defaultContent={ this.props.leftPanelDefaultContent }
                    actionElement="Add all"
                    valueKey={ this.props.valueKey }
                    labelKey={ this.props.labelKey }
                    staticItemList={ this.getAvailableOptions() }
                    onAction={ items => this.add(items) }
                    panelId="left-pane"
                    selectAllBtn={ this.props.leftPanelSelectAllBtn }
                    selectAllBtnValue={ this.props.leftPanelSelectAllBtnValue }
                    minValueLength={ this.props.minValueLength }
                    paneLabel={ this.props.leftPaneLabel }
                    height={ this.props.height }
                    showSearch={ this.props.leftPanelShowSearch }
                    placeholder={ this.props.leftPanePlaceholder }
                    isLoading={ this.props.isLoading } />
                <Pane
                    paneId="picklist__pane-right"
                    paneClassName={ this.props.rightPaneClassName }
                    defaultContent={ this.props.rightPanelDefaultContent }
                    actionElement="Remove all"
                    valueKey={ this.props.valueKey }
                    labelKey={ this.props.labelKey }
                    staticItemList={ this.state.picklistSelectedValues }
                    onAction={ items => this.remove(items) }
                    panelId="right-pane"
                    selectAllBtn={ this.props.rightPanelSelectAllBtn }
                    selectAllBtnValue={ this.props.rightPanelSelectAllBtnValue }
                    paneLabel={ this.props.rightPaneLabel }
                    height={ this.props.height }
                    showSearch={ this.props.rightPanelShowSearch }
                    placeholder={ this.props.rightPanePlaceholder } />
            </section>
        );
    }
}

export default Picklist;
