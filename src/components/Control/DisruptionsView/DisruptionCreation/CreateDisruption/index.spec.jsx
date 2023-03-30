import React from 'react';
import { shallow } from 'enzyme';
import { CreateDisruption } from './index';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import { updateCurrentStep } from '../../../../../redux/actions/control/disruptions';

jest.mock('../../../../Common/Map/ShapeLayer/ShapeLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/StopsLayer', () => jest.fn());

jest.mock('../../../../Common/Map/HighlightingLayer/HighlightingLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/SelectedStopsMarker', () => jest.fn());

jest.mock('./DrawLayer', () => jest.fn());

jest.mock('../../../../Common/CustomModal/CustomModal', () => jest.fn());

const mockAction = { resultDisruptionId: 12345 };

describe('CreateDisruption component', () => {
    it('should render a SidePanel component with a LoadingOverlay if isLoading is true', () => {
        const wrapper = shallow(<CreateDisruption isLoading action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        expect(wrapper.find(LoadingOverlay)).toHaveLength(1);
    });

    it('should render a SidePanel component without a LoadingOverlay if isLoading is false', () => {
        const wrapper = shallow(<CreateDisruption isLoading={ false } action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        expect(wrapper.find(LoadingOverlay)).toHaveLength(0);
    });
});
