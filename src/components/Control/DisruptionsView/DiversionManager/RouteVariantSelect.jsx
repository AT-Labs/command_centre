import React from 'react';
import Select from 'react-select';
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
        <div className="w-100 position-relative">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                { label }
            </label>
            <Select
                isDisabled={ disabled }
                value={ selectedRouteVariant ? {
                    value: selectedRouteVariant.routeVariantId,
                    label: `${selectedRouteVariant.routeVariantId} - ${selectedRouteVariant.routeLongName}`
                } : null }
                onChange={ (selectedOption) => {
                    if (selectedOption) {
                        const selectedVariant = routeVariants.find(
                            variant => variant.routeVariantId === selectedOption.value,
                        );
                        onSelectVariant(selectedVariant);
                    } else {
                        onSelectVariant(null);
                    }
                } }
                options={Object.entries(groupedByRoute).map(([routeShortName, variants]) => {
                    // Group variants by directionId within each route
                    const inboundVariants = variants.filter(variant => variant.directionId === 0);
                    const outboundVariants = variants.filter(variant => variant.directionId === 1);

                    const options = [];
                    
                    // Add inbound group
                    if (inboundVariants.length > 0) {
                        options.push({
                            label: `Route ${routeShortName} Inbound/Anticlockwise`,
                            options: inboundVariants.map(variant => ({
                                value: variant.routeVariantId,
                                label: `${variant.routeVariantId} - ${variant.routeLongName}`,
                                isDisabled: variant.hasTripModifications === true
                            }))
                        });
                    }
                    
                    // Add outbound group
                    if (outboundVariants.length > 0) {
                        options.push({
                            label: `Route ${routeShortName} Outbound/Clockwise`,
                            options: outboundVariants.map(variant => ({
                                value: variant.routeVariantId,
                                label: `${variant.routeVariantId} - ${variant.routeLongName}`,
                                isDisabled: variant.hasTripModifications === true
                            }))
                        });
                    }
                    
                    return options;
                }).flat()}
                placeholder="Select a route variant"
                styles={{
                    control: (base) => ({
                        ...base,
                        zIndex: 999999
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 999999
                    })
                }}
            />
        </div>
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
