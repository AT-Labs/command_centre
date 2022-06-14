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

export const AffectedEntities = (props) => {
    const collapseRef = useRef(null);
    const [collapse, setCollapse] = useState();
    const [collapseInitialHeight, setInitialHeight] = useState(0);

    useEffect(() => {
        setInitialHeight(collapseRef.current.clientHeight);
    }, []);

    const toggle = () => setCollapse(!collapse);

    const getIndividualAffectedRoutes = () => (
        props.affectedEntities
            .filter(entity => !isEmpty(entity.routeId) && isEmpty(entity.stopCode))
            .map(entity => (
                <li key={ entity.routeId }>
                    <div className="font-size-sm font-weight-bold">
                        Route
                        {' '}
                        { entity.routeShortName }
                    </div>
                </li>
            ))
    );

    const groupByEntityRender = (groupById, groupTitle, groupText, childTitle, children) => (
        <li key={ groupById }>
            <div className="font-size-sm font-weight-bold">
                {groupTitle}
                {' '}
                {groupText}
            </div>
            {children && (
                <div className="font-size-sm">
                    {childTitle}
                    {' '}
                    {children}
                </div>
            )}
        </li>
    );

    const getCombinedAffectedStopsRoutesStopGroups = () => {
        const affectedEntitiesByStop = groupBy(props.affectedEntities.filter(entity => entity.stopCode && !entity.groupId), 'stopCode');
        const affectedEntitiesByStopGroup = groupBy(props.affectedEntities.filter(entity => entity.groupId), 'groupId');

        const stopAndRoutesRender = Object.keys(affectedEntitiesByStop).map((stopCode) => {
            const routes = affectedEntitiesByStop[stopCode].filter(entity => entity.routeId).map(entity => entity.routeShortName).join(', ');
            return groupByEntityRender(stopCode, 'Stop', affectedEntitiesByStop[stopCode][0].text, 'Route', routes);
        });

        const stopGroupsRender = Object.keys(affectedEntitiesByStopGroup).map((groupId) => {
            const stops = affectedEntitiesByStopGroup[groupId].map(stop => stop.stopCode).join(', ');
            return groupByEntityRender(groupId, 'Stop Group -', getStopGroupName(props.stopGroups, +groupId), 'Stop', stops);
        });

        return [stopAndRoutesRender, stopGroupsRender];
    };

    const showViewMoreLessButton = () => {
        const collapseNode = collapseRef.current;
        return collapseNode && collapseNode.scrollHeight > collapseInitialHeight;
    };

    return (
        <section className={ `disruption__affected-entities ${props.className}` }>
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
                        { getIndividualAffectedRoutes() }
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
};

AffectedEntities.defaultProps = {
    isEditDisabled: false,
    editLabel: 'Edit',
    editAction: null,
    showHeader: true,
    className: '',
};

export default connect(state => ({
    stopGroups: getStopGroupsIncludingDeleted(state),
}))(AffectedEntities);
