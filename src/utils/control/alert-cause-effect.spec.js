/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { useAlertCauses, useAlertEffects } from './alert-cause-effect';
import { fetchFromLocalStorage } from '../common/local-storage-helper';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../types/disruption-cause-and-effect';

jest.mock('../common/local-storage-helper', () => ({
    fetchFromLocalStorage: jest.fn(),
}));

const CausesTestComponent = () => {
    const causes = useAlertCauses();
    return <div>{JSON.stringify(causes)}</div>;
};

const EffectsTestComponent = () => {
    const effects = useAlertEffects();
    return <div>{JSON.stringify(effects)}</div>;
};

describe('Alert cause effect hooks tests', () => {
    it('Should return the default cause initially', () => {
        const wrapper = mount(<CausesTestComponent />);
        expect(wrapper.text()).toContain(JSON.stringify([DEFAULT_CAUSE]));
    });

    it('Should update state when causes are fetched successfully', async () => {
        const mockCauses = [{ value: 'BREAKDOWN', label: 'Breakdown' }];
        fetchFromLocalStorage.mockResolvedValueOnce(mockCauses);

        let wrapper;
        await act(async () => {
            wrapper = mount(<CausesTestComponent />);
        });

        await act(async () => {
            await new Promise(setImmediate);
            wrapper.update();
        });

        expect(wrapper.text()).toContain(JSON.stringify([DEFAULT_CAUSE, { value: 'BREAKDOWN', label: 'Breakdown' }]));
    });

    it('Should return the default effect initially', () => {
        const wrapper = mount(<EffectsTestComponent />);
        expect(wrapper.text()).toContain(JSON.stringify([DEFAULT_IMPACT]));
    });

    it('Should update state when effects are fetched successfully', async () => {
        const mockEffects = [{ value: 'BUS_REPLACEMENT', label: 'Bus replacement' }];
        fetchFromLocalStorage.mockResolvedValueOnce(mockEffects);

        let wrapper;
        await act(async () => {
            wrapper = mount(<EffectsTestComponent />);
        });

        await act(async () => {
            await new Promise(setImmediate);
            wrapper.update();
        });

        expect(wrapper.text()).toContain(JSON.stringify([DEFAULT_IMPACT, { value: 'BUS_REPLACEMENT', label: 'Bus replacement' }]));
    });
});
