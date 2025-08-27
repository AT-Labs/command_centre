import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input, Label } from 'reactstrap';
import RouteVariantSelect from './RouteVariantSelect';
import EDIT_TYPE from '../../../../types/edit-types';

const BaseRouteVariantSelector = ({
    disabled,
    editMode,
    routeVariantsList,
    selectedRouteVariant,
    visibility,
    onSelectVariant,
    onVisibilityChanged,
    isRouteVariantDisabled,
    isLoadingExistingDiversions,
    existingDiversions,
}) => {
    // console.log('🔧 BaseRouteVariantSelector - render with props:', {
    //     disabled,
    //     editMode,
    //     routeVariantsListLength: routeVariantsList.length,
    //     selectedRouteVariantId: selectedRouteVariant?.routeVariantId,
    //     visibility,
    //     isRouteVariantDisabled: !!isRouteVariantDisabled,
    //     isLoadingExistingDiversions,
    //     existingDiversionsLength: existingDiversions.length
    // });
    
    return (
        <div className="select-main-variant-container pl-4 pr-1">
        <p>
            {editMode === EDIT_TYPE.EDIT
                ? 'Edit the diversion shape or route variants'
                : 'Select the first route variant to define a diversion'}
        </p>
        <div style={ { display: 'flex', alignItems: 'center', gap: '10px' } }>
            <div className="route-variant-select">
                <RouteVariantSelect
                    disabled={ disabled }
                    routeVariants={ routeVariantsList }
                    selectedRouteVariant={ selectedRouteVariant }
                    onSelectVariant={ onSelectVariant }
                    isRouteVariantDisabled={ isRouteVariantDisabled }
                    isLoadingExistingDiversions={ isLoadingExistingDiversions }
                    existingDiversions={ existingDiversions }
                />
            </div>
            <FormGroup check>
                <Label check>
                    <Input
                        id="add-diversion-main"
                        type="checkbox"
                        className="mr-2"
                        onChange={ onVisibilityChanged }
                        size={ 20 }
                        disabled={ selectedRouteVariant === null }
                        checked={ visibility }
                    />
                    <span>View</span>
                </Label>
            </FormGroup>
        </div>
    </div>
    );
};

BaseRouteVariantSelector.propTypes = {
    disabled: PropTypes.bool,
    editMode: PropTypes.string.isRequired,
    routeVariantsList: PropTypes.array.isRequired,
    selectedRouteVariant: PropTypes.object,
    onSelectVariant: PropTypes.func.isRequired,
    visibility: PropTypes.bool,
    onVisibilityChanged: PropTypes.func.isRequired,
    isRouteVariantDisabled: PropTypes.func,
    isLoadingExistingDiversions: PropTypes.bool,
    existingDiversions: PropTypes.array,
};

BaseRouteVariantSelector.defaultProps = {
    disabled: true,
    selectedRouteVariant: null,
    visibility: true,
    isRouteVariantDisabled: null,
    isLoadingExistingDiversions: false,
    existingDiversions: [],
};

export default BaseRouteVariantSelector;
