import React from 'react';
import { shallow } from 'enzyme';
import { PassengerImpactDrawer } from './PassengerImpactDrawer';

describe('PassengerImpactDrawer', () => {
    const mockDisruptionData = {
        disruptionData: {
            startTime: '08:22',
            startDate: '15/03/2023',
            endTime: '',
            endDate: '',
            impact: 'SERVICES_REPLACED_BY_ALTERNATIVE_TRANSPORT',
            cause: 'PROTEST',
            affectedEntities: [
                {
                    routeId: '20202',
                    routeType: 3,
                    routeShortName: '20',
                    agencyName: 'New Zealand Bus',
                    agencyId: 'NZB',
                    text: '20',
                    category: {
                        type: 'route',
                        icon: '',
                        label: 'Routes',
                    },
                    icon: 'Bus',
                    valueKey: 'routeId',
                    labelKey: 'routeShortName',
                    type: 'route',
                    shapeWkt: 'LINESTRING(174.7327 36.88165,174.73274 36.88168,)',
                    routeColor: null,
                },
            ],
            mode: '',
            status: 'notstarted',
            header: 'Test',
            description: '',
            url: '',
            createNotification: false,
            exemptAffectedTrips: false,
            recurrent: false,
            duration: '',
            recurrencePattern: {
                freq: 2,
            },
            disruptionType: 'Routes',
            severity: 'SERIOUS',
        },
    };

    const onUpdatePassengerImpactData = jest.fn();

    it('should render without errors', () => {
        const wrapper = shallow(<PassengerImpactDrawer disruptionData={ mockDisruptionData } onUpdatePassengerImpactData={ onUpdatePassengerImpactData } />);
        expect(wrapper.exists()).toBe(true);
    });

    it('loading spinner should display when rendering', () => {
        const wrapper = shallow(<PassengerImpactDrawer disruptionData={ mockDisruptionData } onUpdatePassengerImpactData={ onUpdatePassengerImpactData } />);
        const loading = wrapper.find('.loading-spinner');
        expect(loading.exists()).toBe(true);
    });
});
