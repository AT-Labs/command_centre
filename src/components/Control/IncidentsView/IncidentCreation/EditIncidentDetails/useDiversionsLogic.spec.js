/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { useDiversionsLogic, useAffectedEntities, getDiversionValidation } from './useDiversionsLogic';

chai.use(sinonChai);

const TestComponent = ({ disruption, fetchDiversionsAction, isDiversionManagerOpen, diversionResultState, clearDiversionsCacheAction }) => {
    const { anchorEl, setAnchorEl } = useDiversionsLogic(disruption, fetchDiversionsAction, isDiversionManagerOpen, diversionResultState, clearDiversionsCacheAction);

    return (
        <div>
            <div data-testid="anchorEl">{anchorEl ? 'hasAnchor' : 'noAnchor'}</div>
            <button type="button" data-testid="setAnchor" onClick={ () => setAnchorEl(document.createElement('div')) }>Set Anchor</button>
        </div>
    );
};

TestComponent.propTypes = {
    disruption: PropTypes.object,
    fetchDiversionsAction: PropTypes.func,
    isDiversionManagerOpen: PropTypes.bool,
    diversionResultState: PropTypes.object,
    clearDiversionsCacheAction: PropTypes.func,
};

TestComponent.defaultProps = {
    disruption: null,
    fetchDiversionsAction: null,
    isDiversionManagerOpen: false,
    diversionResultState: null,
    clearDiversionsCacheAction: null,
};

describe('useDiversionsLogic', () => {
    let mockFetchDiversionsAction;
    let mockClearDiversionsCacheAction;

    beforeEach(() => {
        mockFetchDiversionsAction = sinon.stub();
        mockClearDiversionsCacheAction = sinon.stub();
    });

    afterEach(() => {
        // Cleanup for Mocha
    });

    describe('anchorEl state management', () => {
        it('should initialize anchorEl as null', () => {
            const wrapper = mount(
                <TestComponent
                    disruption={ null }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            expect(wrapper.find('[data-testid="anchorEl"]').text()).to.equal('noAnchor');
        });

        it('should update anchorEl when setAnchorEl is called', () => {
            const wrapper = mount(
                <TestComponent
                    disruption={ null }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            act(() => {
                wrapper.find('[data-testid="setAnchor"]').simulate('click');
            });

            expect(wrapper.find('[data-testid="anchorEl"]').text()).to.equal('hasAnchor');
        });
    });

    describe('disruption change effect', () => {
        it('should call fetchDiversionsAction when disruption has disruptionId', () => {
            const disruption = { disruptionId: 'DISR123' };
            mount(
                <TestComponent
                    disruption={ disruption }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            expect(mockFetchDiversionsAction).to.have.been.calledWith('DISR123');
        });

        it('should not call fetchDiversionsAction when disruption has no disruptionId', () => {
            const disruption = { id: 'DISR123' };
            mount(
                <TestComponent
                    disruption={ disruption }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            // eslint-disable-next-line no-unused-expressions
            expect(mockFetchDiversionsAction).to.not.have.been.called;
        });
    });

    describe('isDiversionManagerOpen effect', () => {
        it('should close anchorEl when isDiversionManagerOpen becomes true', () => {
            const wrapper = mount(
                <TestComponent
                    disruption={ null }
                    fetchDiversionsAction={ mockFetchDiversionsAction }
                    isDiversionManagerOpen={ false }
                    diversionResultState={ null }
                    clearDiversionsCacheAction={ mockClearDiversionsCacheAction }
                />,
            );

            act(() => {
                wrapper.find('[data-testid="setAnchor"]').simulate('click');
            });

            expect(wrapper.find('[data-testid="anchorEl"]').text()).to.equal('hasAnchor');

            wrapper.setProps({ isDiversionManagerOpen: true });

            expect(wrapper.find('[data-testid="anchorEl"]').text()).to.equal('noAnchor');
        });
    });
});

describe('useAffectedEntities', () => {
    it('should return reduxAffectedRoutes when available', () => {
        const disruption = { affectedEntities: [] };
        const reduxAffectedRoutes = [{ routeId: '1', routeType: 3 }];

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal(reduxAffectedRoutes);
    });

    it('should return empty array when disruption has no affectedEntities', () => {
        const disruption = {};
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal([]);
    });

    it('should return disruption.affectedEntities when it is an array', () => {
        const disruption = { affectedEntities: [{ routeId: '1', routeType: 3 }] };
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal(disruption.affectedEntities);
    });

    it('should return disruption.affectedEntities.affectedRoutes when available', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [{ routeId: '1', routeType: 3 }],
            },
        };
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal(disruption.affectedEntities.affectedRoutes);
    });

    it('should return disruption.routes when available', () => {
        const disruption = {
            affectedEntities: {}, // Empty object to pass the check but not array
            routes: [{ routeId: '1', routeType: 3 }],
        };
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal(disruption.routes);
    });

    it('should return disruption.affectedRoutes when available', () => {
        const disruption = {
            affectedEntities: {}, // Empty object to pass the check but not array
            affectedRoutes: [{ routeId: '1', routeType: 3 }],
        };
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal(disruption.affectedRoutes);
    });

    it('should return disruption.affectedEntities?.affectedRoutes when available', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [{ routeId: '1', routeType: 3 }],
            },
        };
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal(disruption.affectedEntities.affectedRoutes);
    });

    it('should return empty array when no routes are found', () => {
        const disruption = { otherProperty: 'value' };
        const reduxAffectedRoutes = null;

        const result = useAffectedEntities(disruption, reduxAffectedRoutes);

        expect(result).to.deep.equal([]);
    });
});

