/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import DisruptionExpandedDetail from './index';
import * as selectors from '../../../../redux/selectors/control/disruptions';

jest.mock('./DisruptionDetailView', () => () => <div data-testid="detail-view" />);
jest.mock('./Readonly', () => () => <div data-testid="readonly-view" />);

const mockStore = configureStore([]);

describe('DisruptionExpandedDetail', () => {
    let store;
    let defaultProps;

    beforeEach(() => {
        store = mockStore({
            control: {
                disruptions: {
                    activeStep: 1,
                    action: {
                        resultDisruptionId: null,
                        isRequesting: false,
                        resultStatus: null,
                        resultMessage: null,
                        resultCreateNotification: false,
                        isCopied: false,
                    },
                },
                dataManagement: {
                    stopGroupsIncludingDeleted: {},
                },
            },
        });
        defaultProps = {
            disruption: { disruptionId: 1 },
            resultStatus: null,
            resultMessage: null,
            resultDisruptionId: null,
            resultCreateNotification: false,
            isCopied: false,
            updateDisruption: jest.fn(),
            clearDisruptionActionResult: jest.fn(),
            updateCopyDisruptionState: jest.fn(),
            uploadDisruptionFiles: jest.fn(),
            deleteDisruptionFile: jest.fn(),
        };
    });

    it('renders Readonly view if update not allowed', () => {
        jest.spyOn(selectors, 'isDisruptionUpdateAllowed').mockReturnValue(false);

        render(
            <Provider store={ store }>
                <DisruptionExpandedDetail { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByTestId('readonly-view')).toBeInTheDocument();
    });

    it('renders DisruptionDetailView when update is allowed', () => {
        jest.spyOn(selectors, 'isDisruptionUpdateAllowed').mockReturnValue(true);

        render(
            <Provider store={ store }>
                <DisruptionExpandedDetail { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByTestId('detail-view')).toBeInTheDocument();
    });

    it('toggles magnify view when button is clicked', () => {
        jest.spyOn(selectors, 'isDisruptionUpdateAllowed').mockReturnValue(true);

        render(
            <Provider store={ store }>
                <DisruptionExpandedDetail { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(button.className).toContain('magnify');
    });

    it('shows success message when resultCreateNotification is true', () => {
        jest.spyOn(selectors, 'isDisruptionUpdateAllowed').mockReturnValue(true);
        const storeWithCreationNotification = mockStore({
            control: {
                disruptions: {
                    disruptions: [{ disruptionId: 1 }],
                    activeStep: 1,
                    action: {
                        resultDisruptionId: 1,
                        isRequesting: false,
                        resultStatus: 'success',
                        resultMessage: 'Updated',
                        resultCreateNotification: true,
                        isCopied: false,
                    },
                },
                dataManagement: {
                    stopGroupsIncludingDeleted: {},
                },
            },
        });
        render(
            <Provider store={ storeWithCreationNotification }>
                <DisruptionExpandedDetail
                    { ...defaultProps }
                    resultStatus="success"
                    resultMessage="Updated"
                    resultDisruptionId={ 1 }
                    resultCreateNotification
                    disruption={ { disruptionId: 1 } }
                />
            </Provider>,
        );

        expect(screen.getByText(/Draft stop message has been created/)).toBeInTheDocument();
    });

    it('shows copied message if isCopied is true', () => {
        jest.spyOn(selectors, 'isDisruptionUpdateAllowed').mockReturnValue(true);
        const storeWithCopyState = mockStore({
            control: {
                disruptions: {
                    activeStep: 1,
                    action: {
                        resultDisruptionId: null,
                        isRequesting: false,
                        resultStatus: null,
                        resultMessage: null,
                        resultCreateNotification: false,
                        isCopied: true,
                    },
                },
                dataManagement: {
                    stopGroupsIncludingDeleted: {},
                },
            },
        });
        render(
            <Provider store={ storeWithCopyState }>
                <DisruptionExpandedDetail
                    { ...defaultProps }
                    isCopied
                />
            </Provider>,
        );

        expect(screen.getByText(/Disruption copied to clipboard/)).toBeInTheDocument();
    });
});
