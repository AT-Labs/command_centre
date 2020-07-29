import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Button } from 'reactstrap';

import Picklist from '../../Common/Picklist/Picklist';
import { getAllRoutes } from '../../../redux/selectors/static/routes';

const SelectRoutesPicklist = (props) => {
    const routesToArray = _.map(props.allRoutes, route => route);
    return (
        <div className="disruption-creation__wizard-select-routes">
            <div className="row my-3">
                <div className="col">
                    <Picklist
                        staticItemList={ routesToArray }
                        selectedValues={ props.data.affectedRoutes }
                        valueKey="route_id"
                        labelKey="route_short_name"
                        onChange={ selectedItem => props.onDataUpdate(selectedItem) }
                        minValueLength={ 1 }
                        leftPaneLabel="Find a route"
                        leftPaneClassName="cc__picklist-pane-left"
                        leftPanePlaceholder="Search for a route"
                        rightPanelShowSearch={ false }
                        rightPaneLabel="Selected routes:"
                        rightPaneClassName="cc__picklist-pane-right" />
                </div>
            </div>
            <footer className="row justify-content-between">
                <div className="col-4">
                    <Button
                        className="btn cc-btn-secondary btn-block"
                        onClick={ () => props.onClose() }>
                        { props.cancelButtonLabel}
                    </Button>
                </div>
                <div className="col-4">
                    <Button
                        disabled={ _.isEmpty(props.data.affectedRoutes) }
                        className="btn cc-btn-secondary btn-block"
                        onClick={ () => props.onSubmit() }>
                        Continue
                    </Button>
                </div>
            </footer>
        </div>
    );
};

SelectRoutesPicklist.propTypes = {
    data: PropTypes.object,
    onDataUpdate: PropTypes.func,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    allRoutes: PropTypes.object.isRequired,
    cancelButtonLabel: PropTypes.string,
};

SelectRoutesPicklist.defaultProps = {
    data: {},
    onClose: () => {},
    onSubmit: () => {},
    onDataUpdate: () => {},
    cancelButtonLabel: 'Cancel and close',
};

export default connect(state => ({
    allRoutes: getAllRoutes(state),
}))(SelectRoutesPicklist);
