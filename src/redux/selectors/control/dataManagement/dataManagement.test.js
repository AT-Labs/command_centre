import { expect } from 'chai';
import { getDataManagementState } from './dataManagement';

const mockState = state => ({
    control: {
        dataManagement: {
            ...state,
        },
    },
});

describe('Data Management Selector', () => {
    context('get page settings state', () => {
        it('should return page settings from state', () => {
            const mockPageSettings = {
                pageSettings: {
                    openDrawer: true,
                    selectedIndex: 1,
                },
            };

            expect(getDataManagementState(mockState(mockPageSettings))).to.deep.equal(mockPageSettings);
        });
    });
});
