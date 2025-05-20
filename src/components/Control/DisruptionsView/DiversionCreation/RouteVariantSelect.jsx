import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

const RouteVariantSelect = ({ label, disabled, routeVariants, selectedRouteVariant, onSelectVariant }) => {
    // Group variants by routeShortName
    const groupedByRoute = routeVariants.filter(v => v.hidden !== true).reduce((acc, variant) => {
        const { routeShortName } = variant;
        if (!acc[routeShortName]) {
            acc[routeShortName] = [];
        }
        acc[routeShortName].push(variant);
        return acc;
    }, {});

    return (
        <FormControl className="w-100 position-relative">
            <InputLabel id="grouped-native-select-label">
                { label }
            </InputLabel>
            <Select
                labelId="grouped-native-select-label"
                id="grouped-native-select"
                disabled={ disabled }
                label={ label }
                value={ selectedRouteVariant?.routeVariantId || '' } // Controlled value
                onChange={ (event) => {
                    const selectedId = event.target.value;
                    const selectedVariant = routeVariants.find(
                        variant => variant.routeVariantId === selectedId,
                    );
                    onSelectVariant(selectedVariant); // Pass the full variant object to the parent
                } }
            >
                {Object.entries(groupedByRoute).map(([routeShortName, variants]) => {
                    // Group variants by directionId within each route
                    const inboundVariants = variants.filter(variant => variant.directionId === 0);
                    const outboundVariants = variants.filter(variant => variant.directionId === 1);

                    return [
                        // Inbound/Anticlockwise Group
                        inboundVariants.length > 0 && (
                            <ListSubheader key={ `${routeShortName}-inbound` }>
                                {`Route ${routeShortName} Inbound/Anticlockwise`}
                            </ListSubheader>
                        ),
                        ...inboundVariants.map(variant => (
                            <MenuItem key={ variant.routeVariantId } value={ variant.routeVariantId }>
                                { `${variant.routeVariantId} - ${variant.routeLongName}` }
                            </MenuItem>
                        )),

                        // Outbound/Clockwise Group
                        outboundVariants.length > 0 && (
                            <ListSubheader key={ `${routeShortName}-outbound` }>
                                {`Route ${routeShortName} Outbound/Clockwise`}
                            </ListSubheader>
                        ),
                        ...outboundVariants.map(variant => (
                            <MenuItem key={ variant.routeVariantId } value={ variant.routeVariantId }>
                                { `${variant.routeVariantId} - ${variant.routeLongName}` }
                            </MenuItem>
                        )),
                    ];
                })}
            </Select>
        </FormControl>
    );
};

RouteVariantSelect.propTypes = {
    label: PropTypes.string,
    disabled: PropTypes.bool,
    routeVariants: PropTypes.array,
    selectedRouteVariant: PropTypes.object,
    onSelectVariant: PropTypes.func.isRequired,
};

RouteVariantSelect.defaultProps = {
    label: 'Select a route variant',
    disabled: false,
    routeVariants: [],
    selectedRouteVariant: {
        shapeWkt: '',
    },
};

export default RouteVariantSelect;
