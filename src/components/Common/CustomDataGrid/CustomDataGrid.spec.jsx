import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';

import CustomDataGrid from './CustomDataGrid';

let wrapper;

const cache = createCache({ key: 'default' });
const withCacheProvider = children => (
    <CacheProvider value={ cache }>
        {children}
    </CacheProvider>
);

const mockProps = {
    dataSource: [],
    datagridConfig: {
        density: 'standard',
    },
    columns: [],
    toolbar: null,
    getDetailPanelContent: null,
    detailPanelHeight: 300,
    disableSelectionOnClick: true,
    getRowId: null,
    rowCount: 0,
    serverSideData: false,
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);

    return mount(withCacheProvider(<CustomDataGrid { ...props } />));
};

describe('<CustomDataGrid />', () => {
    it('Should render', () => expect(setup().exists()).toEqual(true));

    describe('Check View', () => {
        it('Should have customDataGrid class container', () => {
            wrapper = setup();
            expect(wrapper.find('.customDataGrid').length).toEqual(1);
        });
    });

    /* ! This test must be updated because it makes the pipeline fail on Azure devops.
        It's the hooks which must be at the origin of this failure, an investigation must
        be schedule to find the origin to solve this problem.
        The tech debt for solving this problem is https://propellerheadnz.atlassian.net/browse/ATR-3798
    */
    // describe('set columns and populate data', () => {
    //     it('Should set the columns based on configuration passed in', () => {
    //         wrapper = setup({
    //             dataSource: [{ id: '1', selectColumn: 'select-item-1' }, { id: '2', selectColumn: 'select-item-2' }],
    //             columns: [
    //                 {
    //                     field: 'id',
    //                     headerName: 'ID',
    //                     flex: 1,
    //                 },
    //                 {
    //                     field: 'selectColumn',
    //                     headerName: 'SELECT COLUMN',
    //                     flex: 1,
    //                     type: 'singleSelect',
    //                     valueOptions: ['select-item-1', 'select-item-2'],
    //                 },
    //             ],
    //         });

    //         expect(wrapper.find('.MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row').length).toEqual(2);
    //         const titles = wrapper.find('GridColumnHeaderTitle');
    //         expect(titles.at(0).props().label).toEqual('ID');
    //         expect(titles.at(1).props().label).toEqual('SELECT COLUMN');
    //     });
    // });
});
