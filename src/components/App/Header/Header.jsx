import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { IoIosStats } from 'react-icons/io';
import { FcDataConfiguration } from 'react-icons/fc';

import { MdPerson } from 'react-icons/md';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import atLogo from '../../../assets/img/at_logo.png';
import { IS_LOGIN_NOT_REQUIRED, logout } from '../../../auth';
import { updateControlDetailView, updateMainView, updateSecondaryPanelView } from '../../../redux/actions/navigation';
import { isAlertsEmpty } from '../../../redux/selectors/control/alerts';
import { getActiveControlDetailView, getActiveMainView, getActiveSecondaryPanelView } from '../../../redux/selectors/navigation';
import { getStopMessagesPermissions } from '../../../redux/selectors/control/stopMessaging/stopMessages';
import { getStopMessagesAndPermissions } from '../../../redux/actions/control/stopMessaging';
import { isGlobalEditStopMessagesPermitted } from '../../../utils/user-permissions';
import { getUserPermissions, getUserProfile } from '../../../redux/selectors/user';
import VIEW_TYPE from '../../../types/view-types';
import { IS_ALERTS_ENABLED, IS_DISRUPTIONS_ENABLED, IS_TRIP_REPLAYS_ENABLED, IS_ANALYTICS_ENABLED, IS_FLEETS_ENABLED } from '../../../utils/feature-toggles';
import CustomButton from '../../Common/CustomButton/CustomButton';
import Icon from '../../Common/Icon/Icon';
import { HelpInformationModal } from '../HelpInformationModal/HelpInformationModal';
import { resetRealtimeToDefault } from '../../../redux/actions/realtime/common';
import { useNotifications } from '../../../redux/selectors/appSettings';
import './Header.scss';

