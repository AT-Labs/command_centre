import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Collapse } from 'reactstrap';
import { isEmpty, groupBy } from 'lodash-es';
import { MdEdit } from 'react-icons/md';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { getStopGroupsIncludingDeleted } from '../../../redux/selectors/control/dataManagement/stopGroups';
import { getStopGroupName } from '../../../utils/control/dataManagement';
import './AffectedEntities.scss';
import { DIRECTIONS } from './types';

export const AffectedEntities = (props) => {
    const collapseRef = useRef(null);
    const [collapse, setCollapse] = useState();
    const [collapseInitialHeight, setInitialHeight] = useState(0);

    useEffect(() => {
        setInitialHeight(collapseRef.current.clientHeight);
    }, []);

    const toggle = () => setCollapse(!collapse);

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
        const affectedEntitiesByRoute = groupBy(props.affectedEntities.filter(entity => entity.type === 'route'), 'routeId');
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
            return groupByEntityRender(stopCode, 'Stop', affectedEntitiesByStop[stopCode][0].text, [{ title: 'Route', body: routes }]);
        });

        const stopGroupsRender = Object.keys(affectedEntitiesByStopGroup).map((groupId) => {
            const stops = affectedEntitiesByStopGroup[groupId].map(stop => stop.stopCode).join(', ');
            return groupByEntityRender(groupId, 'Stop Group -', getStopGroupName(props.stopGroups, +groupId), [{ title: 'Stop', body: stops }]);
        });

        return [routesRender, stopsRender, stopGroupsRender];
    };

    const showViewMoreLessButton = () => {
        const collapseNode = collapseRef.current;
        return collapseNode && collapseNode.scrollHeight > collapseInitialHeight;
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
                            {!props.isEditDisabled && (
                                <div className="col-6 text-right">
                                    <Button
                                        className="btn cc-btn-link pr-0 font-weight-bold"
                                        onClick={ props.editAction }
                                        disabled={ props.isEditDisabled }>
                                        { props.editLabel }
                                        <MdEdit size={ 20 } color="black" className="ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <hr />
                    </>
                )}
                <Collapse innerRef={ collapseRef } isOpen={ collapse } className="w-100">
                    <ul className="p-0 m-0">
                        { getCombinedAffectedStopsRoutesStopGroups() }
                    </ul>
                </Collapse>
                {showViewMoreLessButton() && (
                    <Button
                        className="btn cc-btn-link pl-0 pt-3 font-weight-bold"
                        onClick={ toggle }>
                        {collapse ? 'View less' : 'View more'}
                        {collapse
                            ? <IoIosArrowUp size={ 20 } color="black" className="ml-1" />
                            : <IoIosArrowDown size={ 20 } color="black" className="ml-1" />}
                    </Button>
                )}
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
};

AffectedEntities.defaultProps = {
    isEditDisabled: false,
    editLabel: 'Edit',
    editAction: null,
    showHeader: true,
    className: '',
    heightSmall: false,
};

export default connect(state => ({
    stopGroups: getStopGroupsIncludingDeleted(state),
}))(AffectedEntities);
