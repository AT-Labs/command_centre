import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { Button, Collapse } from 'reactstrap';
import { isEmpty, groupBy } from 'lodash-es';
import { MdEdit } from 'react-icons/md';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import './AffectedEntities.scss';

const AffectedEntities = (props) => {
    const collapseRef = useRef(null);
    const [collapse, setCollapse] = useState(false);
    const [collapseInitialHeight, setInitialHeight] = useState(0);

    useEffect(() => {
        setInitialHeight(collapseRef.current.clientHeight);
    }, []);

    const toggle = () => setCollapse(!collapse);

    const getIndividualAffectedRoutes = () => (
        props.affectedEntities
            .filter(entity => !isEmpty(entity.routeId) && isEmpty(entity.stopId))
            .map(entity => (
                <li key={ entity.routeId }>
                    <div className="font-size-sm font-weight-bold">
                        Route { entity.routeShortName }
                    </div>
                </li>
            ))
    );

    const getCombinedAffectedStopsRoutes = () => {
        const affectedEntitiesByStop = groupBy(props.affectedEntities.filter(entity => entity.stopId), 'stopId');
        return Object.keys(affectedEntitiesByStop).map((stopId) => {
            const routes = affectedEntitiesByStop[stopId].filter(entity => entity.routeId).map(entity => entity.routeShortName).join(', ');
            return (
                <li key={ stopId }>
                    <div className="font-size-sm font-weight-bold">
                        Stop { affectedEntitiesByStop[stopId][0].text }
                    </div>
                    {routes && (
                        <div className="font-size-sm">
                            Route { routes }
                        </div>
                    )}
                </li>
            );
        });
    };

    const showViewMoreLessButton = () => {
        const collapseNode = collapseRef.current;
        return collapseNode && collapseNode.scrollHeight > collapseInitialHeight;
    };

    return (
        <section className="disruption__affected-entities">
            <div className="p-3">
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
                <Collapse innerRef={ collapseRef } isOpen={ collapse } className="w-100">
                    <ul className="p-0 m-0">
                        { getIndividualAffectedRoutes() }
                        { getCombinedAffectedStopsRoutes() }
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
};

AffectedEntities.defaultProps = {
    isEditDisabled: false,
    editLabel: 'Edit',
    editAction: null,
};

export default AffectedEntities;
