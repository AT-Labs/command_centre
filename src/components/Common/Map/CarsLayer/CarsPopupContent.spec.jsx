import React from 'react';
import { render } from '@testing-library/react';
import { CarsPopupContent } from './CarsPopupContent';

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
        const { getByText } = render(<CarsPopupContent properties={ mockProperties } />);

        expect(getByText('CAR ID Number:').parentElement.textContent).toEqual('CAR ID Number: 123');
        expect(getByText('Organisation:').parentElement.textContent).toEqual('Organisation: Test Organisation');
        expect(getByText('Project Name:').parentElement.textContent).toEqual('Project Name: Test Project');
        expect(getByText('Worksite Name:').parentElement.textContent).toEqual('Worksite Name: Test Worksite');
        expect(getByText('CAR Status:').parentElement.textContent).toEqual('CAR Status: Active');
        expect(getByText('Status Detail:').parentElement.textContent).toEqual('Status Detail: In Progress');
        expect(getByText('Worksite Type:').parentElement.textContent).toEqual('Worksite Type: Construction');
        expect(getByText('Project Start Date:').parentElement.textContent).toEqual('Project Start Date: 01-01-2023');
        expect(getByText('Project End Date:').parentElement.textContent).toEqual('Project End Date: 31-12-2023');
        expect(getByText('Work Start Date:').parentElement.textContent).toEqual('Work Start Date: 15-01-2023');
        expect(getByText('Work Completion Date:').parentElement.textContent).toEqual('Work Completion Date: 30-06-2023');
    });

    it('should render "N/A" for missing WorkCompletionDate', () => {
        const { getByText } = render(
            <CarsPopupContent properties={ { ...mockProperties, WorkCompletionDate: null } } />,
        );

        expect(getByText('Work Completion Date:').parentElement.textContent).toEqual('Work Completion Date: N/A');
    });
});
