import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import {
    updateFleetsDatagridConfig,
} from '../../../redux/actions/control/fleets';
import { getAllFleets, getFleetsDatagridConfig } from '../../../redux/selectors/control/fleets';
import { dateTimeFormat } from '../../../utils/dateUtils';

export const FleetsView = (props) => {
    const { fleets } = props;
    const parseTime = (date) => {
        if (date) {
            return moment(date).format(dateTimeFormat);
        }
        return '';
    };

    const slfFlag = (value) => {
        if (value) {
            const str = value.toString();
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return '';
    };

    const FLEETS_COLUMNS = [
        { field: 'type', headerName: 'TYPE', width: 100 },
        { field: 'operator_code', headerName: 'OPERATOR CODE', width: 150 },
        { field: 'operator_name', headerName: 'OPERATOR NAME', width: 150 },
        { field: 'depot', headerName: 'DEPOT', width: 100 },
        { field: 'rapid_vehicle_number', headerName: 'RAPID VEHICLE NUMBER', width: 150, hide: true },
        { field: 'vehicle_id', headerName: 'VEHICLE ID', width: 150 },
        { field: 'fleet_number', headerName: 'FLEET NUMBER', width: 150 },
        { field: 'registration_number', headerName: 'REGISTRATION NUMBER', width: 150 },
        { field: 'ptom_vehicle_type', headerName: 'PTOM VEHICLE TYPE', width: 150 },
        { field: 'mmsi', headerName: 'MMSI', width: 100 },
        { field: 'callSign', headerName: 'CALL SIGN', width: 120 },
        { field: 'make_model', headerName: 'MAKE MODEL', width: 150 },
        { field: 'seating_capacity', headerName: 'SEATING CAPACITY', width: 150, hide: true },
        { field: 'standing_capacity', headerName: 'STANDING CAPACITY', width: 150, hide: true },
        { field: 'total_capacity', headerName: 'TOTAL CAPACITY', width: 150, hide: true },
        { field: 'wheel_chair_flag', headerName: 'WHEEL CHAIR FLAG', width: 150, hide: true },
        { field: 'slf_flag', headerName: 'SLF FLAG', width: 150, hide: true },
        { field: 'beId', headerName: 'BEID', width: 150, hide: true },
        { field: 'avl_vendor', headerName: 'AVL Vendor', width: 150 },
        { field: 'activated_machineid', headerName: 'ACTIVATED MACHINE ID', width: 150 },
        { field: 'activated_actionlist', headerName: 'ACTIVATED ACTIONLIST', width: 150 },
        { field: 'activated_dico', headerName: 'ACTIVATED DICO', width: 150 },
        { field: 'activated_fare', headerName: 'ACTIVATED FARE', width: 150 },
        { field: 'activated_time', headerName: 'ACTIVATED TIME', width: 150 },
        { field: 'activated_topo', headerName: 'ACTIVATED TOPO', width: 150 },
        { field: 'activated_timestamp', headerName: 'ACTIVATED TIMESTAMP', width: 150, type: 'date' },
        { field: 'generated_actionlist', headerName: 'GENERATED ACTIONLIST', width: 150 },
        { field: 'generated_dico', headerName: 'GENERATED DICO', width: 150 },
        { field: 'generated_fare', headerName: 'GENERATED FARE', width: 150 },
        { field: 'generated_time', headerName: 'GENERATED TIME', width: 150 },
        { field: 'generated_topo', headerName: 'GENERATED TOPO', width: 150 },
    ];

    const getPageData = () => fleets.map(fleet => ({
        allData: fleet,
        id: fleet.id,
        type: fleet.type.type,
        operator_code: fleet.agency.agencyId,
        operator_name: fleet.agency.agencyName,
        depot: fleet.agency.depot.name,
        rapid_vehicle_number: fleet.vehicle || '',
        vehicle_id: fleet.eod.vehicleId,
        fleet_number: fleet.label,
        registration_number: fleet.registration,
        ptom_vehicle_type: fleet.type.subtype,
        mmsi: fleet.mmsi || '',
        callSign: fleet.callsign || '',
        make_model: fleet.type.makeModel,
        seating_capacity: fleet.capacity.seating,
        standing_capacity: fleet.capacity.standing,
        total_capacity: fleet.capacity.total,
        wheel_chair_flag: fleet.attributes.wheelchair,
        slf_flag: slfFlag(fleet.attributes.loweringFloor),
        beId: fleet.eod.beId,
        avl_vendor: fleet.tag,
        activated_machineid: fleet.eod.activated.machineId || '',
        activated_actionlist: fleet.eod.activated.actionlist || '',
        activated_dico: fleet.eod.activated.dico || '',
        activated_fare: fleet.eod.activated.fare || '',
        activated_time: fleet.eod.activated.time || '',
        activated_topo: fleet.eod.activated.topo || '',
        activated_timestamp: parseTime(fleet.eod.activated.timestamp) || null,
        generated_actionlist: fleet.eod.generated.actionlist || '',
        generated_dico: fleet.eod.generated.dico || '',
        generated_fare: fleet.eod.generated.fare || '',
        generated_time: fleet.eod.generated.time || '',
        generated_topo: fleet.eod.generated.topo || '',
    }));

    return (
        <div className="control-fleets-view">
            <div className="mb-3">
                <h1>Fleet</h1>
            </div>
            <CustomDataGrid
                columns={ FLEETS_COLUMNS }
                datagridConfig={ props.fleetsDatagridConfig }
                dataSource={ getPageData() }
                updateDatagridConfig={ config => props.updateFleetsDatagridConfig(config) }
                rowCount={ fleets.length }
            />
        </div>
    );
};

FleetsView.propTypes = {
    fleets: PropTypes.array,
    fleetsDatagridConfig: PropTypes.object.isRequired,
    updateFleetsDatagridConfig: PropTypes.func.isRequired,
};

FleetsView.defaultProps = {
    fleets: [],
};

export default connect(
    state => ({
        fleets: getAllFleets(state),
        fleetsDatagridConfig: getFleetsDatagridConfig(state),
    }),
    {
        updateFleetsDatagridConfig,
    },
)(FleetsView);
