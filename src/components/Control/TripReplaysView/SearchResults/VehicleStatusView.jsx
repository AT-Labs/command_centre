import React, { useEffect } from 'react';
import moment from 'moment-timezone';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { CardBody, Card } from 'reactstrap';
import { BsKeyFill, BsKey, BsFillLightbulbFill, BsFillLightbulbOffFill } from 'react-icons/bs';
import { TbEngine, TbEngineOff } from 'react-icons/tb';
import { BiLogIn, BiLogOut } from 'react-icons/bi';
import { FaDoorOpen, FaDoorClosed } from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';
import DATE_TYPE from '../../../../types/date-types';
import { getTripReplayTotalResults } from '../../../../redux/selectors/control/tripReplays/tripReplayView';
import { getAllVehicleReplayEvents } from '../../../../redux/actions/control/vehicleReplays/currentVehicleReplay';
import Loader from '../../../Common/Loader/Loader';
import { getVehicleReplays } from '../../../../redux/selectors/control/vehicleReplays/vehicleReplay';

const VehicleStatusView = (props) => {
    const { vehicleReplays, totalTripResults, handleMouseEnter, handleMouseLeave, handleMouseClick } = props;

    useEffect(() => {
        props.getAllVehicleReplayEvents();
    }, []);

    const Icons = {
        signOn: BiLogIn,
        signOff: BiLogOut,
        keyOn: BsKeyFill,
        keyOff: BsKey,
        engineOn: TbEngine,
        engineOff: TbEngineOff,
        doorOpen: FaDoorOpen,
        doorClosed: FaDoorClosed,
        stoppingLightOn: BsFillLightbulbFill,
        stoppingLightOff: BsFillLightbulbOffFill,
    };

    const Titles = {
        signOn: 'Sign On',
        signOff: 'Sign Off',
        keyOn: 'Key On',
        keyOff: 'Key Off',
        engineOn: 'Engine On',
        engineOff: 'Engine Off',
        doorOpen: 'Door Open',
        doorClosed: 'Door Closed',
        stoppingLightOn: 'Stopping Light On',
        stoppingLightOff: 'Stopping Light Off',
    };

    const getTime = timestamp => moment.unix(timestamp).tz(DATE_TYPE.TIME_ZONE).format('HH:mm:ss');

    const onClick = (event) => {
        handleMouseClick(event);
    };

    const renderVehicleStatusView = (event) => {
        // no trip but got status
        const IconName = Icons[event.type];
        return (
            <Card
                className="vehicle-status-card"
                id={ event.id }
                key={ event.id }
                onClick={ () => onClick(event) }
                onKeyDown={ () => handleMouseClick(event) }
                onMouseEnter={ () => handleMouseEnter(event) }
                onMouseLeave={ () => handleMouseLeave() }
            >
                <CardBody className="vehicle-status-card-body">
                    <div className="display-status ml-3">
                        <IconName size={ 24 } />
                        <dt className="font-size-md ml-3">{Titles[event.type]}</dt>
                    </div>
                    <div className="vehicle-status-time mr-3">
                        <dd>{getTime(event.timestamp)}</dd>
                        <MdKeyboardArrowRight size={ 24 } className="ml-3" />
                    </div>
                </CardBody>
            </Card>
        );
    };

    const renderTripId = trip => (
        // got trip and got status
        <div key={ trip.id }>
            <div className="vehicle-status-tripId">
                <dt className="font-size-md px-4 pt-1 pb-1">{trip.id}</dt>
            </div>
            {trip.event.map(event => (
                renderVehicleStatusView(event)
            ))}
        </div>
    );

    const renderMain = () => {
        if (Object.keys(vehicleReplays).length === 0) {
            return (
                <p className="px-4 text-muted">No vehicle status available</p>
            );
        }
        const trips = vehicleReplays?.trip;
        return (
            <div>
                {totalTripResults > 0 ? (
                    <div>
                        {trips.map(trip => (
                            renderTripId(trip)
                        ))}
                    </div>
                ) : (
                    <div>
                        {trips[0].event.map(event => (
                            renderVehicleStatusView(event)
                        ))}
                    </div>
                )}
                <div className="vehicle-status-divider" />
            </div>
        );
    };

    return (
        <div>
            {vehicleReplays === null
                ? (
                    <section className="auto-refresh-table">
                        <h4 className="px-4">
                            <Loader className="my-3" />
                        </h4>
                    </section>
                ) : (
                    renderMain()
                )}
        </div>
    );
};

VehicleStatusView.propTypes = {
    totalTripResults: PropTypes.number,
    vehicleReplays: PropTypes.object,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseClick: PropTypes.func.isRequired,
    getAllVehicleReplayEvents: PropTypes.func.isRequired,
};

VehicleStatusView.defaultProps = {
    totalTripResults: 0,
    vehicleReplays: null,
};

export default connect(
    state => ({
        totalTripResults: getTripReplayTotalResults(state),
        vehicleReplays: getVehicleReplays(state),
    }),
    {
        getAllVehicleReplayEvents,
    },
)(VehicleStatusView);
