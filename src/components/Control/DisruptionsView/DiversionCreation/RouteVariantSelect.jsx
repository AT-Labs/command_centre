import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';
import { searchRouteVariants } from '../../../../utils/transmitters/trip-mgt-api';

const RouteVariantSelect = ({ routeIds, startDate, endDate, selectedRouteVariant, onSelectVariant }) => {
    // State to store route variants from the API
    const [routeVariants, setRouteVariants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVariants = async () => {
        try {
            const search = {
                page: 1,
                limit: 1000,
                routeIds,
                ...(startDate !== null && { serviceDateFrom: startDate }),
                ...(endDate !== null && { serviceDateTo: endDate }),
            };
            setIsLoading(true);
            const response = await searchRouteVariants(search);
            setRouteVariants(response.routeVariants);
        } catch {
            setRouteVariants([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch route variants when the component mounts
    useEffect(() => {
        if (routeIds.length > 0) {
            fetchVariants();
        }
    }, [routeIds]);

    // Display a loading state while data is being fetched
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Group variants by routeShortName
    const groupedByRoute = routeVariants.reduce((acc, variant) => {
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
                Select a route variant
            </InputLabel>
            <Select
                labelId="grouped-native-select-label"
                id="grouped-native-select"
                label="Select a route variant"
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
    routeIds: PropTypes.array,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    selectedRouteVariant: PropTypes.object,
    onSelectVariant: PropTypes.func.isRequired,
};

RouteVariantSelect.defaultProps = {
    routeIds: [],
    startDate: null,
    endDate: null,
    selectedRouteVariant: {
        shapeWkt: '',
    },
};

export default RouteVariantSelect;