function Header(props) {
    const location = useLocation();
    const history = useHistory();
    const [isOpen, setIsOpen] = useState(false);
    const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

    const isGlobalEditMessagesPermitted = IS_LOGIN_NOT_REQUIRED || isGlobalEditStopMessagesPermitted(props.stopMessagesPermissions);

    const handleUrlChange = (inputLocation) => {
        if (inputLocation.pathname === '/') {
            props.updateMainView(VIEW_TYPE.MAIN.REAL_TIME);
            props.updateControlDetailView();
        } else {
            const paths = inputLocation.pathname.split('/');
            props.updateMainView(paths[1]);
            if (paths[1] === VIEW_TYPE.MAIN.REAL_TIME) {
                props.updateControlDetailView();
            } else {
                props.updateControlDetailView(paths[2]);
            }
        }
    };

    const toggleHelpModal = () => {
        setIsHelpModalVisible(!isHelpModalVisible);
    };

    useEffect(() => {
        props.getStopMessagesAndPermissions();
        handleUrlChange(location);
        const removeBackListener = history.listen((currentLocation, action) => {
            if (action === 'POP') {
                handleUrlChange(currentLocation);
            }
        });
        return () => {
            removeBackListener();
        };
    }, []);

    useEffect(() => {
        const locationToPush = `/${props.activeView}/${props.controlActiveView}`;
        if (locationToPush !== location.pathname
            && [
                VIEW_TYPE.CONTROL_DETAIL.BLOCKS,
                VIEW_TYPE.CONTROL_DETAIL.ROUTES,
                VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES,
                VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                VIEW_TYPE.CONTROL_DETAIL.ALERTS,
                VIEW_TYPE.CONTROL_DETAIL.FLEETS,
                VIEW_TYPE.CONTROL_DETAIL.DATA_MANAGEMENT,
                VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS,
            ].includes(props.controlActiveView)) {
            history.push(locationToPush);
        }
    }, [props.controlActiveView]);

    useEffect(() => {
        const locationToPush = props.activeView === VIEW_TYPE.MAIN.REAL_TIME ? '/' : `/${props.activeView}`;
        if (locationToPush !== location.pathname && [VIEW_TYPE.MAIN.DASHBOARD, VIEW_TYPE.MAIN.REAL_TIME, VIEW_TYPE.MAIN.ANALYTICS].includes(props.activeView)) {
            history.push(locationToPush);
        }
    }, [props.activeView]);

    const { activeView, controlActiveView, userProfile, userPermissions } = props;
    const isViewPermitted = view => IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, view, false);

    return (
        <Navbar className="header bg-primary p-0 fixed-top" expand="md" dark>
            <NavbarBrand className="m-0">
                <CustomButton
                    tabIndex="0"
                    ariaLabel="Auckland transport logo"
                    onClick={ props.resetRealtimeToDefault }>
                    <img className="header__logo p-2" src={ atLogo } alt="at.govt.nz" />
                </CustomButton>
            </NavbarBrand>
            <NavbarToggler onClick={ () => setIsOpen(!isOpen) } />
            <Collapse isOpen={ isOpen } navbar className="bg-primary">
                <Nav className="ml-left mr-auto" navbar>
                    <NavItem>
                        <CustomButton
                            className="header__btn header__real-time rounded-0 px-3"
                            active={ activeView === VIEW_TYPE.MAIN.REAL_TIME }
                            tabIndex="0"
                            ariaLabel="Real time section button"
                            onClick={ () => {
                                props.updateMainView(VIEW_TYPE.MAIN.REAL_TIME);
                                props.updateControlDetailView();
                            } }>
                            REAL TIME MAP
                        </CustomButton>
                    </NavItem>
                    { isViewPermitted('controlBlocksView') && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__blocks rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.BLOCKS }
                                tabIndex="0"
                                ariaLabel="Block section button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.BLOCKS);
                                } }>
                                BLOCKS
                            </CustomButton>
                        </NavItem>
                    )}
                    { isViewPermitted('controlRoutesView') && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__routes rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.ROUTES }
                                tabIndex="0"
                                ariaLabel="Routes section button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.ROUTES);
                                } }>
                                ROUTES & TRIPS
                            </CustomButton>
                        </NavItem>
                    )}
                    { (IS_DISRUPTIONS_ENABLED && isViewPermitted('controlDisruptionsView')) && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__disruption rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS }
                                tabIndex="0"
                                ariaLabel="Messaging section button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS);
                                } }>
                                DISRUPTIONS
                            </CustomButton>
                        </NavItem>
                    )}
                    { isViewPermitted('controlStopMessagingView') && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__messaging rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES }
                                tabIndex="0"
                                ariaLabel="Messaging section button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES);
                                } }>
                                MESSAGING
                            </CustomButton>
                        </NavItem>
                    )}
                    { props.useNotifications && isViewPermitted('controlNotificationsView') && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__notifications rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS }
                                tabIndex="0"
                                ariaLabel="Notifications button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS);
                                } }>
                                NOTIFICATIONS
                            </CustomButton>
                        </NavItem>
                    )}
                    { (IS_TRIP_REPLAYS_ENABLED && isViewPermitted('controlTripReplaysView')) && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__trip-replays rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS }
                                tabIndex="0"
                                ariaLabel="Trip Replays section button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS);
                                } }>
                                REPLAY
                            </CustomButton>
                        </NavItem>
                    )}
                    { (IS_FLEETS_ENABLED && isViewPermitted('controlFleetsView')) && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__fleets rounded-0 px-3 position-relative"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.FLEETS }
                                tabIndex="0"
                                ariaLabel="Fleets button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.FLEETS);
                                } }>
                                FLEET
                            </CustomButton>
                        </NavItem>
                    )}
                    { IS_ANALYTICS_ENABLED && (
                        <NavItem>
                            <CustomButton
                                className="header__btn rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.ANALYTICS }
                                tabIndex="0"
                                ariaLabel="Analytics section button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.ANALYTICS);
                                    props.updateControlDetailView();
                                } }>
                                ANALYTICS
                            </CustomButton>
                        </NavItem>
                    )}
                    { (IS_ALERTS_ENABLED && isViewPermitted('controlAlertsView')) && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__alerts rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.ALERTS }
                                tabIndex="0"
                                ariaLabel="Alerts button"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.ALERTS);
                                } }>
                                ALERTS
                                {' '}
                                {!props.hasAlerts && (
                                    <span style={ { height: 8, width: 8, marginLeft: 3 } } className="header__alerts-badge rounded-circle position-absolute bg-warning">
                                        &nbsp;
                                    </span>
                                )}
                            </CustomButton>
                        </NavItem>
                    )}
                </Nav>
                <Nav className="header__toolbar ml-auto" navbar>
                    { isGlobalEditMessagesPermitted && (
                        <NavItem>
                            <CustomButton
                                className="header__btn header__data-management rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.DATA_MANAGEMENT }
                                tabIndex="0"
                                ariaLabel="Data Management"
                                onClick={ () => {
                                    props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                    props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.DATA_MANAGEMENT);
                                } }>
                                <FcDataConfiguration size={ 32 } />
                            </CustomButton>
                        </NavItem>
                    )}
                    <NavItem>
                        <CustomButton
                            className="header__btn header__dashboard rounded-0 px-3"
                            active={ activeView === VIEW_TYPE.MAIN.DASHBOARD }
                            tabIndex="0"
                            ariaLabel="System Health Dashboard section button"
                            onClick={ () => {
                                props.updateMainView(VIEW_TYPE.MAIN.DASHBOARD);
                                props.updateControlDetailView();
                            } }>
                            <IoIosStats size={ 32 } />
                        </CustomButton>
                    </NavItem>

                    <NavItem>
                        <CustomButton
                            className="header__btn header__user rounded-0 px-3 position-relative"
                            ariaLabel="User profile button"
                            onClick={ () => setIsUserPopoverOpen(!isUserPopoverOpen) }
                            id="header-user"
                            active={ isUserPopoverOpen }>
                            <MdPerson
                                size={ 30 }
                                role="button"
                                aria-label="User profile icon" />
                        </CustomButton>
                        <Popover placement="bottom" target="header-user" isOpen={ isUserPopoverOpen }>
                            <PopoverHeader>{userProfile.name}</PopoverHeader>
                            <PopoverBody>
                                <p className="m-0 mb-2">{userProfile.userName}</p>
                                { !IS_LOGIN_NOT_REQUIRED && (
                                    <Button
                                        className="btn-info btn-sm mt-2"
                                        onClick={ () => logout() }>
                                        Logout
                                    </Button>
                                )}
                            </PopoverBody>
                        </Popover>
                    </NavItem>
                    <NavItem>
                        <CustomButton
                            className="header__btn header__user rounded-0 px-3 position-relative"
                            ariaLabel="Help information button"
                            onClick={ toggleHelpModal }
                            id="header-help"
                            active={ isHelpModalVisible }
                        >
                            <Icon className="user-manual d-block" icon="user-manual" />
                        </CustomButton>
                        {isHelpModalVisible && (
                            <HelpInformationModal
                                onClose={ toggleHelpModal }
                            />
                        )}
                    </NavItem>
                </Nav>
            </Collapse>
            { process.env.NODE_ENV !== 'production' && (
                <span
                    className="header__environment_indicator">
                    <strong>
                        { process.env.NODE_ENV.toUpperCase() }
                    </strong>
                </span>
            )}
        </Navbar>
    );
}

