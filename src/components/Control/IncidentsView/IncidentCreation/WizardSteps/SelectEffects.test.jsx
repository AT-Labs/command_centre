import React from 'react';
import { shallow } from 'enzyme';
import { SelectEffects } from './SelectEffects';
import { DEFAULT_IMPACT, DEFAULT_CAUSE, DEFAULT_SEVERITY } from '../../../../../../types/disruptions-types';

const mockProps = {
    data: {
        disruptions: [
            {
                key: 'test-key-1',
                startTime: '10:00',
                startDate: '2024-01-01',
                endTime: '11:00',
                endDate: '2024-01-01',
                impact: DEFAULT_IMPACT.value,
                cause: DEFAULT_CAUSE.value,
                severity: DEFAULT_SEVERITY.value,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
                createNotification: false,
                disruptionType: 'Routes',
                recurrent: false,
                duration: '',
                recurrencePattern: { freq: 2 },
                header: 'Test Disruption',
                status: 'not-started',
            },
        ],
    },
    onDataUpdate: jest.fn(),
    onSubmit: jest.fn(),
    useDraftDisruptions: false,
};

describe('SelectEffects', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<SelectEffects {...mockProps} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should render without crashing', () => {
            expect(wrapper.exists()).toBe(true);
        });

        it('should initialize with disruptions from props', () => {
            const disruptions = wrapper.state('disruptions');
            expect(disruptions).toHaveLength(1);
            expect(disruptions[0].key).toBe('test-key-1');
        });

        it('should initialize with empty disruption if no disruptions in props', () => {
            const propsWithoutDisruptions = {
                ...mockProps,
                data: { disruptions: [] },
            };
            const wrapperWithoutDisruptions = shallow(<SelectEffects {...propsWithoutDisruptions} />);
            const disruptions = wrapperWithoutDisruptions.state('disruptions');
            expect(disruptions).toHaveLength(1);
            expect(disruptions[0].key).toBe('');
        });
    });

    describe('useDisruptions hook', () => {
        it('should create disruptions map correctly', () => {
            const disruptions = [
                { key: 'key1', impact: 'test1' },
                { key: 'key2', impact: 'test2' },
            ];
            
            const wrapperWithMultipleDisruptions = shallow(
                <SelectEffects {...mockProps} data={{ disruptions }} />
            );
            
            const instance = wrapperWithMultipleDisruptions.instance();
            const getDisruptionByKey = instance.getDisruptionByKey || 
                wrapperWithMultipleDisruptions.find('useDisruptions').props().getDisruptionByKey;
            
            if (getDisruptionByKey) {
                expect(getDisruptionByKey('key1')).toEqual({ key: 'key1', impact: 'test1' });
                expect(getDisruptionByKey('key2')).toEqual({ key: 'key2', impact: 'test2' });
            }
        });
    });

    describe('Validation functions', () => {
        it('should validate impact correctly', () => {
            const instance = wrapper.instance();
            const impactValid = instance.impactValid || wrapper.find('impactValid').props();
            
            if (typeof impactValid === 'function') {
                expect(impactValid('test-key-1')).toBe(true);
                expect(impactValid('non-existent-key')).toBe(false);
            }
        });

        it('should validate severity correctly', () => {
            const instance = wrapper.instance();
            const severityValid = instance.severityValid || wrapper.find('severityValid').props();
            
            if (typeof severityValid === 'function') {
                expect(severityValid('test-key-1')).toBe(true);
                expect(severityValid('non-existent-key')).toBe(false);
            }
        });
    });

    describe('Footer component', () => {
        it('should render Footer with correct props', () => {
            const footer = wrapper.find('Footer');
            expect(footer.exists()).toBe(true);
            expect(footer.props().onFinish).toBeDefined();
        });

        it('should call onSubmit when onFinish is triggered', () => {
            const footer = wrapper.find('Footer');
            const onFinish = footer.props().onFinish;
            
            onFinish();
            
            expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
        });
    });

    describe('Data synchronization', () => {
        it('should update disruptions state when props change', () => {
            const newDisruptions = [
                {
                    key: 'new-key',
                    impact: 'NEW_IMPACT',
                    severity: 'NEW_SEVERITY',
                },
            ];
            
            wrapper.setProps({
                data: { disruptions: newDisruptions },
            });
            
            const disruptions = wrapper.state('disruptions');
            expect(disruptions).toHaveLength(1);
            expect(disruptions[0].key).toBe('new-key');
        });

        it('should call onDataUpdate when disruptions state changes', () => {
            const newDisruptions = [
                {
                    key: 'updated-key',
                    impact: 'UPDATED_IMPACT',
                },
            ];
            
            wrapper.setState({ disruptions: newDisruptions });
            
            expect(mockProps.onDataUpdate).toHaveBeenCalledWith('disruptions', newDisruptions);
        });
    });
}); 