describe('getDiversionValidation', () => {
    it('should return false when disruption is null', () => {
        const result = getDiversionValidation(null, [], []);

        expect(result).to.equal(false);
    });

    it('should return false when disruption status is resolved', () => {
        const disruption = { status: 'resolved' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(false);
    });

    it('should return false when disruption status is not allowed', () => {
        const disruption = { status: 'cancelled' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(false);
    });

    it('should return false when status is in-progress but missing startTime', () => {
        const disruption = {
            status: 'in-progress',
            endTime: '2025-01-01T10:00:00Z',
        };
        const affectedEntities = [{ routeId: '1', routeType: 3 }];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(false);
    });

    it('should return false when status is in-progress but missing endTime', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T09:00:00Z',
        };
        const affectedEntities = [{ routeId: '1', routeType: 3 }];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(false);
    });

    it('should return true when status is draft with missing times', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(true);
    });

    it('should return true when status is not-started with missing times', () => {
        const disruption = { status: 'not-started' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(true);
    });

    it('should return false when no bus routes are present', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 1 }]; // train route

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(false);
    });

    it('should return false when only train routes are present', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 1 }]; // train route

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(false);
    });

    it('should return true when bus routes are present', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(true);
    });

    it('should return true when both bus and train routes are present', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [
            { routeId: '1', routeType: 3 }, // bus route
            { routeId: '2', routeType: 1 }, // train route
        ];

        const result = getDiversionValidation(disruption, affectedEntities, []);

        expect(result).to.equal(true);
    });

    it('should return false when all bus routes already have diversions', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route
        const diversions = [{
            diversionRouteVariants: [{ routeId: '1' }],
        }];

        const result = getDiversionValidation(disruption, affectedEntities, diversions);

        expect(result).to.equal(false);
    });

    it('should return true when some bus routes do not have diversions', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [
            { routeId: '1', routeType: 3 }, // bus route
            { routeId: '2', routeType: 3 }, // bus route
        ];
        const diversions = [{
            diversionRouteVariants: [{ routeId: '1' }],
        }];

        const result = getDiversionValidation(disruption, affectedEntities, diversions);

        expect(result).to.equal(true);
    });

    it('should return true when diversions array is empty', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route
        const diversions = [];

        const result = getDiversionValidation(disruption, affectedEntities, diversions);

        expect(result).to.equal(true);
    });

    it('should return true when diversions is null', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route
        const diversions = null;

        const result = getDiversionValidation(disruption, affectedEntities, diversions);

        expect(result).to.equal(true);
    });

    it('should handle diversions with empty diversionRouteVariants', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route
        const diversions = [{
            diversionRouteVariants: [],
        }];

        const result = getDiversionValidation(disruption, affectedEntities, diversions);

        expect(result).to.equal(true);
    });

    it('should handle diversions with null diversionRouteVariants', () => {
        const disruption = { status: 'draft' };
        const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route
        const diversions = [{
            diversionRouteVariants: null,
        }];

        const result = getDiversionValidation(disruption, affectedEntities, diversions);

        expect(result).to.equal(true);
    });
});
