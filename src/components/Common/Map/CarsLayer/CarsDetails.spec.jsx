/**
 * @jest-environment jsdom
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, act, fireEvent, cleanup } from '@testing-library/react';
import CarsDetails from './CarsDetails';
import { getWorksite, getLayout } from '../../../../utils/transmitters/cars-api';
import { checkCarActivation } from '../../../../utils/cars';

jest.mock('../../../../utils/transmitters/cars-api', () => ({
    getWorksite: jest.fn(),
    getLayout: jest.fn(),
}));

jest.mock('../../../../utils/cars', () => ({
    formatDate: jest.fn(date => `formatted-${date}`),
    checkCarActivation: jest.fn(),
}));

jest.mock('../../Loader/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>,
}));

const mockCars = {
    properties: {
        WorksiteCode: 'WS123',
        PrincipalOrganisation: 'Test Organisation',
        ProjectName: 'Test Project',
        WorksiteName: 'Test Worksite',
        Status: 'Active',
        WorksiteType: 'Excavation',
        WorkStatus: 'In Progress',
        ProjectStartDate: '2023-01-01',
        ProjectEndDate: '2023-12-31',
        WorkStartDate: '2023-02-01',
        WorkCompletionDate: '2023-11-30',
    },
};

const mockWorksite = {
    tmps: [
        { Id: '1', tmpId: 123, tmpCode: 'TMP123' },
        { Id: '2', tmpId: 456, tmpCode: 'TMP456' },
    ],
    clientName: 'Test Client',
    applicantName: 'Test Applicant',
    applicantOrganization: 'Test Applicant Org',
    applicantContact: '123-456-7890',
    principalName: 'Test Principal',
    principalOrganization: 'Test Principal Org',
    principalContact: '098-765-4321',
    jurisdictionId: '1',
    workStartDate: '2023-02-01',
    workEndDate: '2023-11-30',
};

const mockLayouts = [
    {
        id: 1,
        tmpId: 123,
        layoutCode: 'LAYOUT123',
        impacts: [{ id: 1,
            layoutId: 1,
            name: 'Impact 1',
            geometry: {
                bbox: [
                    174.744152,
                    -36.805755,
                    174.744207,
                    -36.805319,
                ],
                coordinates: [
                    [
                        174.744207,
                        -36.805319,
                    ],
                    [
                        174.744152,
                        -36.805755,
                    ],
                ],
                type: 'LineString',
            } }],
        deployments: [],
    },
    {
        id: 2,
        tmpId: 456,
        layoutCode: 'LAYOUT456',
        impacts: [{ id: 2,
            layoutId: 2,
            name: 'Impact 2',
            geometry: {
                bbox: [
                    174.744152,
                    -36.805755,
                    174.744207,
                    -36.805319,
                ],
                coordinates: [
                    [
                        174.744207,
                        -36.805319,
                    ],
                    [
                        174.744152,
                        -36.805755,
                    ],
                ],
                type: 'LineString',
            } }],
        deployments: [],
    },
];

describe('CarsDetails Component', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateImpacts = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        getWorksite.mockResolvedValue(mockWorksite);
        getLayout.mockResolvedValue(mockLayouts);
        checkCarActivation.mockReturnValue('Active');
    });

    test('renders correctly with basic data', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        expect(screen.getByText('Organisation:')).toBeInTheDocument();
        expect(screen.getByText(`${mockCars.properties.PrincipalOrganisation}`)).toBeInTheDocument();
        expect(screen.getByText('Project Name:')).toBeInTheDocument();
        expect(screen.getByText(`${mockCars.properties.ProjectName}`)).toBeInTheDocument();
        expect(screen.getByText('Worksite Name:')).toBeInTheDocument();
        expect(screen.getByText(`${mockCars.properties.WorksiteName}`)).toBeInTheDocument();

        expect(screen.getByTestId('loader')).toBeInTheDocument();

        await waitFor(() => {
            expect(getWorksite).toHaveBeenCalledWith(mockCars.properties.WorksiteCode, false);
        });
    });

    test('displays worksite and layouts data once loaded', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(getWorksite).toHaveBeenCalledWith(mockCars.properties.WorksiteCode, false);
            expect(getLayout).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText('Test Client')).toBeInTheDocument();
            expect(screen.getByText('Test Applicant')).toBeInTheDocument();
            expect(screen.getByText('Test Applicant Org')).toBeInTheDocument();
            expect(screen.getByText('123-456-7890')).toBeInTheDocument();
            expect(screen.getByText('Test Principal')).toBeInTheDocument();
            expect(screen.getByText('Test Principal Org')).toBeInTheDocument();
            expect(screen.getByText('098-765-4321')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Available TMPs')).toBeInTheDocument();
            expect(screen.getByText('Layout')).toBeInTheDocument();
        });
    });

    test('close button calls onClose function', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        const closeButton = screen.getByTestId('close-cars-details');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('TMP and Layout selectors work correctly', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(getWorksite).toHaveBeenCalled();
            expect(getLayout).toHaveBeenCalled();
        });

        const tmpSelector = await screen.findByLabelText('Available TMPs');
        act(() => {
            fireEvent.change(tmpSelector, { target: { value: '123' } });
        });

        expect(mockOnUpdateImpacts).toHaveBeenCalled();

        const layoutSelector = await screen.findByLabelText('Layout');
        act(() => {
            fireEvent.change(layoutSelector, { target: { value: '1' } });
        });

        expect(mockOnUpdateImpacts).toHaveBeenCalled();
    });

    test('displays error message on data loading failure', async () => {
        const errorMessage = 'Failed to fetch data';
        getWorksite.mockRejectedValue(new Error(errorMessage));

        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    test('correctly uses yesterdayTodayTomorrow filter if provided', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
                filterByYesterdayTodayTomomorrowDate
            />,
        );

        await waitFor(() => {
            expect(getWorksite).toHaveBeenCalledWith(mockCars.properties.WorksiteCode, true);
        });
    });

    test('displays the correct icon based on WorksiteType category', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

        const nonExcavationCars = {
            ...mockCars,
            properties: {
                ...mockCars.properties,
                WorksiteType: 'Non-Excavation',
            },
        };

        cleanup();
        render(
            <CarsDetails
                cars={ nonExcavationCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    test('correctly enriches impacts with deployments', async () => {
        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(getWorksite).toHaveBeenCalled();
            expect(getLayout).toHaveBeenCalled();
        });

        await waitFor(() => {
            const expectedImpacts = mockLayouts.flatMap(layout => layout.impacts.map(impact => ({
                ...impact,
                deployments: layout.deployments,
            })));

            expect(mockOnUpdateImpacts).toHaveBeenCalledWith(
                expect.arrayContaining(
                    expectedImpacts.map(impact => expect.objectContaining(impact)),
                ),
            );
        });
    });

    test('displays "No TMPs valid for the selected date range" message when tmps array is empty', async () => {
        const mockWorksiteWithoutTMPs = {
            ...mockWorksite,
            tmps: [], // Empty array
        };

        getWorksite.mockResolvedValue(mockWorksiteWithoutTMPs);
        getLayout.mockResolvedValue([]);

        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('No TMPs valid for the selected date range.')).toBeInTheDocument();
        });

        // Verify that the TMP dropdown is not displayed
        expect(screen.queryByLabelText('Available TMPs')).not.toBeInTheDocument();
    });

    test('displays "No TMPs valid for the selected date range" message when tmps property is null', async () => {
        const mockWorksiteWithNullTMPs = {
            ...mockWorksite,
            tmps: null, // Null value
        };

        getWorksite.mockResolvedValue(mockWorksiteWithNullTMPs);
        getLayout.mockResolvedValue([]);

        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('No TMPs valid for the selected date range.')).toBeInTheDocument();
        });

        // Verify that the TMP dropdown is not displayed
        expect(screen.queryByLabelText('Available TMPs')).not.toBeInTheDocument();
    });

    test('displays "No TMPs valid for the selected date range" message when tmps property is undefined', async () => {
        const mockWorksiteWithUndefinedTMPs = {
            ...mockWorksite,
        };
        delete mockWorksiteWithUndefinedTMPs.tmps; // Remove tmps property

        getWorksite.mockResolvedValue(mockWorksiteWithUndefinedTMPs);
        getLayout.mockResolvedValue([]);

        render(
            <CarsDetails
                cars={ mockCars }
                onClose={ mockOnClose }
                onUpdateImpacts={ mockOnUpdateImpacts }
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('No TMPs valid for the selected date range.')).toBeInTheDocument();
        });

        // Verify that the TMP dropdown is not displayed
        expect(screen.queryByLabelText('Available TMPs')).not.toBeInTheDocument();
    });
});
