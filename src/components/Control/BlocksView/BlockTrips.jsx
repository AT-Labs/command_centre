import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { updateActiveTrip } from '../../../redux/actions/control/blocks';
import { getActiveTrip } from '../../../redux/selectors/control/blocks';
import { getTripVehiclesDisplay } from '../../../utils/control/blocks';
import { formatTripDelay } from '../../../utils/control/routes';
import { getTripTimeDisplay } from '../../../utils/helpers';
import ButtonBar from '../Common/ButtonBar/ButtonBar';
import ControlTable from '../Common/ControlTable/ControlTable';
import TripDelay from '../Common/Trip/TripDelay';
import AddTripsModal from './BlockModals/AddTripsModal';
import AllocateVehiclesModal from './BlockModals/AllocateVehiclesModal';
import MoveTripsModal from './BlockModals/MoveTripsModal';
import BlockTrip from './BlockTrip';
import { BlockType, TripType } from './types';
import { isIndividualEditBlockPermitted } from '../../../utils/user-permissions';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';

const formatStatusColumn = (row) => {
    const trip = row.tripInstance || row;
    const delay = formatTripDelay(_.get(trip, 'delay', 0));
    const status = _.lowerCase(row.status);
    if (row.status === TRIP_STATUS_TYPES.cancelled) {
        return <span className="text-danger">{status}</span>;
    }
    if (delay !== 0) {
        return (
            <span>
                {status}
                :
                {' '}
                <TripDelay delayInSeconds={ _.get(trip, 'delay', 0) } />
            </span>
        );
    }
    return status;
};

export class BlockTrips extends React.Component {
    static propTypes = {
        activeBlock: BlockType.isRequired,
        activeTrip: TripType,
        updateActiveTrip: PropTypes.func.isRequired,
    };

    static defaultProps = {
        activeTrip: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            checkboxes: {},
            allSelected: false,
            atLeastOneTripSelected: false,
        };

