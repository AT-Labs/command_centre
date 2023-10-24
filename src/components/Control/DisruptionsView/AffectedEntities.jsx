import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { isEmpty, groupBy } from 'lodash-es';
import { MdEdit, MdEast } from 'react-icons/md';
import { getStopGroupsIncludingDeleted } from '../../../redux/selectors/control/dataManagement/stopGroups';
import { getStopGroupName } from '../../../utils/control/dataManagement';
import './AffectedEntities.scss';
import { DIRECTIONS } from './types';
import CustomCollapse from '../../Common/CustomCollapse/CustomCollapse';

export const AffectedEntities = (props) => {
    const groupByEntityRender = (groupById, groupTitle, groupText, children) => (
        <li key={ groupById }>
            <div className="font-size-sm font-weight-bold">
                {groupTitle}
                {' '}
                {groupText}
            </div>
            { !isEmpty(children) && children.map(({ title, body }) => (
                <div className="font-size-sm" key={ title }>
                    {title}
                    {' '}
                    {body}
                </div>
            )) }
        </li>
    );

    const getCombinedAffectedStopsRoutesStopGroups = () => {
        const affectedEntitiesByRoute = groupBy(props.affectedEntities.filter(entity => entity.type === 'route' || (entity.routeId && isEmpty(entity.stopCode))), 'routeId');
        const affectedEntitiesByStop = groupBy(props.affectedEntities.filter(entity => entity.type === 'stop' && !entity.groupId), 'stopCode');
        const affectedEntitiesByStopGroup = groupBy(props.affectedEntities.filter(entity => entity.groupId), 'groupId');

        const routesRender = Object.keys(affectedEntitiesByRoute).map((routeId) => {
            const stopsByDirection = groupBy(affectedEntitiesByRoute[routeId].filter(route => route.directionId !== undefined), 'directionId');
            const children = Object.keys(stopsByDirection).map(directionId => ({
                title: `Stops ${DIRECTIONS[directionId]}:`,
                body: stopsByDirection[directionId].map(entity => entity.stopCode).join(', '),
            }));
            return groupByEntityRender(routeId, 'Route', affectedEntitiesByRoute[routeId][0].routeShortName, children);
        });

        const stopsRender = Object.keys(affectedEntitiesByStop).map((stopCode) => {
            const routes = affectedEntitiesByStop[stopCode].filter(entity => entity.routeId).map(entity => entity.routeShortName).join(', ');
            return groupByEntityRender(stopCode, 'Stop', affectedEntitiesByStop[stopCode][0].text, routes ? [{ title: 'Route', body: routes }] : []);
        });

        const stopGroupsRender = Object.keys(affectedEntitiesByStopGroup).map((groupId) => {
            const stops = affectedEntitiesByStopGroup[groupId].map(stop => stop.stopCode).join(', ');
            return groupByEntityRender(groupId, 'Stop Group -', getStopGroupName(props.stopGroups, +groupId), [{ title: 'Stop', body: stops }]);
        });

        return [routesRender, stopsRender, stopGroupsRender];
    };

    return (
        <section className={ `disruption__affected-entities ${props.heightSmall ? 'small' : ''} ${props.className}` }>
            <div className="p-3 w-100">
                {props.showHeader && (
                    <>
                        <div className="row">
                            <div className="col-6">
                                <h3>Affected routes and stops</h3>
                            </div>
                            <div className="col-6 text-right">
                                {!props.isEditDisabled && (
                                    <div>
                                        <Button
                                            className="btn cc-btn-link pr-0 font-weight-bold"
                                            id="edit-routes-and-stops-btn"
                                            onClick={ props.editAction }
                                            disabled={ props.isEditDisabled }>
                                            { props.editLabel }
                                            <MdEdit size={ 20 } color="black" className="ml-1" />
                                        </Button>
                                    </div>
                                )}
                                {props.showViewWorkaroundsButton && (
                                    <div>
                                        <Button
                                            className="btn cc-btn-link pr-0 font-weight-bold"
                                            id="view-workarounds-btn"
                                            onClick={ props.viewWorkaroundsAction }
                                        >
                                            View workarounds
                                            <MdEast size={ 20 } color="black" className="ml-1" />
                                        </Button>
                                    </div>
                                )}
                                {props.showViewPassengerImpactButton && (
                                    <div>
                                        <Button
                                            className="btn cc-btn-link pr-0 font-weight-bold"
                                            id="view-passenger-impact-btn"
                                            onClick={ props.viewPassengerImpactAction }
                                        >
                                            View passenger impact
                                            <MdEast size={ 20 } color="black" className="ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </div>
                        <hr />
                    </>
                )}
                <CustomCollapse height="small" className="w-100">
                    <ul className="p-0 m-0">
                        { getCombinedAffectedStopsRoutesStopGroups() }
                    </ul>
                </CustomCollapse>
            </div>
        </section>
    );
};

AffectedEntities.propTypes = {
    editLabel: PropTypes.string,
    editAction: PropTypes.func,
    isEditDisabled: PropTypes.bool,
    affectedEntities: PropTypes.array.isRequired,
    stopGroups: PropTypes.object.isRequired,
    showHeader: PropTypes.bool,
    className: PropTypes.string,
    heightSmall: PropTypes.bool,
    showViewWorkaroundsButton: PropTypes.bool,
    viewWorkaroundsAction: PropTypes.func,
    showViewPassengerImpactButton: PropTypes.bool,
    viewPassengerImpactAction: PropTypes.func,
};

AffectedEntities.defaultProps = {
    isEditDisabled: false,
    editLabel: 'Edit',
    editAction: null,
    showHeader: true,
    className: '',
    heightSmall: false,
    showViewWorkaroundsButton: false,
    viewWorkaroundsAction: null,
    showViewPassengerImpactButton: false,
    viewPassengerImpactAction: null,
};

export default connect(state => ({
    stopGroups: getStopGroupsIncludingDeleted(state),
}))(AffectedEntities);
