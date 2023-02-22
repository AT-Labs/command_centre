import React, { useEffect, useState } from 'react';
import { isNull, isEmpty } from 'lodash-es';
import moment from 'moment-timezone';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { CardBody, Card, Button } from 'reactstrap';
import { BsKeyFill, BsKey, BsFillLightbulbFill, BsFillLightbulbOffFill, BsFillGeoAltFill } from 'react-icons/bs';
import { TbEngine, TbEngineOff } from 'react-icons/tb';
import { BiLogIn, BiLogOut } from 'react-icons/bi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { FaDoorOpen, FaDoorClosed } from 'react-icons/fa';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { Expandable, ExpandableContent, ExpandableSummary } from '../../../Common/Expandable';
import DATE_TYPE from '../../../../types/date-types';
import { VEHICLE_POSITION } from '../../../../types/vehicle-types';
import { getTripReplayTotalResults } from '../../../../redux/selectors/control/tripReplays/tripReplayView';
import Loader from '../../../Common/Loader/Loader';
import { getVehicleEventsAndPositions } from '../../../../redux/selectors/control/vehicleReplays/vehicleReplay';
import { getVehicleReplayStatusAndPosition } from '../../../../redux/actions/control/vehicleReplays/vehicleReplay';

const VehicleStatusView = (props) => {
    const { vehicleEvents, handleMouseEnter, handleMouseLeave, handleMouseClick } = props;
    const [expandedVehiclePosition, setExpandedVehiclePosition] = useState({});

    useEffect(() => {
        if (isNull(vehicleEvents)) {
            props.getVehicleReplayStatusAndPosition();
        }
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
        vehiclePosition: BsFillGeoAltFill,
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
        vehiclePosition: 'Vehicle Position',
    };

    const getTime = timestamp => moment.unix(timestamp).tz(DATE_TYPE.TIME_ZONE).format('HH:mm:ss');

    const onClick = (event) => {
        handleMouseClick(event);
    };

    const toggleExpandedVehiclePosition = (vehiclePositionId) => {
        const currentItems = { ...expandedVehiclePosition };
        if (!expandedVehiclePosition[vehiclePositionId]) {
            currentItems[vehiclePositionId] = true;
            setExpandedVehiclePosition(currentItems);
        } else {
            delete currentItems[vehiclePositionId];
            setExpandedVehiclePosition(currentItems);
        }
    };

    const isVehiclePositionDropDownActive = vehiclePositionId => !!expandedVehiclePosition[vehiclePositionId];

    const renderVehiclePositionDropDown = (vehiclePosition) => {
        const IconName = Icons[vehiclePosition.type];
        return (
            <li className="vehicle-position-header-border card" key={ vehiclePosition.id }>
                <Expandable
                    id={ vehiclePosition.id }
                    isActive={ isVehiclePositionDropDownActive(vehiclePosition.id) }
                    onToggle={ () => toggleExpandedVehiclePosition(vehiclePosition.id) }
                    className="border-0">
                    <ExpandableSummary
                        expandClassName="border-0  vehicle-position-header"
                        displayToggleButton={ false }>
                        <div>
                            <Button
                                className="btn cc-btn-link pt-0 pl-0"
                                onClick={ () => toggleExpandedVehiclePosition(vehiclePosition.id) }>
                                { isVehiclePositionDropDownActive(vehiclePosition.id)
                                    ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } /> }
                            </Button>
                        </div>
                        <div className="w-100 vehicle-position-body">
                            <div className="col row">
                                <IconName size={ 24 } />
                                <dt className="font-size-md ml-3">{`${Titles[vehiclePosition.type]}s`}</dt>
                            </div>
                            <div className=" col row d-flex vehicle-position-time">
                                <dd>{`${getTime(vehiclePosition.startOfRangeTime)} - ${getTime(vehiclePosition.endOfRangeTime)}`}</dd>
                                <MdKeyboardArrowRight size={ 24 } className="ml-2" />
                            </div>
                        </div>
                    </ExpandableSummary>
                    <ExpandableContent extendClassName="bg-white p-0">
                        {
                            vehiclePosition.child.map((childVehiclePosition) => {
                                const ChildIconName = Icons[childVehiclePosition.type];
                                return (
                                    <Card
                                        className="vehicle-status-card"
                                        id={ childVehiclePosition.id }
                                        key={ childVehiclePosition.id }
                                        onClick={ () => onClick(childVehiclePosition) }
                                        onKeyDown={ () => handleMouseClick(childVehiclePosition) }
                                        onMouseEnter={ () => handleMouseEnter(childVehiclePosition) }
                                        onMouseLeave={ () => handleMouseLeave() }
                                    >
                                        <CardBody>
                                            <div className="vehicle-position-body">
                                                <div className="col row ml-5">
                                                    <ChildIconName size={ 24 } />
                                                    <dt className="font-size-md ml-3">{Titles[childVehiclePosition.type]}</dt>
                                                </div>
                                                <div className="col row d-flex vehicle-position-time mr-3">
                                                    <dd>{getTime(childVehiclePosition.timestamp)}</dd>
                                                    <MdKeyboardArrowRight size={ 24 } className="ml-2" />
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })
                        }
                    </ExpandableContent>
                </Expandable>
            </li>
        );
    };

    const renderVehicleStatusView = (event) => {
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
                    <div className="col-4 row ml-2">
                        <IconName size={ 24 } />
                        <dt className="font-size-md ml-3">{Titles[event.type]}</dt>
                    </div>
                    <div className="col-6 row">
                        <dt className="font-size-md ml-3">{!isNull(event.tripId) && event.tripId}</dt>
                    </div>
                    <div className="col-3 row vehicle-status-time mr-3">
                        <dd>{getTime(event.timestamp)}</dd>
                        <MdKeyboardArrowRight size={ 24 } className="ml-2" />
                    </div>
                </CardBody>
            </Card>
        );
    };

    const renderMain = () => {
        if (isEmpty(vehicleEvents)) {
            return (
                <p className="px-4 text-muted">No vehicle status available</p>
            );
        }
        return (
            <div>
                {vehicleEvents.map((event) => {
                    if (event.type === VEHICLE_POSITION && !isEmpty(event.child)) {
                        return renderVehiclePositionDropDown(event);
                    }
                    return renderVehicleStatusView(event);
                })}
            </div>
        );
    };

    return (
        <div>
            {isNull(vehicleEvents)
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
    vehicleEvents: PropTypes.array,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseClick: PropTypes.func.isRequired,
    getVehicleReplayStatusAndPosition: PropTypes.func.isRequired,
};

VehicleStatusView.defaultProps = {
    vehicleEvents: null,
};

export default connect(state => ({
    totalTripResults: getTripReplayTotalResults(state),
    vehicleEvents: getVehicleEventsAndPositions(state),
}), { getVehicleReplayStatusAndPosition })(VehicleStatusView);
