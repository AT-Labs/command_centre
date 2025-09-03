import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

const RouteVariantSelect = ({ label, disabled, routeVariants, selectedRouteVariant, onSelectVariant, isRouteVariantDisabled, isLoadingExistingDiversions, existingDiversions }) => {
    const [forceUpdate, setForceUpdate] = React.useState(0);

    React.useEffect(() => {
        setForceUpdate(prev => prev + 1);
    }, [existingDiversions]);

    const groupedByRoute = routeVariants.filter(v => v.hidden !== true).reduce((acc, variant) => {
        const { routeShortName } = variant;
        if (!acc[routeShortName]) {
            acc[routeShortName] = [];
        }
        acc[routeShortName].push(variant);
        return acc;
    }, {});

    const selectKey = `route-variant-select-${forceUpdate}-${existingDiversions.length}-${routeVariants.length}-${selectedRouteVariant?.routeVariantId || 'none'}-${disabled ? 'disabled' : 'enabled'}-${isRouteVariantDisabled ? 'disabled' : 'enabled'}-${isLoadingExistingDiversions ? 'loading' : 'loaded'}-${label}-${Date.now()}`;

    return (
        <div className="w-100 position-relative">
            <label style={ { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }>
                { label }
            </label>
            <Select
                key={ selectKey }
                data-testid="route-variant-select"
                isDisabled={ disabled }
                value={ selectedRouteVariant ? {
                    value: selectedRouteVariant.routeVariantId,
                    label: `${selectedRouteVariant.routeVariantId} - ${selectedRouteVariant.routeLongName}`,
                } : null }
                onChange={ (selectedOption) => {
                    if (selectedOption) {
                        const selectedVariant = routeVariants.find(
                            variant => variant.routeVariantId === selectedOption.value,
                        );

                        if (selectedVariant) {
                            onSelectVariant(selectedVariant);
                        }
                    } else {
                        onSelectVariant(null);
                    }
                } }
                options={ Object.entries(groupedByRoute).map(([routeShortName, variants]) => {
                    const inboundVariants = variants.filter(variant => variant.directionId === 0);
                    const outboundVariants = variants.filter(variant => variant.directionId === 1);

                    const options = [];

                    const createOption = (variant) => {
                        const isDisabled = variant.hasTripModifications === true || (isRouteVariantDisabled && isRouteVariantDisabled(variant));
                        const option = {
                            value: variant.routeVariantId,
                            label: `${variant.routeVariantId} - ${variant.routeLongName}${isDisabled ? ' (Already has diversion)' : ''}`,
                            isDisabled,
                        };
                        return option;
                    };

                    if (inboundVariants.length > 0) {
                        const inboundOptions = inboundVariants.map(createOption);
                        options.push({
                            label: `Route ${routeShortName} Inbound/Anticlockwise`,
                            options: inboundOptions,
                        });
                    }

                    if (outboundVariants.length > 0) {
                        const outboundOptions = outboundVariants.map(createOption);
                        options.push({
                            label: `Route ${routeShortName} Outbound/Clockwise`,
                            options: outboundOptions,
                        });
                    }

                    return options;
                }).flat() }
                placeholder="Select a route variant"
                isOptionDisabled={ (option) => {
                    const variant = routeVariants.find(v => v.routeVariantId === option.value);
                    if (!variant) {
                        return false;
                    }

                    const isDisabled = variant.hasTripModifications === true
                        || (isRouteVariantDisabled && isRouteVariantDisabled(variant));

                    return isDisabled;
                } }
                styles={ {
                    option: (provided, state) => {
                        const variant = routeVariants.find(v => v.routeVariantId === state.data?.value);
                        const isDisabled = variant && (variant.hasTripModifications === true
                            || (isRouteVariantDisabled && isRouteVariantDisabled(variant)));

                        return {
                            ...provided,
                            color: isDisabled ? '#999' : '#333',
                            backgroundColor: isDisabled ? '#f5f5f5' : state.isFocused ? '#e6f3ff' : 'white',
                            cursor: isDisabled ? 'not-allowed' : 'default',
                            opacity: isDisabled ? 0.6 : 1,
                            textDecoration: isDisabled ? 'line-through' : 'none',
                        };
                    },
                    singleValue: (provided, state) => {
                        const variant = routeVariants.find(v => v.routeVariantId === state.data?.value);
                        const isDisabled = variant && (variant.hasTripModifications === true
                            || (isRouteVariantDisabled && isRouteVariantDisabled(variant)));

                        return {
                            ...provided,
                            color: isDisabled ? '#999' : '#333',
                        };
                    },
                } }
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
    isRouteVariantDisabled: PropTypes.func,
    isLoadingExistingDiversions: PropTypes.bool,
    existingDiversions: PropTypes.array,
};

RouteVariantSelect.defaultProps = {
    label: 'Select a route variant',
    disabled: false,
    routeVariants: [],
    selectedRouteVariant: {
        shapeWkt: '',
    },
    isRouteVariantDisabled: null,
    isLoadingExistingDiversions: false,
    existingDiversions: [],
};

export default RouteVariantSelect;
