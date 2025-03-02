import React from 'react';
import { render } from '@testing-library/react';
import { CarsTooltipContent } from './CarsTooltipContent';

describe('CarsPopupContent', () => {
    const mockProperties = {
        WorksiteCode: '123',
        PrincipalOrganisation: 'Test Organisation',
        ProjectName: 'Test Project',
        WorksiteName: 'Test Worksite',
        Status: 'Active',
        WorkStatus: 'In Progress',
        WorksiteType: 'Construction',
        ProjectStartDate: '2023-01-01T00:00:00Z',
        ProjectEndDate: '2023-12-31T00:00:00Z',
        WorkStartDate: '2023-01-15T00:00:00Z',
        WorkCompletionDate: '2023-06-30T00:00:00Z',
    };

    it('should render all properties correctly', () => {
        const { getByText } = render(<CarsTooltipContent properties={ mockProperties } />);

        // Summary Part
        expect(getByText('Organisation:').parentElement.textContent).toEqual('Organisation: Test Organisation');
        expect(getByText('Project Name:').parentElement.textContent).toEqual('Project Name: Test Project');
        expect(getByText('Worksite Name:').parentElement.textContent).toEqual('Worksite Name: Test Worksite');

        // Detail Part
        expect(getByText('Worksite Type').parentElement.textContent).toEqual('Worksite TypeConstruction');
        expect(getByText('CAR ID Number').parentElement.textContent).toEqual('CAR ID Number123');
        expect(getByText('CAR Status').parentElement.textContent).toEqual('CAR StatusActive');
        expect(getByText('Status Detail').parentElement.textContent).toEqual('Status DetailIn Progress');
        expect(getByText('Project Start Date').parentElement.textContent).toEqual('Project Start Date01/01/2023');
        expect(getByText('Project End Date').parentElement.textContent).toEqual('Project End Date31/12/2023');
        expect(getByText('Work Start Date').parentElement.textContent).toEqual('Work Start Date15/01/2023');
        expect(getByText('Work Completion Date').parentElement.textContent).toEqual('Work Completion Date30/06/2023');
    });

    it('should render "N/A" for missing WorkCompletionDate', () => {
        const { getByText } = render(
            <CarsTooltipContent properties={ { ...mockProperties, WorkCompletionDate: null } } />,
        );

        expect(getByText('Work Completion Date').parentElement.textContent).toEqual('Work Completion Date-');
    });
});