        this.isEditPermitted = IS_LOGIN_NOT_REQUIRED || isIndividualEditBlockPermitted(this.props.activeBlock);
        this.trips = [
            {
                label: () => ( // eslint-disable-line react/no-unstable-nested-components
                    <>
                        {
                            this.isEditPermitted && (
                                <input
                                    type="checkbox"
                                    className="ml-0 mr-3"
                                    checked={ this.state.allSelected }
                                    onChange={ (e) => {
                                        this.setState({
                                            allSelected: e.target.checked,
                                            atLeastOneTripSelected: e.target.checked,
                                        });
                                        this.selectAllCheckboxes(e.target.checked);
                                    } }
                                />
                            )
                        }
                        <span>Trip ID</span>
                    </>
                ),
                key: 'externalRef',
                cols: 'col',
                getContent: (trip, key) => { // eslint-disable-line react/no-unstable-nested-components
                    const { externalRef } = trip;
                    const { checkboxes } = this.state;
                    const isCompleted = trip.status === TRIP_STATUS_TYPES.completed;

                    return (
                        <>
                            {
                                this.isEditPermitted && (
                                    <input
                                        type="checkbox"
                                        name={ externalRef }
                                        className="ml-0 mr-3 bg-danger"
                                        disabled={ isCompleted }
                                        checked={ !isCompleted && checkboxes[externalRef].selected }
                                        onChange={ this.handleCheckboxChange }
                                        key={ externalRef }
                                    />
                                )
                            }
                            { trip[key] }
                        </>
                    );
                },
            },
            {
                label: 'start time',
                key: 'startTime',
                cols: 'col',
                getContent: (trip, key) => getTripTimeDisplay(trip[key]),
            },
            {
                label: 'end time',
                key: 'endTime',
                cols: 'col',
                getContent: (trip, key) => getTripTimeDisplay(trip[key]),
            },
            {
                label: 'status',
                key: 'status',
                cols: 'col',
                getContent: row => formatStatusColumn(row),
            },
            {
                label: 'route',
                key: 'routeShortName',
                cols: 'col',
            },
            {
                label: 'vehicle',
                key: 'vehicles',
                cols: 'col-2',
                getContent: row => getTripVehiclesDisplay(row),
            },
            {
                label: 'description',
                key: 'routeLongName',
                cols: 'col-3 pr-5',
            },
        ];
    }

    static getDerivedStateFromProps(nextProps, currentState) {
        const checkboxes = nextProps.activeBlock.operationalTrips.reduce(
            (trips, trip) => ({
                ...trips,
                [trip.externalRef]: {
                    selected: _.result(currentState.checkboxes, `${trip.externalRef}.selected`, false),
                    tripObj: trip,
                },
            }),
            {},
        );
        const allSelected = !_.isEmpty(checkboxes)
            && _.every(
                checkboxes,
                checkbox => _.get(checkbox, 'selected', false)
                    || (_.get(checkbox, 'tripObj.status') === TRIP_STATUS_TYPES.completed),
            );
        const atLeastOneTripSelected = _.some(checkboxes, 'selected');

        return { checkboxes, allSelected, atLeastOneTripSelected };
    }

    selectAllCheckboxes = (isSelected) => {
        Object.keys(this.state.checkboxes).forEach((tripExtRef) => {
            this.setState(prevState => ({
                checkboxes: {
                    ...prevState.checkboxes,
                    [tripExtRef]: {
                        selected: !(prevState.checkboxes[tripExtRef].tripObj.status === TRIP_STATUS_TYPES.completed) && isSelected,
                        tripObj: prevState.checkboxes[tripExtRef].tripObj,
                    },
                },
            }));
        });
    };

    handleCheckboxChange = (changeEvent) => {
        const { name } = changeEvent.target;

        this.setState(prevState => ({
            checkboxes: {
                ...prevState.checkboxes,
                [name]: {
                    selected: !prevState.checkboxes[name].selected,
                    tripObj: prevState.checkboxes[name].tripObj,
                },
            },
        }), () => {
            let allTripsAreSelected = true;
            let atLeastOneTripSelected = false;
            Object.keys(this.state.checkboxes).forEach((key) => {
                if (!this.state.checkboxes[key].selected) {
                    allTripsAreSelected = false;
                    this.setState({ allSelected: false });
                } else {
                    atLeastOneTripSelected = true;
                    this.setState({ atLeastOneTripSelected: true });
                }
            });

            if (allTripsAreSelected) this.setState({ allSelected: true });
            if (!atLeastOneTripSelected) this.setState({ atLeastOneTripSelected: false });
        });
    };

    returnTripObj = () => _.map(_.filter(this.state.checkboxes, 'selected'), 'tripObj');

    getButtonBarConfig = block => [
        {
            label: 'Add trip',
            disable: false,
            element: <AddTripsModal
                block={ block }
                key={ `add-trips-${block.operationalBlockRunId}` }
                buttonLabel="Add trips"
                openModalButtonClass="mr-2 cc-btn-secondary" />,
            action: null,
        },
        {
            label: '',
            element: <MoveTripsModal
                block={ block }
                key={ `move-trips-${block.operationalBlockRunId}` }
                buttonLabel="Move trips"
                openModalButtonClass="mr-2 cc-btn-secondary"
                disable={ !block.operationalTrips || _.isEmpty(block.operationalTrips) || !this.state.atLeastOneTripSelected }
                selectedTrips={ this.returnTripObj() } />,
            action: null,
        },
        {
            label: 'Edit block',
            disable: true,
            action: null,
        },
        {
            label: '',
            element: <AllocateVehiclesModal
                block={ block }
                key={ `change-vehicle-${block.operationalBlockRunId}` }
                buttonLabel="Change vehicles"
                openModalButtonClass="mr-2 cc-btn-secondary"
                disable={ !block.operationalTrips || _.isEmpty(block.operationalTrips) || !this.state.atLeastOneTripSelected }
                selectedTrips={ this.returnTripObj() } />,
            action: null,
        },
    ];

    renderRowBody = trip => (
        <BlockTrip trip={ {
            ...trip,
            serviceDate: this.props.activeBlock.serviceDate,
        } } />
    );

    isRowActive = ({ externalRef }) => !!(this.props.activeTrip && this.props.activeTrip.externalRef === externalRef);

    handleTripOnClick = trip => (this.isRowActive(trip) ? this.props.updateActiveTrip(null) : this.props.updateActiveTrip(trip));

    render() {
        const { activeBlock } = this.props;
        const buttonBarConfig = this.getButtonBarConfig(activeBlock);

        return (
            <>
                { this.isEditPermitted && buttonBarConfig.length > 0 && <ButtonBar buttons={ buttonBarConfig } isLoading={ false } /> }
                <ControlTable
                    columns={ this.trips }
                    data={ activeBlock.operationalTrips }
                    getRowId={ row => `${row.tripId}-${row.startTime}` }
                    rowBody={ this.renderRowBody }
                    rowActive={ this.isRowActive }
                    rowOnClick={ this.handleTripOnClick }
                    level={ 2 } />
            </>
        );
    }
}

export default connect(state => ({
    activeTrip: getActiveTrip(state),
}), { updateActiveTrip })(BlockTrips);
