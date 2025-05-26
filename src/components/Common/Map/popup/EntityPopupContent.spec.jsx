/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { EntityPopupContent } from './EntityPopupContent';
import '@testing-library/jest-dom';

const mockStore = configureMockStore();
const theme = createTheme();

const defaultProps = {
    causes: [],
    impacts: [],
    goToDisruptionSummary: jest.fn(),
    onExpandPopup: jest.fn(),
    onCollapsePopup: jest.fn(),
    isExpanded: false,
};

const routeEntity = {
    key: 'route-1',
    searchResultType: SEARCH_RESULT_TYPE.ROUTE.type,
    route_short_name: '10',
    routes: [
        { routeVariantName: '10A', vehicles: [{ id: 1 }] },
        { routeVariantName: '10B', vehicles: [] },
    ],
    disruptions: [],
};

const stopEntity = {
    key: 'stop-1',
    searchResultType: SEARCH_RESULT_TYPE.STOP.type,
    stop_code: '1234',
    stop_name: 'Main St',
    disruptions: [{ id: 1 }],
    routes: [],
};

const renderWithProviders = (ui, store) => render(
    <Provider store={ store }>
        <ThemeProvider theme={ theme }>{ui}</ThemeProvider>
    </Provider>,
);

describe('EntityPopupContent', () => {
    it('renders route popup content', () => {
        const store = mockStore({});
        renderWithProviders(
            <EntityPopupContent { ...defaultProps } entity={ routeEntity } />,
            store,
        );
        expect(screen.getByText('Route 10')).toBeInTheDocument();
        expect(screen.getByText('10A (1 running vehicle)')).toBeInTheDocument();
        expect(screen.queryByText('10B (0 running vehicles)')).not.toBeInTheDocument();
        expect(screen.getByText('View details')).toBeInTheDocument();
    });

    it('renders stop popup content', () => {
        const store = mockStore({});
        renderWithProviders(
            <EntityPopupContent { ...defaultProps } entity={ stopEntity } />,
            store,
        );
        expect(screen.getByText('Stop 1234')).toBeInTheDocument();
        expect(screen.getByText('Main St')).toBeInTheDocument();
        expect(screen.getByText('View details')).toBeInTheDocument();
        expect(screen.getByText('View Disruption details')).toBeInTheDocument();
    });

    it('calls onExpandPopup when "View Disruption details" is clicked', () => {
        const store = mockStore({});
        const onExpandPopup = jest.fn();
        renderWithProviders(
            <EntityPopupContent { ...defaultProps } entity={ stopEntity } onExpandPopup={ onExpandPopup } />,
            store,
        );
        fireEvent.click(screen.getByText('View Disruption details'));
        expect(onExpandPopup).toHaveBeenCalled();
    });

    it('calls onCollapsePopup when back button is clicked in expanded mode', () => {
        const store = mockStore({});
        const onCollapsePopup = jest.fn();
        renderWithProviders(
            <EntityPopupContent { ...defaultProps } entity={ stopEntity } isExpanded onCollapsePopup={ onCollapsePopup } />,
            store,
        );
        fireEvent.click(screen.getByLabelText('Back'));
        expect(onCollapsePopup).toHaveBeenCalled();
    });

    it('shows DisruptionDetails in expanded mode', () => {
        const store = mockStore({});
        renderWithProviders(
            <EntityPopupContent { ...defaultProps } entity={ stopEntity } isExpanded />,
            store,
        );
        expect(screen.getByText('1234 - Main St')).toBeInTheDocument();
    });
});
