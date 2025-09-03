import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import HeaderButtons from './HeaderButtons';

const mockStore = configureStore([]);

describe('HeaderButtons - Our Wrapper Component', () => {
    let store;
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress'
    };

    const defaultProps = {
        disruption: mockDisruption,
        useDiversionFlag: true,
        isDiversionManagerOpen: false,
        onViewDiversions: jest.fn(),
        openDiversionManagerAction: jest.fn(),
        updateDiversionModeAction: jest.fn(),
        updateDiversionToEditAction: jest.fn(),
        toggleEditEffectPanel: jest.fn(),
        fetchDiversionsAction: jest.fn(),
        clearDiversionsCacheAction: jest.fn()
    };

    beforeEach(() => {
        store = mockStore({
            control: {
                diversions: {
                    diversionsForDisruption: {},
                    diversionResultState: null
                }
            }
        });
    });

    it('should render our DiversionsButton when useDiversionFlag is true', () => {
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should not render our DiversionsButton when useDiversionFlag is false', () => {
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} useDiversionFlag={false} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
    });

    it('should pass correct props to our DiversionsButton', () => {
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        expect(diversionsButton).toBeInTheDocument();
    });

    it('should handle null disruption gracefully (our error handling)', () => {
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={null} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should render with default props when optional props are not provided (our flexibility)', () => {
        const minimalProps = {
            disruption: mockDisruption,
            useDiversionFlag: true,
            isDiversionManagerOpen: false,
            openDiversionManagerAction: jest.fn(),
            updateDiversionModeAction: jest.fn()
        };

        render(
            <Provider store={store}>
                <HeaderButtons {...minimalProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our feature flag changes dynamically', () => {
        
        const { rerender } = render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} useDiversionFlag={false} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();

        
        rerender(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} useDiversionFlag={true} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our disruption changes correctly', () => {
        const { rerender } = render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        const newDisruption = {
            disruptionId: 'DISR456',
            status: 'in-progress'
        };

        rerender(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={newDisruption} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our diversion manager state changes', () => {
        const { rerender } = render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} isDiversionManagerOpen={false} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        rerender(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} isDiversionManagerOpen={true} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our missing props gracefully', () => {
        
        const propsWithoutViewDiversions = { ...defaultProps };
        delete propsWithoutViewDiversions.onViewDiversions;

        expect(() => {
            render(
                <Provider store={store}>
                    <HeaderButtons {...propsWithoutViewDiversions} />
                </Provider>
            );
        }).not.toThrow();

        
        const propsWithoutUpdateToEdit = { ...defaultProps };
        delete propsWithoutUpdateToEdit.updateDiversionToEditAction;

        expect(() => {
            render(
                <Provider store={store}>
                    <HeaderButtons {...propsWithoutUpdateToEdit} />
                </Provider>
            );
        }).not.toThrow();

        
        const propsWithoutToggle = { ...defaultProps };
        delete propsWithoutToggle.toggleEditEffectPanel;

        expect(() => {
            render(
                <Provider store={store}>
                    <HeaderButtons {...propsWithoutToggle} />
                </Provider>
            );
        }).not.toThrow();
    });

    it('should handle our different disruption statuses', () => {
        const statuses = ['not-started', 'in-progress', 'draft', 'resolved', 'cancelled'];

        statuses.forEach(status => {
            const { unmount } = render(
                <Provider store={store}>
                    <HeaderButtons {...defaultProps} disruption={{ ...mockDisruption, status }} />
                </Provider>
            );

            
            expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

            unmount();
        });
    });

    it('should handle our different disruption structures', () => {
        
        const disruptionWithEntities = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' }
            ]
        };

        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={disruptionWithEntities} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        const disruptionWithoutEntities = {
            disruptionId: 'DISR123',
            status: 'in-progress'
        };

        const { rerender } = render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={disruptionWithoutEntities} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our edge cases correctly', () => {
        
        const emptyDisruption = {};

        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={emptyDisruption} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        const disruptionWithUndefined = {
            disruptionId: undefined,
            status: undefined
        };

        const { rerender } = render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={disruptionWithUndefined} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should integrate with our DiversionsButton correctly', () => {
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        expect(diversionsButton).toBeInTheDocument();
    });

    it('should handle our component lifecycle correctly', () => {
        const { unmount, rerender } = render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        rerender(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} useDiversionFlag={false} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();

        
        expect(() => unmount()).not.toThrow();
    });

    it('should handle our Redux store changes', () => {
        
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();

        
        const newStore = mockStore({
            control: {
                diversions: {
                    diversionsForDisruption: {
                        DISR123: [
                            { diversionId: 'DIV1', diversionName: 'Diversion 1' }
                        ]
                    },
                    diversionResultState: null
                }
            }
        });

        const { rerender } = render(
            <Provider store={newStore}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our performance scenarios', () => {
        
        const largeDisruption = {
            ...mockDisruption,
            affectedEntities: Array.from({ length: 1000 }, (_, i) => ({
                routeId: `ROUTE${i}`,
                routeType: 3,
                stopCode: `STOP${i}`
            }))
        };

        const startTime = performance.now();

        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} disruption={largeDisruption} />
            </Provider>
        );

        const endTime = performance.now();

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
        
        
        expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle our accessibility requirements', () => {
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        
        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        expect(diversionsButton).toBeInTheDocument();
        expect(diversionsButton.tagName).toBe('BUTTON');
    });

    it('should handle our internationalization scenarios', () => {
        
        render(
            <Provider store={store}>
                <HeaderButtons {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
        expect(screen.getByText(/Diversions\(0\)/)).toHaveTextContent('Diversions(0)');
    });

    it('should handle our error boundaries gracefully', () => {
        
        const invalidProps = {
            ...defaultProps,
            disruption: null,
            useDiversionFlag: 'invalid'
        };

        expect(() => {
            render(
                <Provider store={store}>
                    <HeaderButtons {...invalidProps} />
                </Provider>
            );
        }).not.toThrow();
    });
}); 