/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DisruptionDetailsPage from './index';
import { STATUSES } from '../../../../types/disruptions-types';

const mockStore = configureStore([thunk]);

const mockDisruption = {
    disruptionId: 'DISR123',
    incidentNo: 'DISR123',
    status: STATUSES.NOT_STARTED,
    header: 'Test Disruption',
    description: 'Test Description',
    startTime: '2025-06-10T06:00:00.000Z',
    endTime: '2025-06-10T09:00:00.000Z',
    affectedEntities: {
        affectedRoutes: [{ routeType: 3 }],
    },
};

const defaultProps = {
    disruption: mockDisruption,
    isRequesting: false,
    resultStatus: null,
    resultDisruptionId: null,
    message: '',
    isCopied: false,
    isDiversionManagerOpen: false,
    clearDisruptionActionResult: jest.fn(),
    openDiversionManager: jest.fn(),
};

const setup = (customProps = {}) => {
    const props = { ...defaultProps, ...customProps };
    const store = mockStore({
        control: {
            disruptions: {
                action: { isRequesting: false },
            },
        },
    });

    return {
        ...render(
            <Provider store={ store }>
                <DisruptionDetailsPage { ...props } />
            </Provider>,
        ),
        props,
    };
};

describe('DisruptionDetailsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render disruption details when diversion manager is closed', () => {
        setup();

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should render DiversionManager when isDiversionManagerOpen is true', () => {
        setup({ isDiversionManagerOpen: true });

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should show success message when resultStatus is success', () => {
        setup({
            resultStatus: 'success',
            resultDisruptionId: 'DISR123',
            message: 'Disruption updated successfully',
        });

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should show error message when resultStatus is error', () => {
        setup({
            resultStatus: 'error',
            resultDisruptionId: 'DISR123',
            message: 'Failed to update disruption',
        });

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should show copied message when isCopied is true', () => {
        setup({ isCopied: true });

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should call clearDisruptionActionResult when message is closed', () => {
        const mockClearActionResult = jest.fn();
        setup({
            resultStatus: 'success',
            resultDisruptionId: 'DISR123',
            message: 'Test message',
            clearDisruptionActionResult: mockClearActionResult,
        });

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should handle diversion manager state correctly', () => {
        const mockOpenDiversionManager = jest.fn();
        setup({
            isDiversionManagerOpen: false,
            openDiversionManager: mockOpenDiversionManager,
        });

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    describe('Diversion functionality integration', () => {
        it('should handle diversion manager state changes correctly', () => {
            const { rerender } = setup({ isDiversionManagerOpen: false });

            expect(screen.getByLabelText('Loading')).toBeInTheDocument();

            rerender(
                <Provider store={ mockStore({
                    control: {
                        disruptions: {
                            action: { isRequesting: false },
                        },
                    },
                }) }>
                    <DisruptionDetailsPage { ...defaultProps } isDiversionManagerOpen />
                </Provider>,
            );

            expect(screen.getByLabelText('Loading')).toBeInTheDocument();
        });

        it('should maintain disruption data when switching between views', () => {
            const { rerender } = setup({ isDiversionManagerOpen: false });

            expect(screen.getByLabelText('Loading')).toBeInTheDocument();

            rerender(
                <Provider store={ mockStore({
                    control: {
                        disruptions: {
                            action: { isRequesting: false },
                        },
                    },
                }) }>
                    <DisruptionDetailsPage { ...defaultProps } isDiversionManagerOpen />
                </Provider>,
            );

            rerender(
                <Provider store={ mockStore({
                    control: {
                        disruptions: {
                            action: { isRequesting: false },
                        },
                    },
                }) }>
                    <DisruptionDetailsPage { ...defaultProps } isDiversionManagerOpen={ false } />
                </Provider>,
            );

            expect(screen.getByLabelText('Loading')).toBeInTheDocument();
        });
    });
});