Header.propTypes = {
    updateMainView: PropTypes.func.isRequired,
    updateControlDetailView: PropTypes.func.isRequired,
    updateSecondaryPanelView: PropTypes.func.isRequired, // eslint-disable-line
    getStopMessagesAndPermissions: PropTypes.func.isRequired,
    activeView: PropTypes.string.isRequired,
    controlActiveView: PropTypes.string,
    hasAlerts: PropTypes.bool, // eslint-disable-line
    stopMessagesPermissions: PropTypes.array.isRequired,
    userProfile: PropTypes.shape({
        name: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        roles: PropTypes.array.isRequired,
    }).isRequired,
    userPermissions: PropTypes.shape({
        controlRoutesView: PropTypes.bool.isRequired,
        controlBlocksView: PropTypes.bool.isRequired,
        controlStopMessagingView: PropTypes.bool.isRequired,
    }).isRequired,
    resetRealtimeToDefault: PropTypes.func.isRequired,
    useNotifications: PropTypes.bool.isRequired,
};

Header.defaultProps = {
    hasAlerts: false,
    controlActiveView: '',
};

export default connect(
    state => ({
        activeView: getActiveMainView(state),
        activeSecondaryPanelView: getActiveSecondaryPanelView(state),
        controlActiveView: getActiveControlDetailView(state),
        userProfile: getUserProfile(state),
        userPermissions: getUserPermissions(state),
        hasAlerts: isAlertsEmpty(state),
        stopMessagesPermissions: getStopMessagesPermissions(state),
        useNotifications: useNotifications(state),
    }),
    {
        resetRealtimeToDefault,
        updateMainView,
        updateControlDetailView,
        updateSecondaryPanelView,
        getStopMessagesAndPermissions,
    },
)(Header);
