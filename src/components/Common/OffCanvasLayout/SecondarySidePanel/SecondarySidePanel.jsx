import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import { Button, Alert } from 'reactstrap';

import VIEW_TYPE from '../../../../types/view-types';
import SidePanel from '../SidePanel/SidePanel';
import { updateSecondaryPanelView, updateMainView, updateControlDetailView } from '../../../../redux/actions/navigation';
import { getLatestActiveAlerts } from '../../../../redux/selectors/control/alerts';
import { getActiveSecondaryPanelView } from '../../../../redux/selectors/navigation';
import AlertPanel from '../../AlertPanel/AlertPanel';
import './SecondarySidePanel.scss';

const PAGE_SIZE = 10;

export class SecondarySidePanel extends React.Component {
    static propTypes = {
        activeSecondaryPanelView: PropTypes.string.isRequired,
        updateSecondaryPanelView: PropTypes.func.isRequired,
        updateMainView: PropTypes.func.isRequired,
        updateControlDetailView: PropTypes.func.isRequired,
        alerts: PropTypes.array,
    };

    static defaultProps = {
        alerts: [],
    };

    renderAlerts = alerts => alerts.map(alert => (
        <AlertPanel
            key={ alert.id }
            id={ alert.id }
            customTitle={ alert.customTitle }
            message={ alert.message }
            routeVariantId={ alert.routeVariantId }
            routeType={ alert.routeType }
            routeShortName={ alert.routeShortName }
            agencyId={ alert.agencyId }
            tripStartDate={ alert.tripStartDate }
            tripStartTime={ alert.tripStartTime }
            goToRoutesView={ alert.goToRoutesView }
            dismissAlert={ alert.dismissAlert }
            // eslint-disable-next-line no-underscore-dangle
            links={ alert._links } />
    ));

    render() {
        const { alerts, activeSecondaryPanelView } = this.props;
        const isSecondarySidePanelOpen = !isEmpty(activeSecondaryPanelView);
        const activeAlertsLength = alerts.length;
        return (
            isSecondarySidePanelOpen && (
                <SidePanel
                    isActive
                    position="right"
                    toggleButton={ false }
                    className="secondary-side-panel bg-secondary border-0 pb-3"
                    isOpen={ isSecondarySidePanelOpen }>
                    <div className="secondary-side-panel__header">
                        <div className="row">
                            <div className="col-10">
                                <h4>{ `Alerts (${activeAlertsLength})` }</h4>
                            </div>
                            <div className="col-2">
                                <Button
                                    className="secondary-side-panel__close close cc-btn-link border-0 p-0"
                                    onClick={ () => this.props.updateSecondaryPanelView('') }>
                                    <span aria-hidden="true">×</span>
                                </Button>
                            </div>
                        </div>
                        <div className="row py-2">
                            <div className="col-12">
                                <Button
                                    className="control-alerts-view__btn cc-btn-primary w-100"
                                    tabIndex="0"
                                    aria-label="View all alerts button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.ALERTS);
                                        this.props.updateSecondaryPanelView('');
                                    } }>
                                    View all alerts
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="secondary-side-panel__body">
                        { this.renderAlerts(alerts) }
                        { activeAlertsLength > PAGE_SIZE && (<Alert color="" className="mt-1">Dismiss the alerts to view older alerts</Alert>) }
                    </div>
                </SidePanel>
            )
        );
    }
}

export default connect(
    state => ({
        activeSecondaryPanelView: getActiveSecondaryPanelView(state),
        alerts: getLatestActiveAlerts(state),
    }),
    { updateSecondaryPanelView, updateMainView, updateControlDetailView },
)(SecondarySidePanel);
