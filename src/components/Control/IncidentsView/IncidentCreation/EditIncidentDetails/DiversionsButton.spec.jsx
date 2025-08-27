/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./DiversionsButton.scss', () => ({}));

jest.mock('../../../../../assets/img/detour.svg', () => 'detour-icon.svg');

jest.mock('../../../../../redux/selectors/appSettings', () => ({
    useDiversion: jest.fn(),
}));

jest.mock('../../../../../redux/selectors/control/diversions', () => ({
    getIsDiversionManagerOpen: jest.fn(),
    getDiversionsForDisruption: jest.fn((disruptionId) => (state) => {
        const diversionsData = state.diversionsData || {};
        return diversionsData[disruptionId] || [];
    }),
}));

jest.mock('../../../../../redux/actions/control/diversions', () => ({
    openDiversionManager: jest.fn(),
    updateDiversionMode: jest.fn(),
    fetchDiversions: jest.fn(),
}));

const DiversionsButton = require('./DiversionsButton').default.WrappedComponent || require('./DiversionsButton').default;

describe('DiversionsButton Unit Tests (No Redux)', () => {
    const defaultProps = {
        disruption: {
            disruptionId: 'DISR123',
            status: 'in-progress',
            startTime: '2024-01-01T10:00:00Z',
            endTime: '2024-01-01T18:00:00Z',
            affectedEntities: [
                {
                    routeId: 'ROUTE1',
                    routeType: 3, // Bus route
                    routeName: 'Test Route 1',
                },
            ],
        },
        openDiversionManagerAction: jest.fn(),
        updateDiversionModeAction: jest.fn(),
        useDiversionFlag: true,
        onViewDiversions: jest.fn(),
        isDiversionManagerOpen: false,
        toggleEditEffectPanel: jest.fn(),
        fetchDiversionsAction: jest.fn(),
        state: {
            useDiversionFlag: true,
            isDiversionManagerOpen: false,
            diversionsData: {
                DISR123: [],
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Diversion(0) Button Rendering', () => {
        it('should render the button with "Diversions(0)" text when no diversions exist', () => {
            render(<DiversionsButton {...defaultProps} />);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('Diversions(0)');
        });

        it('should render the button with correct styling', () => {
            render(<DiversionsButton {...defaultProps} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveClass('diversions-button');
            expect(button).not.toBeDisabled();
        });

        it('should display the detour icon', () => {
            render(<DiversionsButton {...defaultProps} />);
            
            const icon = screen.getByRole('img');
            expect(icon).toHaveAttribute('src', 'detour-icon.svg');
            expect(icon).toHaveAttribute('alt', 'detour');
            expect(icon).toHaveAttribute('width', '26');
            expect(icon).toHaveAttribute('height', '26');
        });

        it('should not render when useDiversionFlag is false', () => {
            render(<DiversionsButton {...defaultProps} useDiversionFlag={false} />);
            
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('Diversion(0) Button Interaction', () => {
        it('should open dropdown menu when button is clicked', () => {
            render(<DiversionsButton {...defaultProps} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            expect(screen.getByText('Add Diversion')).toBeInTheDocument();
            expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
        });

        it('should call add diversion actions when "Add Diversion" is clicked', () => {
            render(<DiversionsButton {...defaultProps} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            fireEvent.click(addDiversionOption);
            
            expect(defaultProps.updateDiversionModeAction).toHaveBeenCalledWith('CREATE');
            expect(defaultProps.openDiversionManagerAction).toHaveBeenCalledWith(true);
        });

        it('should call onViewDiversions when "View & Edit Diversions" is clicked', () => {
            const mockOnViewDiversions = jest.fn();
            render(<DiversionsButton {...defaultProps} onViewDiversions={mockOnViewDiversions} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const viewDiversionsOption = screen.getByText('View & Edit Diversions');
            fireEvent.click(viewDiversionsOption);
            
            expect(mockOnViewDiversions).toHaveBeenCalled();
        });

        it('should close EditEffectPanel when adding diversion', async () => {
            render(<DiversionsButton {...defaultProps} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            fireEvent.click(addDiversionOption);
            
            await waitFor(() => {
                expect(defaultProps.toggleEditEffectPanel).toHaveBeenCalledWith(false);
            }, { timeout: 200 });
        });
    });

    describe('Diversion(0) Button Edge Cases', () => {
        it('should handle disruption without affectedEntities', () => {
            render(<DiversionsButton 
                {...defaultProps} 
                disruption={{
                    ...defaultProps.disruption,
                    affectedEntities: null,
                }}
            />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            expect(addDiversionOption).toHaveStyle({ opacity: '0.5' });
        });

        it('should handle disruption with empty affectedEntities', () => {
            render(<DiversionsButton 
                {...defaultProps} 
                disruption={{
                    ...defaultProps.disruption,
                    affectedEntities: [],
                }}
            />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            expect(addDiversionOption).toHaveStyle({ opacity: '0.5' });
        });

        it('should handle disruption without start/end time', () => {
            render(<DiversionsButton 
                {...defaultProps} 
                disruption={{
                    ...defaultProps.disruption,
                    startTime: null,
                    endTime: null,
                }}
            />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            expect(addDiversionOption).toHaveStyle({ opacity: '0.5' });
        });

        it('should handle disruption with non-allowed status', () => {
            render(<DiversionsButton 
                {...defaultProps} 
                disruption={{
                    ...defaultProps.disruption,
                    status: 'completed',
                }}
            />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            expect(addDiversionOption).toHaveStyle({ opacity: '0.5' });
        });

        it('should handle disruption with only train routes', () => {
            render(<DiversionsButton 
                {...defaultProps} 
                disruption={{
                    ...defaultProps.disruption,
                    affectedEntities: [
                        {
                            routeId: 'ROUTE1',
                            routeType: 1,
                            routeName: 'Test Train Route',
                        },
                    ],
                }}
            />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            const addDiversionOption = screen.getByText('Add Diversion');
            expect(addDiversionOption).toHaveStyle({ opacity: '0.5' });
        });
    });

    describe('Diversion Count Display', () => {
        it('should display correct count when diversions exist', () => {
            const propsWithDiversions = {
                ...defaultProps,
                state: {
                    ...defaultProps.state,
                    diversionsData: {
                        DISR123: [
                            { diversionId: 'DIV1' },
                            { diversionId: 'DIV2' },
                        ],
                    },
                },
            };

            render(<DiversionsButton {...propsWithDiversions} />);
            
            expect(screen.getByText('Diversions(2)')).toBeInTheDocument();
        });

        it('should display zero count when no diversions exist', () => {
            render(<DiversionsButton {...defaultProps} />);
            
            expect(screen.getByText('Diversions(0)')).toBeInTheDocument();
        });

        it('should handle undefined diversions gracefully', () => {
            const propsWithEmptyData = {
                ...defaultProps,
                state: {
                    ...defaultProps.state,
                    diversionsData: {},
                },
            };

            render(<DiversionsButton {...propsWithEmptyData} />);
            
            expect(screen.getByText('Diversions(0)')).toBeInTheDocument();
        });
    });
}); 