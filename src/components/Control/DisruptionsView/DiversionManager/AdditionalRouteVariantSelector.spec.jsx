/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AdditionalRouteVariantSelector from './AdditionalRouteVariantSelector';

const routeVariantsList = [
    { routeVariantId: 'rv1', routeLongName: 'Route 1', color: 'red', visible: true },
    { routeVariantId: 'rv2', routeLongName: 'Route 2', color: 'blue', visible: false },
];

const selectedRouteVariants = [
    { routeVariantId: 'rv1', routeLongName: 'Route 1', color: 'red', visible: true },
];

describe('<AdditionalRouteVariantSelector />', () => {
    let onSelectVariant;
    let onVisibilityChange;
    let onRouteVariantRemoved;

    beforeEach(() => {
        onSelectVariant = jest.fn();
        onVisibilityChange = jest.fn();
        onRouteVariantRemoved = jest.fn();

        render(
            <AdditionalRouteVariantSelector
                routeVariantsList={ routeVariantsList }
                selectedRouteVariants={ selectedRouteVariants }
                onSelectVariant={ onSelectVariant }
                onVisibilityChange={ onVisibilityChange }
                onRouteVariantRemoved={ onRouteVariantRemoved }
            />,
        );
    });

    it('renders the select and selected variants', () => {
        expect(
            screen.getByText('Select the other route variant(s) to apply the defined diversion'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('rv1 - Route 1'),
        ).toBeInTheDocument();
        expect(screen.getByText('View')).toBeInTheDocument();
        expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('calls onVisibilityChange when the checkbox is clicked', () => {
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(onVisibilityChange).toHaveBeenCalledWith('rv1');
    });

    it('calls onRouteVariantRemoved when Remove is clicked', () => {
        const removeButton = screen.getByText('Remove');
        fireEvent.click(removeButton);
        expect(onRouteVariantRemoved).toHaveBeenCalledWith('rv1');
    });
});
