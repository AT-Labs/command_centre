import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input, Label, Button } from 'reactstrap';
import RouteVariantSelect from './RouteVariantSelect';

const AdditionalRouteVariantSelector = ({
    routeVariantsList,
    selectedRouteVariants,
    onSelectVariant,
    onVisibilityChange,
    onRouteVariantRemoved,
    isRouteVariantDisabled,
    isLoadingExistingDiversions,
    existingDiversions,
}) => (
    <div>
        <p>
            <b>Select the other route variant(s) to apply the defined diversion</b>
        </p>
        <div className="route-variant-select">
            <RouteVariantSelect
                label="Select another route variant"
                className="route-variant-select"
                routeVariants={ routeVariantsList }
                onSelectVariant={ onSelectVariant }
                isRouteVariantDisabled={ isRouteVariantDisabled }
                isLoadingExistingDiversions={ isLoadingExistingDiversions }
                existingDiversions={ existingDiversions }
            />
        </div>
        {selectedRouteVariants.map(routeVariant => (
            <div className="other-route-variant-container" key={ routeVariant.routeVariantId }>
                <span className="other-route-variant-text">
                    {`${routeVariant.routeVariantId} - ${routeVariant.routeLongName}`}
                </span>
                <FormGroup check>
                    <Label check>
                        <Input
                            id={ `add-diversion-rv-${routeVariant.routeVariantId}` }
                            type="checkbox"
                            className="mr-2"
                            onChange={ () => onVisibilityChange(routeVariant.routeVariantId) }
                            size={ 20 }
                            checked={ routeVariant.visible }
                        />
                        <span style={ { color: routeVariant.color } }>View</span>
                    </Label>
                    <Button
                        color="link"
                        style={ { marginLeft: '20px', padding: 0 } }
                        onClick={ () => onRouteVariantRemoved(routeVariant.routeVariantId) }
                    >
                        Remove
                    </Button>
                </FormGroup>
            </div>
        ))}
    </div>
);

AdditionalRouteVariantSelector.propTypes = {
    routeVariantsList: PropTypes.array.isRequired,
    selectedRouteVariants: PropTypes.array.isRequired,
    onSelectVariant: PropTypes.func.isRequired,
    onVisibilityChange: PropTypes.func.isRequired,
    onRouteVariantRemoved: PropTypes.func.isRequired,
    isRouteVariantDisabled: PropTypes.func,
    isLoadingExistingDiversions: PropTypes.bool,
    existingDiversions: PropTypes.array,
};

export default AdditionalRouteVariantSelector;
