/**
 * @jest-environment jsdom
 */

import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { useSelector, useDispatch } from 'react-redux';
import { getDisruption as getDisruptionAPI } from '../../../../../utils/transmitters/disruption-mgt-api';
import { updateIncidentToEdit as updateIncidentToEditAction } from '../../../../../redux/actions/control/incidents';
import { updateDisruptionWithFetchData, useDiversionDisruptionRefetcher } from './EditEffectPanelHooks';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));

jest.mock('../../../../../utils/transmitters/disruption-mgt-api', () => ({
    getDisruption: jest.fn(),
}));

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    updateIncidentToEdit: jest.fn(payload => ({ type: 'MOCK_UPDATE', payload })),
}));

describe('EditEffectPanelHooks', () => {
    describe('useDiversionDisruptionRefetcher', () => {
        const dispatchMock = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
            useDispatch.mockReturnValue(dispatchMock);
        });

        it('fetches disruption when refetch flag set and dispatches merged incident', async () => {
            const disruption = {
                disruptionId: 'd-123',
                incidentNo: 'INC-1',
                affectedEntities: {
                    affectedRoutes: [
                        { routeId: '101', shapeWkt: 'LINESTRING(0 0, 1 1)' },
                    ],
                    affectedStops: [],
                },
            };

            const incidentToEdit = {
                disruptions: [
                    { incidentNo: 'INC-1', affectedEntities: { affectedRoutes: [], affectedStops: [] } },
                    { incidentNo: 'INC-2', affectedEntities: { affectedRoutes: [], affectedStops: [] } },
                ],
            };

            const fetchedDisruption = {
                incidentNo: 'INC-1',
                affectedEntities: [
                    { routeId: '101', routeShortName: '101' },
                ],
            };

            useSelector.mockReturnValue(incidentToEdit);
            getDisruptionAPI.mockResolvedValue(fetchedDisruption);

            const setIsLoadingDisruption = jest.fn();
            const updateDisruptionState = jest.fn();

            const TestHarness = () => {
                const hook = useDiversionDisruptionRefetcher({
                    setIsLoadingDisruption,
                    disruption,
                    isDiversionManagerOpen: false,
                    updateDisruptionState,
                });

                useEffect(() => {
                    hook.setShouldRefetchDiversions(true);
                }, [hook]);

                return null;
            };

            render(<TestHarness />);

            await waitFor(() => expect(updateDisruptionState).toHaveBeenCalledTimes(1));

            const mergedDisruption = updateDisruptionState.mock.calls[0][0];

            expect(mergedDisruption.affectedEntities.affectedRoutes).toEqual([
                {
                    routeId: '101',
                    routeShortName: '101',
                    shapeWkt: 'LINESTRING(0 0, 1 1)',
                },
            ]);

            expect(setIsLoadingDisruption).toHaveBeenCalledWith(true);
            expect(setIsLoadingDisruption).toHaveBeenCalledWith(false);

            expect(dispatchMock).toHaveBeenCalledWith(
                updateIncidentToEditAction({
                    ...incidentToEdit,
                    disruptions: [
                        fetchedDisruption, // redux update uses fetched disruption (without merged shapeWkt)
                        incidentToEdit.disruptions[1],
                    ],
                }),
            );
        });
    });

    describe('updateDisruptionWithFetchData', () => {
        it('should merge shapeWkt from current disruption into fetched disruption using Map', () => {
            // Setup current disruption with routes that have shapeWkt
            const disruption = {
                affectedEntities: {
                    affectedRoutes: [
                        {
                            routeId: '101-202',
                            routeShortName: '101',
                            routeType: 3,
                            shapeWkt: 'LINESTRING(0 0, 1 1)',
                        },
                        {
                            routeId: '105-202',
                            routeShortName: '105',
                            routeType: 3,
                            shapeWkt: 'LINESTRING(2 2, 3 3)',
                        },
                    ],
                    affectedStops: [],
                },
            };

            // Setup fetched disruption with routes that lack shapeWkt
            const fetchedDisruption = {
                affectedEntities: [
                    { routeId: '101-202', routeShortName: '101', routeType: 3 },
                    { routeId: '105-202', routeShortName: '105', routeType: 3 },
                    { routeId: '999-202', routeShortName: '999', routeType: 3 }, // Route not in current disruption
                ],
            };

            const updateDisruptionState = jest.fn();

            updateDisruptionWithFetchData(
                fetchedDisruption,
                disruption,
                updateDisruptionState,
            );

            expect(updateDisruptionState).toHaveBeenCalledTimes(1);

            const merged = updateDisruptionState.mock.calls[0][0];

            expect(merged.affectedEntities.affectedRoutes).toEqual([
                {
                    routeId: '101-202',
                    routeShortName: '101',
                    routeType: 3,
                    shapeWkt: 'LINESTRING(0 0, 1 1)', // shapeWkt merged from current disruption
                },
                {
                    routeId: '105-202',
                    routeShortName: '105',
                    routeType: 3,
                    shapeWkt: 'LINESTRING(2 2, 3 3)', // shapeWkt merged from current disruption
                },
                {
                    routeId: '999-202',
                    routeShortName: '999',
                    routeType: 3,
                    shapeWkt: undefined, // No matching route in current disruption
                },
            ]);
        });

        it('should return null when fetchedDisruption is null', () => {
            const disruption = {
                affectedEntities: {
                    affectedRoutes: [{ routeId: '101-202', shapeWkt: 'LINESTRING(0 0, 1 1)' }],
                    affectedStops: [],
                },
            };

            const updateDisruptionState = jest.fn();

            const result = updateDisruptionWithFetchData(null, disruption, updateDisruptionState);

            expect(result).toBeUndefined();
            expect(updateDisruptionState).not.toHaveBeenCalled();
        });
    });
});
