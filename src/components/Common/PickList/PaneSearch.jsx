import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'reactstrap';

import OmniSearch from '../../OmniSearch/OmniSearch';
import SearchTheme from '../../Control/Common/search-theme';

export const PaneSearch = (props) => {
    const selectionHandlers = () => {
        const { entityToItemTransformers, onSelect } = props;
        const handlers = {};
        Object.keys(entityToItemTransformers).forEach((entityType) => {
            handlers[entityType] = entity => onSelect([entityToItemTransformers[entityType](entity)]);
        });
        return handlers;
    };

    const clearHandlers = () => {
        const { entityToItemTransformers, onUnselect } = props;
        const handlers = {};
        Object.keys(entityToItemTransformers).forEach((entityType) => {
            handlers[entityType] = entity => onUnselect([entityToItemTransformers[entityType](entity)]);
        });
        return handlers;
    };

    const selectedEntities = () => {
        const { selectedItems, itemToEntityTransformers } = props;
        return { ...selectedItems.map(item => itemToEntityTransformers[item.type](item)) };
    };

    const {
        paneClassName,
        paneId,
        paneLabel,
        placeholder,
        height,
        width,
        searchInCategory,
    } = props;

    const innerDivStyle = { height };

    return (
        <div className={ `picklist-pane ${paneClassName} border border-primary rounded pt-2 ${width}` }>
            <div style={ innerDivStyle } className="picklist-pane__inner d-flex flex-column">
                <div className="picklist-pane__search-container">
                    <Label for={ paneId } className="pl-1 font-weight-bold">{ paneLabel }</Label>
                    <OmniSearch
                        id={ paneId }
                        theme={ SearchTheme }
                        placeholder={ placeholder }
                        searchInCategory={ searchInCategory }
                        selectionHandlers={ selectionHandlers() }
                        clearHandlers={ clearHandlers() }
                        multiSearch
                        selectedEntities={ selectedEntities() }
                        showTags={ false } />
                </div>
            </div>
        </div>
    );
};

PaneSearch.propTypes = {
    paneClassName: PropTypes.string.isRequired,
    paneId: PropTypes.string.isRequired,
    paneLabel: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    height: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    width: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onUnselect: PropTypes.func.isRequired,
    searchInCategory: PropTypes.array.isRequired,
    entityToItemTransformers: PropTypes.object.isRequired,
    itemToEntityTransformers: PropTypes.object.isRequired,
    selectedItems: PropTypes.array.isRequired,
};

PaneSearch.defaultProps = {
    width: 'w-50',
};
