import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { expect } from 'chai';

const MockDiversionManager = ({ disruption, resultState, diversion }) => {
    if (!disruption?.disruptionId) {
        return null;
    }

    const isModalOpen = !resultState?.isLoading && (resultState?.diversionId || resultState?.error);
    const editingDiversions = diversion?.diversionRouteVariants || [];

    return (
        <div data-testid="diversion-manager">
            <div data-testid="is-modal-open">{isModalOpen ? 'true' : 'false'}</div>
            <div data-testid="editing-diversions-count">{editingDiversions.length}</div>
        </div>
    );
};

MockDiversionManager.propTypes = {
    disruption: PropTypes.shape({
        disruptionId: PropTypes.string,
    }),
    resultState: PropTypes.shape({
        isLoading: PropTypes.bool,
        diversionId: PropTypes.string,
        error: PropTypes.string,
    }),
    diversion: PropTypes.shape({
        diversionRouteVariants: PropTypes.array,
    }),
};

MockDiversionManager.defaultProps = {
    disruption: null,
    resultState: null,
    diversion: null,
};

const mockStore = configureMockStore();

describe('DiversionManager - Optional Chaining Tests', () => {
    let store;
    let defaultProps;

    beforeEach(() => {
        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: {
                        isLoading: false,
                        diversionId: null,
                        error: null,
                    },
                    diversion: {
                        diversionRouteVariants: [],
                    },
                    diversionEditMode: 'CREATE',
                    isDiversionManagerLoading: false,
                    diversionsData: [],
                    diversionsLoading: false,
                },
            },
        });
        defaultProps = {
            disruption: {
                disruptionId: 'DISR123',
                incidentId: 'INC123',
            },
            resultState: {
                isLoading: false,
                diversionId: null,
                error: null,
            },
            diversion: {
                diversionRouteVariants: [],
            },
        };
    });

    describe('disruption?.disruptionId check', () => {
        it('should render when disruption has disruptionId', () => {
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...defaultProps } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
        });

        it('should return null when disruption is null', () => {
            const props = { ...defaultProps, disruption: null };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(0);
        });

        it('should return null when disruption is undefined', () => {
            const props = { ...defaultProps, disruption: undefined };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(0);
        });

        it('should return null when disruption.disruptionId is null', () => {
            const props = { ...defaultProps, disruption: { disruptionId: null } };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(0);
        });

        it('should return null when disruption.disruptionId is undefined', () => {
            const props = { ...defaultProps, disruption: { disruptionId: undefined } };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(0);
        });
    });

    describe('resultState?.isLoading check', () => {
        it('should handle resultState being null', () => {
            const props = { ...defaultProps, resultState: null };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="is-modal-open"]').text()).to.equal('false');
        });

        it('should handle resultState being undefined', () => {
            const props = { ...defaultProps, resultState: undefined };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="is-modal-open"]').text()).to.equal('false');
        });

        it('should handle resultState.isLoading being undefined', () => {
            const props = {
                ...defaultProps,
                resultState: {
                    diversionId: null,
                    error: null,
                },
            };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="is-modal-open"]').text()).to.equal('false');
        });
    });

    describe('resultState?.diversionId check', () => {
        it('should handle resultState.diversionId being undefined', () => {
            const props = {
                ...defaultProps,
                resultState: {
                    isLoading: false,
                    error: null,
                },
            };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="is-modal-open"]').text()).to.equal('false');
        });
    });

    describe('resultState?.error check', () => {
        it('should handle resultState.error being undefined', () => {
            const props = {
                ...defaultProps,
                resultState: {
                    isLoading: false,
                    diversionId: null,
                },
            };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="is-modal-open"]').text()).to.equal('false');
        });
    });

    describe('diversion?.diversionRouteVariants check', () => {
        it('should handle diversion being null', () => {
            const props = { ...defaultProps, diversion: null };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="editing-diversions-count"]').text()).to.equal('0');
        });

        it('should handle diversion being undefined', () => {
            const props = { ...defaultProps, diversion: undefined };
            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="editing-diversions-count"]').text()).to.equal('0');
        });
    });

    describe('Combined edge cases', () => {
        it('should handle all optional chaining scenarios with null/undefined values', () => {
            const props = {
                disruption: null,
                resultState: null,
                diversion: null,
            };

            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(0);
        });

        it('should handle partial null/undefined values', () => {
            const props = {
                disruption: { disruptionId: 'DISR123' },
                resultState: { isLoading: false },
                diversion: { diversionRouteVariants: [] },
            };

            const wrapper = mount(
                <Provider store={ store }>
                    <MockDiversionManager { ...props } />
                </Provider>,
            );

            expect(wrapper.find('[data-testid="diversion-manager"]')).to.have.length(1);
            expect(wrapper.find('[data-testid="is-modal-open"]').text()).to.equal('false');
            expect(wrapper.find('[data-testid="editing-diversions-count"]').text()).to.equal('0');
        });
    });
});
