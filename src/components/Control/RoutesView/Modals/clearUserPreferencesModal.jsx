import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';

import { mergeRouteFilters } from '../../../../redux/actions/control/routes/filters';
import { BUS_TYPE_ID } from '../../../../types/vehicle-types';
import { getDefaultRoutesTripsDatagridConfig } from '../../../../redux/selectors/datagrid';
import { updateRoutesTripsDatagridConfig } from '../../../../redux/actions/datagrid';
import { DEFAULT_ROUTES_TRIPS_DATAGRID_CONFIG } from '../../../../redux/reducers/datagrid';

const ClearUserPreferencesModal = (props) => {
    const clearPreferences = () => {
        const { columns } = props.defaultRoutesTripsDatagridConfig;
        props.mergeRouteFilters({ routeType: BUS_TYPE_ID, agencyId: '', depotsIds: [] }, false, false, true);
        props.updateRoutesTripsDatagridConfig({ ...DEFAULT_ROUTES_TRIPS_DATAGRID_CONFIG, columns }, true);
        props.onClose();
    };

    return (
        <div className={ props.className }>
            <div className="row">
                <div className="col text-center">
                    <h3>Are you sure you want to clear your user preferences?</h3>
                    <div>
                        <span className="d-block mt-3 mb-2">
                            By confirming this action, the configurations, such as filters applied on the tab, will be cleared.
                        </span>
                    </div>
                </div>
            </div>
            <footer className="row justify-content-between mt-3">
                <div className="col">
                    <Button
                        aria-label="keep changes"
                        className="btn btn-block cc-btn-secondary"
                        onClick={ props.onClose }>
                        Keep changes
                    </Button>
                </div>
                <div className="col">
                    <Button
                        className="btn btn-block cc-btn-primary btn-block"
                        aria-label="clear my preferences"
                        onClick={ clearPreferences }>
                        Clear my preferences
                    </Button>
                </div>
            </footer>
        </div>
    );
};

ClearUserPreferencesModal.propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func,
    mergeRouteFilters: PropTypes.func.isRequired,
    updateRoutesTripsDatagridConfig: PropTypes.func.isRequired,
    defaultRoutesTripsDatagridConfig: PropTypes.object.isRequired,
};

ClearUserPreferencesModal.defaultProps = {
    className: '',
    onClose: () => {},
};

export default connect(state => ({
    defaultRoutesTripsDatagridConfig: getDefaultRoutesTripsDatagridConfig(state),
}), { mergeRouteFilters, updateRoutesTripsDatagridConfig })(ClearUserPreferencesModal);
