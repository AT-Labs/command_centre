import React from 'react';
import { shallow } from 'enzyme';
import { withHooks } from 'jest-react-hooks-shallow';
import { act } from 'react-dom/test-utils';
import moment from 'moment';
import { DATE_FORMAT_DDMMYYYY } from '../../../../../utils/dateUtils';
import { SearchTrip } from './SearchTrip';

const componentPropsMock = {
    data: { route: { routeId: '123' }, startTimeFrom: '13/09/2023', startTimeTo: '', agency: { agencyId: '123' } },
    onStepUpdate: jest.fn(),
    onSubmit: jest.fn(),
    updateEnabledAddTripModal: jest.fn(),
    header: 'header',
    toggleAddTripModals: jest.fn(),
};

describe('<SearchTrip />', () => {
    let wrapper;
    let mockOnDataUpdate;

    beforeEach(() => {
        mockOnDataUpdate = jest.fn();
        wrapper = shallow(
            <SearchTrip
                { ...componentPropsMock }
                onDataUpdate={ mockOnDataUpdate }
            />,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        expect(wrapper).toHaveLength(1);
    });

    it('updates service-date-from to empty value onDataUpdate must be called', () => {
        withHooks(() => {
            const serviceDateFromInput = wrapper.find(
                '#add-trip__wizard-select-details__service-date-from',
            ).at(0);

            act(() => {
                serviceDateFromInput.props().onChange('');
            });
            wrapper.update();

            expect(mockOnDataUpdate).toHaveBeenCalledWith('serviceDateFrom', '');
        });
    });

    it('updates service-date-from value onDataUpdate must be called', () => {
        withHooks(() => {
            const serviceDateFromInput = wrapper.find(
                '#add-trip__wizard-select-details__service-date-from',
            );

            act(() => {
                serviceDateFromInput.props().onChange([moment('10/09/2023', DATE_FORMAT_DDMMYYYY).toDate()]);
            });
            wrapper.update();

            expect(mockOnDataUpdate).toHaveBeenCalledWith('serviceDateFrom', '10/09/2023');
        });
    });

    it('updates service-date-to to empty value onDataUpdate must be called', () => {
        withHooks(() => {
            const serviceDateToInput = wrapper.find(
                '#add-trip__wizard-select-details__serivce-date-to',
            ).at(0);

            act(() => {
                serviceDateToInput.props().onChange('');
            });
            wrapper.update();

            expect(mockOnDataUpdate).toHaveBeenCalledWith('serviceDateTo', '');
        });
    });

    it('updates service-date-to value onDataUpdate must be called', () => {
        withHooks(() => {
            const serviceDateToInput = wrapper.find(
                '#add-trip__wizard-select-details__serivce-date-to',
            );

            act(() => {
                serviceDateToInput.props().onChange([moment('11/09/2023', DATE_FORMAT_DDMMYYYY).toDate()]);
            });
            wrapper.update();

            expect(mockOnDataUpdate).toHaveBeenCalledWith('serviceDateTo', '11/09/2023');
        });
    });
});
