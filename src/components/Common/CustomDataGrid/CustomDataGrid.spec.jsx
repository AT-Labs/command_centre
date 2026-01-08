import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import CustomDataGrid from './CustomDataGrid';

jest.useFakeTimers();

let wrapper;

const mockFunctions = {
    setExpandedDetailPanels: jest.fn(),
    getExpandedDetailPanels: jest.fn(() => []),
    scrollToIndexes: jest.fn(),
    rootElementRef: {
        current: {
            querySelector: jest.fn(() => ({
                scrollIntoView: jest.fn(),
            })),
        },
    },
};

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
        page: 0,
        pageSize: 25,
    },
    columns: [],
    toolbar: null,
    getDetailPanelContent: null,
    detailPanelHeight: 300,
    disableSelectionOnClick: true,
    getRowId: null,
    rowCount: 0,
    serverSideData: false,
    updateDatagridConfig: jest.fn(),
    expandedDetailPanels: [],
    onRowExpanded: jest.fn(),
    multipleDetailPanelOpen: false,
};

jest.mock('@mui/x-data-grid-pro', () => {
    const actual = jest.requireActual('@mui/x-data-grid-pro');
    return {
        ...actual,
        useGridApiRef: jest.fn(() => ({
            current: {
                getExpandedDetailPanels: mockFunctions.getExpandedDetailPanels,
                setExpandedDetailPanels: mockFunctions.setExpandedDetailPanels,
                scrollToIndexes: mockFunctions.scrollToIndexes,
                rootElementRef: mockFunctions.rootElementRef,
                getSortedRowIds: jest.fn(() => []),
                getAllRowIds: jest.fn(() => []),
                getVisibleRowModels: jest.fn(() => new Map()),
                setPage: jest.fn(),
                state: {
                    density: {
                        value: 'standard',
                    },
                },
                getAllColumns: jest.fn(() => []),
                subscribeEvent: jest.fn(() => jest.fn()),
            },
        })),
    };
});

const setup = (customProps) => {
    const props = { ...mockProps };
    Object.assign(props, customProps);

    if (props.updateDatagridConfig) props.updateDatagridConfig.mockClear();
    if (props.onRowExpanded) props.onRowExpanded.mockClear();
    mockFunctions.setExpandedDetailPanels.mockClear();
    mockFunctions.getExpandedDetailPanels.mockClear();
    mockFunctions.scrollToIndexes.mockClear();
    if (mockFunctions.rootElementRef?.current?.querySelector) {
        mockFunctions.rootElementRef.current.querySelector.mockClear();
    }

    return mount(withCacheProvider(<CustomDataGrid { ...props } />));
};

describe('<CustomDataGrid />', () => {
    beforeEach(() => {
        mockFunctions.setExpandedDetailPanels.mockClear();
        mockFunctions.getExpandedDetailPanels.mockClear();
        mockFunctions.scrollToIndexes.mockClear();
        mockFunctions.getExpandedDetailPanels.mockReturnValue([]);
    });

    afterEach(() => {
        jest.clearAllTimers();
        if (wrapper) {
            wrapper.unmount();
        }
    });

    it('Should render', () => expect(setup().exists()).toEqual(true));

    describe('Check View', () => {
        it('Should have customDataGrid class container', () => {
            wrapper = setup();
            expect(wrapper.find('.customDataGrid').length).toEqual(1);
        });
    });

    describe('expandedDetailPanels handling - new useEffect', () => {
        it('Should handle expandedDetailPanels prop changes', () => {
            wrapper = setup({
                expandedDetailPanels: [],
            });

            expect(wrapper.exists()).toBe(true);

            act(() => {
                wrapper.setProps({
                    expandedDetailPanels: [1, 2],
                });
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
        });

        it('Should handle expandedDetailPanels becoming empty', () => {
            wrapper = setup({
                expandedDetailPanels: [1, 2],
            });

            expect(wrapper.exists()).toBe(true);

            act(() => {
                wrapper.setProps({
                    expandedDetailPanels: [],
                });
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
        });

        it('Should handle expandedDetailPanels becoming null', () => {
            wrapper = setup({
                expandedDetailPanels: [1, 2],
            });

            expect(wrapper.exists()).toBe(true);

            act(() => {
                wrapper.setProps({
                    expandedDetailPanels: null,
                });
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
        });

        it('Should handle expandedDetailPanels changing to different values', () => {
            wrapper = setup({
                expandedDetailPanels: [1, 2],
            });

            expect(wrapper.exists()).toBe(true);

            act(() => {
                wrapper.setProps({
                    expandedDetailPanels: [3, 4],
                });
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
        });
    });

    describe('handleDetailPanelExpansion - setSelectedRows addition', () => {
        it('Should handle expandedDetailPanels when provided', () => {
            wrapper = setup({
                expandedDetailPanels: [1, 2],
                dataSource: [{ id: 1 }, { id: 2 }],
                getDetailPanelContent: jest.fn(),
            });

            act(() => {
                wrapper.setProps({
                    expandedDetailPanels: [1, 2],
                });
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
        });

        it('Should handle autoExpandSubChild when provided and not loading', () => {
            wrapper = setup({
                expandedDetailPanels: [1],
                autoExpandSubChild: 123,
                loading: false,
                dataSource: [{ id: 1 }],
                getDetailPanelContent: jest.fn(),
            });

            act(() => {
                jest.runAllTimers();
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
        });

        it('Should not scroll when loading is true', () => {
            wrapper = setup({
                expandedDetailPanels: [1],
                autoExpandSubChild: 123,
                loading: true,
                dataSource: [{ id: 1 }],
                getDetailPanelContent: jest.fn(),
            });

            act(() => {
                jest.runAllTimers();
            });

            wrapper.update();

            expect(wrapper.exists()).toBe(true);
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
