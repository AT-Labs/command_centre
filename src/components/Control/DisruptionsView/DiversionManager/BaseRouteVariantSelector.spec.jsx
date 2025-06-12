/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseRouteVariantSelector from './BaseRouteVariantSelector';

const routeVariantsList = [
    { routeVariantId: 'rv1', routeLongName: 'Route 1', color: 'red' },
    { routeVariantId: 'rv2', routeLongName: 'Route 2', color: 'blue' },
];

describe('<BaseRouteVariantSelector />', () => {
    let onSelectVariant;
    let onVisibilityChanged;

    beforeEach(() => {
        onSelectVariant = jest.fn();
        onVisibilityChanged = jest.fn();

        render(
            <BaseRouteVariantSelector
                disabled={ false }
                editMode="ADD"
                routeVariantsList={ routeVariantsList }
                selectedRouteVariant={ routeVariantsList[0] }
                onSelectVariant={ onSelectVariant }
                visibility
                onVisibilityChanged={ onVisibilityChanged }
            />,
        );
    });

    it('renders the select and the view checkbox', () => {
        expect(screen.getByText('Select the first route variant to define a diversion')).toBeInTheDocument();
        expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('calls onVisibilityChanged when the checkbox is clicked', () => {
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(onVisibilityChanged).toHaveBeenCalled();
    });
});
