import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { IoIosNotifications, IoIosStats } from 'react-icons/io';
import { MdPerson } from 'react-icons/md';
import { connect } from 'react-redux';
import { Button, Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import atLogo from '../../../assets/img/at_logo.png';
import { IS_LOGIN_NOT_REQUIRED, logout } from '../../../auth';
import { updateControlDetailView, updateMainView, updateSecondaryPanelView } from '../../../redux/actions/navigation';
import { isNotificationsEmpty } from '../../../redux/selectors/control/notifications';
import { getActiveControlDetailView, getActiveMainView, getActiveSecondaryPanelView } from '../../../redux/selectors/navigation';
import { getUserPermissions, getUserProfile } from '../../../redux/selectors/user';
import VIEW_TYPE from '../../../types/view-types';
import { IS_NOTIFICATIONS_ENABLED, IS_DISRUPTIONS_ENABLED, IS_TRIP_REPLAYS_ENABLED } from '../../../utils/feature-toggles';
import CustomButton from '../../Common/CustomButton/CustomButton';
import { resetRealtimeToDefault } from '../../../redux/actions/realtime/common';
import './Header.scss';

class Header extends React.Component {
    static propTypes = {
        updateMainView: PropTypes.func.isRequired,
        updateControlDetailView: PropTypes.func.isRequired,
        updateSecondaryPanelView: PropTypes.func.isRequired,
        activeView: PropTypes.string.isRequired,
        activeSecondaryPanelView: PropTypes.string.isRequired,
        controlActiveView: PropTypes.string.isRequired,
        hasNotifications: PropTypes.bool,
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
    }

    static defaultProps = {
        hasNotifications: false,
    }

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            isUserPopoverOpen: false,
        };
    }

    render() {
        const { activeView, controlActiveView, activeSecondaryPanelView, userProfile, userPermissions, hasNotifications } = this.props;
        const isControlRoutesViewPermitted = IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, 'controlRoutesView', false);
        const isControlMessagingViewViewPermitted = IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, 'controlStopMessagingView', false);
        const isControlBlockViewPermitted = IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, 'controlBlocksView', false);
        const isControlDisruptionsViewPermitted = IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, 'controlDisruptionsView', false);
        const isControlTripReplaysViewPermitted = IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, 'controlTripReplaysView', false);
        const isControlNotificationsViewPermitted = IS_LOGIN_NOT_REQUIRED || _.get(userPermissions, 'controlNotificationsView', false);

        return (
            <Navbar className="header bg-primary py-0 fixed-top" expand="md" dark>
                <NavbarBrand>
                    <CustomButton
                        className=""
                        tabIndex="0"
                        ariaLabel="Auckland transport logo"
                        onClick={ this.props.resetRealtimeToDefault }>
                        <img className="header__logo p-2" src={ atLogo } alt="at.govt.nz" />
                    </CustomButton>
                </NavbarBrand>
                <NavbarToggler onClick={ () => this.setState(prevState => ({ isOpen: !prevState.isOpen })) } />
                <Collapse isOpen={ this.state.isOpen } navbar className="bg-primary">
                    <Nav className="ml-left mr-auto" navbar>
                        <NavItem>
                            <CustomButton
                                className="header__btn header__real-time rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.REAL_TIME }
                                tabIndex="0"
                                ariaLabel="Real time section button"
                                onClick={ () => this.props.updateMainView(VIEW_TYPE.MAIN.REAL_TIME) }>
                                REAL TIME MAP
                            </CustomButton>
                        </NavItem>
                        { isControlBlockViewPermitted && (
                            <NavItem>
                                <CustomButton
                                    className="header__btn header__blocks rounded-0 px-3"
                                    active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.BLOCKS }
                                    tabIndex="0"
                                    ariaLabel="Block section button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.BLOCKS);
                                    } }>
                                    BLOCKS
                                </CustomButton>
                            </NavItem>
                        )}
                        { isControlRoutesViewPermitted && (
                            <NavItem>
                                <CustomButton
                                    className="header__btn header__routes rounded-0 px-3"
                                    active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.ROUTES }
                                    tabIndex="0"
                                    ariaLabel="Routes section button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.ROUTES);
                                    } }>
                                    ROUTES & TRIPS
                                </CustomButton>
                            </NavItem>
                        )}
                        { isControlMessagingViewViewPermitted && (
                            <NavItem>
                                <CustomButton
                                    className="header__btn header__messaging rounded-0 px-3"
                                    active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES }
                                    tabIndex="0"
                                    ariaLabel="Messaging section button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES);
                                    } }>
                                    MESSAGING
                                </CustomButton>
                            </NavItem>
                        )}
                        { (isControlDisruptionsViewPermitted && IS_DISRUPTIONS_ENABLED) && (
                            <NavItem>
                                <CustomButton
                                    className="header__btn header__disruption rounded-0 px-3"
                                    active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS }
                                    tabIndex="0"
                                    ariaLabel="Messaging section button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS);
                                    } }>
                                    DISRUPTIONS
                                </CustomButton>
                            </NavItem>
                        )}
                        { (isControlTripReplaysViewPermitted && IS_TRIP_REPLAYS_ENABLED) && (
                            <NavItem>
                                <CustomButton
                                    className="header__btn rounded-0 px-3"
                                    active={ activeView === VIEW_TYPE.MAIN.CONTROL && controlActiveView === VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS }
                                    tabIndex="0"
                                    ariaLabel="Trip Replays section button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS);
                                    } }>
                                    TRIP REPLAYS
                                </CustomButton>
                            </NavItem>
                        )}
                    </Nav>
                    <Nav className="header__toolbar ml-auto" navbar>
                        <NavItem>
                            <CustomButton
                                className="header__btn header__dashboard rounded-0 px-3"
                                active={ activeView === VIEW_TYPE.MAIN.DASHBOARD }
                                tabIndex="0"
                                ariaLabel="System Health Dashboard section button"
                                onClick={ () => {
                                    this.props.updateMainView(VIEW_TYPE.MAIN.DASHBOARD);
                                } }>
                                <IoIosStats size={ 32 } />
                            </CustomButton>
                        </NavItem>

                        { (IS_NOTIFICATIONS_ENABLED && isControlNotificationsViewPermitted) && (
                            <NavItem>
                                <CustomButton
                                    className="header__btn header__notifications rounded-0 px-3 position-relative"
                                    active={ activeSecondaryPanelView === VIEW_TYPE.SECONDARY_PANEL.NOTIFICATIONS }
                                    tabIndex="0"
                                    ariaLabel="Notifications button"
                                    onClick={ () => this.props.updateSecondaryPanelView(VIEW_TYPE.SECONDARY_PANEL.NOTIFICATIONS) }>
                                    <IoIosNotifications
                                        className="header__notifications-icon rounded-circle"
                                        size={ 30 }
                                        role="button"
                                        aria-label="Notifications icon" />
                                    {!hasNotifications && (
                                        <span className="header__notifications-badge rounded-circle position-absolute bg-warning">&nbsp;</span>
                                    )}
                                </CustomButton>
                            </NavItem>
                        )}
                        <NavItem>
                            <CustomButton
                                className="header__btn header__user rounded-0 px-3 position-relative"
                                ariaLabel="User profile button"
                                onClick={ () => this.setState(prevState => ({ isUserPopoverOpen: !prevState.isUserPopoverOpen })) }
                                id="header-user"
                                active={ this.state.isUserPopoverOpen }>
                                <MdPerson
                                    size={ 30 }
                                    role="button"
                                    aria-label="User profile icon" />
                            </CustomButton>
                            <Popover placement="bottom" target="header-user" isOpen={ this.state.isUserPopoverOpen }>
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
}

export default connect(
    state => ({
        activeView: getActiveMainView(state),
        activeSecondaryPanelView: getActiveSecondaryPanelView(state),
        controlActiveView: getActiveControlDetailView(state),
        userProfile: getUserProfile(state),
        userPermissions: getUserPermissions(state),
        hasNotifications: isNotificationsEmpty(state),
    }),
    {
        resetRealtimeToDefault,
        updateMainView,
        updateControlDetailView,
        updateSecondaryPanelView,
    },
)(Header);
