import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash-es';
import { ExpandableList } from '../../../../../Common/Expandable';
import { EntityCheckbox } from '../EntityCheckbox';
import { getStopGroupName } from '../../../../../../utils/control/dataManagement';
import { getAffectedStops } from '../../../../../../redux/selectors/control/disruptions';
import { getStopGroupsIncludingDeleted } from '../../../../../../redux/selectors/control/dataManagement/stopGroups';

export const StopGroupsMultiSelect = (props) => {
    const { className, removeAction } = props;

    const [expandedGroups, setExpandedGroups] = useState({});

    const allStopGroupStops = props.affectedStops.filter(entity => !!entity.groupId);
    const affectedStopGroups = groupBy(allStopGroupStops, 'groupId');

    const isGroupActive = group => !!expandedGroups[group.groupId];

    const toggleExpandedItem = (itemIdToToggle, expandedItems, setExpandedItems) => {
        const currentItems = { ...expandedItems };
        if (!expandedItems[itemIdToToggle]) {
            currentItems[itemIdToToggle] = true;
            setExpandedItems(currentItems);
        } else {
            delete currentItems[itemIdToToggle];
            setExpandedItems(currentItems);
        }
    };
    const toggleExpandedGroup = group => toggleExpandedItem(group.groupId, expandedGroups, setExpandedGroups);

    const renderStopGroupStops = stops => stops.map(stop => (
        <li key={ `${stop.groupId}-${stop.stopCode}` } className="select_entities pb-2">
            <EntityCheckbox
                id={ `stopByGroup-${stop.groupId}-${stop.stopCode}` }
                checked
                onChange={ null }
                label={ `Stop ${stop.text}` }
                disabled
            />
        </li>
    ));

    return (
        Object.values(affectedStopGroups).map(stopGroupStops => (
            <li className="selection-item border-0 card" key={ stopGroupStops[0].groupId }>
                <ExpandableList
                    id={ stopGroupStops[0].groupId }
                    isActive={ isGroupActive(stopGroupStops[0]) }
                    onToggle={ () => toggleExpandedGroup(stopGroupStops[0]) }
                    removeAction={ () => removeAction(stopGroupStops) }
                    className={ className }
                    label={ `Stop Group - ${getStopGroupName(props.stopGroups, stopGroupStops[0].groupId)} (${stopGroupStops.length})` }
                >
                    { renderStopGroupStops(stopGroupStops) }
                </ExpandableList>
            </li>
        ))
    );
};

StopGroupsMultiSelect.propTypes = {
    stopGroups: PropTypes.object.isRequired,
    affectedStops: PropTypes.array.isRequired,
    className: PropTypes.string,
    removeAction: PropTypes.func,
};

StopGroupsMultiSelect.defaultProps = {
    className: '',
    removeAction: null,
};

export default connect(state => ({
    // affectedStops: getAffectedStops(state),
    stopGroups: getStopGroupsIncludingDeleted(state),
}))(StopGroupsMultiSelect);
