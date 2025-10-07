import { shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Button } from '@mui/material';
import { NotificationsView } from './NotificationsView';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import NotificationsDetailView from './NotificationsDetailView';

jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        search: '',
    }),
}));

jest.mock('../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: () => [
        { value: 'default', label: 'Default Cause' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'accident', label: 'Accident' },
    ],
}));

jest.mock('../../../redux/selectors/appSettings', () => ({
    useDisruptionsNotificationsDirectLink: jest.fn(() => false),
    useNotificationEffectColumn: jest.fn(() => false),
}));

jest.mock('../../../utils/control/disruptions', () => ({
    transformIncidentNo: jest.fn(id => `D${id}`),
    transformParentSourceIdNo: jest.fn(id => `P${id}`),
}));

const mockStore = configureStore([]);

const componentPropsMock = {
    datagridConfig: {
        filterModel: { items: [] },
        sortModel: [],
        pageSize: 25,
        page: 0,
    },
    updateNotificationsDatagridConfig: jest.fn(),
    filterNotifications: jest.fn(),
    notifications: [
        {
            notificationContentId: 'notif-1',
            source: {
                identifier: 12345,
                parentIdentifier: 67890,
                version: 1,
                title: 'Test Disruption',
            },
            informedEntities: [],
            cause: 'maintenance',
            startTime: 1704110400,
            endTime: null,
            condition: 'published',
            status: 'in-progress',
        },
    ],
    rowCount: 1,
    getStopGroups: jest.fn(),
    updateQueryParams: jest.fn(),
    updateSelectedNotification: jest.fn(),
    selectedNotification: null,
    goToDisruptionsView: jest.fn(),
    goToIncidentsView: jest.fn(),
    useDisruptionsNotificationsDirectLink: false,
    useNotificationEffectColumn: false,
};

const setup = (customProps, storeState = {}) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);

    const store = mockStore({
        notifications: {
            notifications: props.notifications,
            datagridConfig: props.datagridConfig,
            rowCount: props.rowCount,
            selectedNotification: props.selectedNotification,
        },
        appSettings: {
            useDisruptionsNotificationsDirectLink: props.useDisruptionsNotificationsDirectLink,
            useNotificationEffectColumn: props.useNotificationEffectColumn,
        },
        ...storeState,
    });

    return shallow(
        <Provider store={ store }>
            <NotificationsView { ...props } />
        </Provider>,
    ).dive().dive();
};

describe('<NotificationsView />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should render and display CustomDataGrid', () => {
        const wrapper = setup();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(CustomDataGrid).length).toEqual(1);
        expect(wrapper.find('h1').text()).toEqual('Notifications - Service Alerts');
    });

    describe('useNotificationEffectColumn behavior', () => {
        describe('when useNotificationEffectColumn is false', () => {
            test('should render single sourceId column with #DISRUPTION header', () => {
                const wrapper = setup({ useNotificationEffectColumn: false });
                const columns = wrapper.find(CustomDataGrid).prop('columns');

                const sourceIdColumns = columns.filter(col => col.field === 'sourceId');
                const parentSourceIdColumns = columns.filter(col => col.field === 'parentSourceId');

                expect(sourceIdColumns).toHaveLength(1);
                expect(sourceIdColumns[0].headerName).toEqual('#DISRUPTION');
                expect(parentSourceIdColumns).toHaveLength(0);
                expect(columns).toHaveLength(10);
            });

            test('should configure sourceId column with valueGetter when direct link is disabled', () => {
                const wrapper = setup({
                    useNotificationEffectColumn: false,
                    useDisruptionsNotificationsDirectLink: false,
                });
                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const sourceIdColumn = columns.find(col => col.field === 'sourceId');

                expect(sourceIdColumn.valueGetter).toBeDefined();
                expect(sourceIdColumn.renderCell).toBeUndefined();
            });

            test('should configure sourceId column with renderCell when direct link is enabled', () => {
                const wrapper = setup({
                    useNotificationEffectColumn: false,
                    useDisruptionsNotificationsDirectLink: true,
                });
                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const sourceIdColumn = columns.find(col => col.field === 'sourceId');

                expect(sourceIdColumn.renderCell).toBeDefined();
                expect(sourceIdColumn.valueGetter).toBeUndefined();
            });

            test('should call goToDisruptionsView when sourceId button is clicked (with direct link)', () => {
                const mockGoToDisruptionsView = jest.fn();
                const wrapper = setup({
                    useNotificationEffectColumn: false,
                    useDisruptionsNotificationsDirectLink: true,
                    goToDisruptionsView: mockGoToDisruptionsView,
                });

                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const sourceIdColumn = columns.find(col => col.field === 'sourceId');

                const mockRow = { source: { identifier: 12345 } };
                const renderedCell = sourceIdColumn.renderCell({ row: mockRow });

                expect(renderedCell.type).toBe(Button);
                expect(renderedCell.props.children).toBe('D12345');

                renderedCell.props.onClick();
                expect(mockGoToDisruptionsView).toHaveBeenCalledWith(
                    { incidentId: 12345 },
                    { setActiveDisruption: true },
                );
            });
        });

        describe('when useNotificationEffectColumn is true', () => {
            test('should render both parentSourceId and sourceId columns', () => {
                const wrapper = setup({ useNotificationEffectColumn: true });
                const columns = wrapper.find(CustomDataGrid).prop('columns');

                const sourceIdColumns = columns.filter(col => col.field === 'sourceId');
                const parentSourceIdColumns = columns.filter(col => col.field === 'parentSourceId');

                expect(parentSourceIdColumns).toHaveLength(1);
                expect(parentSourceIdColumns[0].headerName).toEqual('#DISRUPTION');
                expect(sourceIdColumns).toHaveLength(1);
                expect(sourceIdColumns[0].headerName).toEqual('#EFFECT');
                expect(columns).toHaveLength(11);
            });

            test('should configure parentSourceId column correctly', () => {
                const wrapper = setup({ useNotificationEffectColumn: true });
                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const parentSourceIdColumn = columns.find(col => col.field === 'parentSourceId');

                expect(parentSourceIdColumn.headerName).toEqual('#DISRUPTION');
                expect(parentSourceIdColumn.flex).toEqual(1);
                expect(parentSourceIdColumn.renderCell).toBeDefined();
                expect(parentSourceIdColumn.filterOperators).toBeDefined();
            });

            test('should configure sourceId column as #EFFECT with renderCell', () => {
                const wrapper = setup({ useNotificationEffectColumn: true });
                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const sourceIdColumn = columns.find(col => col.field === 'sourceId');

                expect(sourceIdColumn.headerName).toEqual('#EFFECT');
                expect(sourceIdColumn.renderCell).toBeDefined();
                expect(sourceIdColumn.valueGetter).toBeDefined();
            });

            test('should render parentSourceId cell correctly', () => {
                const wrapper = setup({ useNotificationEffectColumn: true });
                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const parentSourceIdColumn = columns.find(col => col.field === 'parentSourceId');

                const mockRow = {
                    source: {
                        parentIdentifier: 67890,
                        identifier: 12345,
                    },
                };

                const renderedCell = parentSourceIdColumn.renderCell({ row: mockRow });
                expect(renderedCell.type).toBe(Button);
                expect(renderedCell.props.children).toBe('P67890');
                expect(renderedCell.props['aria-label']).toBe('go-to-incidents');
            });

            test('should call goToIncidentsView when sourceId (effect) button is clicked', () => {
                const mockGoToIncidentsView = jest.fn();
                const wrapper = setup({
                    useNotificationEffectColumn: true,
                    goToIncidentsView: mockGoToIncidentsView,
                });

                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const sourceIdColumn = columns.find(col => col.field === 'sourceId');

                const mockRow = {
                    source: {
                        identifier: 12345,
                        parentIdentifier: 67890,
                    },
                };

                const renderedCell = sourceIdColumn.renderCell({ row: mockRow });

                expect(renderedCell.type).toBe(Button);
                expect(renderedCell.props.children).toBe('D12345');
                expect(renderedCell.props['aria-label']).toBe('go-to-disruptions-effect');

                renderedCell.props.onClick();
                expect(mockGoToIncidentsView).toHaveBeenCalledWith(
                    { incidentDisruptionNo: 67890, disruptionId: 12345 },
                    { setActiveIncident: true },
                );
            });

            test('should call goToIncidentsView when parentSourceId (disruption) button is clicked', () => {
                const mockGoToIncidentsView = jest.fn();
                const wrapper = setup({
                    useNotificationEffectColumn: true,
                    goToIncidentsView: mockGoToIncidentsView,
                });

                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const parentSourceIdColumn = columns.find(col => col.field === 'parentSourceId');

                const mockRow = {
                    source: {
                        identifier: 12345,
                        parentIdentifier: 67890,
                    },
                };

                const renderedCell = parentSourceIdColumn.renderCell({ row: mockRow });

                expect(renderedCell.type).toBe(Button);
                expect(renderedCell.props.children).toBe('P67890');
                expect(renderedCell.props['aria-label']).toBe('go-to-incidents');

                renderedCell.props.onClick();
                expect(mockGoToIncidentsView).toHaveBeenCalledWith(
                    { incidentDisruptionNo: 67890 },
                    { setActiveIncident: true },
                );
            });

            test('should have correct valueGetter for sourceId column', () => {
                const wrapper = setup({ useNotificationEffectColumn: true });
                const columns = wrapper.find(CustomDataGrid).prop('columns');
                const sourceIdColumn = columns.find(col => col.field === 'sourceId');

                const mockRow = { source: { identifier: 12345 } };
                const value = sourceIdColumn.valueGetter({ row: mockRow });

                expect(value).toBe('D12345');
            });
        });

        describe('columns comparison between modes', () => {
            test('should have different column configurations between effect modes', () => {
                const wrapperWithoutEffect = setup({ useNotificationEffectColumn: false });
                const wrapperWithEffect = setup({ useNotificationEffectColumn: true });

                const columnsWithoutEffect = wrapperWithoutEffect.find(CustomDataGrid).prop('columns');
                const columnsWithEffect = wrapperWithEffect.find(CustomDataGrid).prop('columns');

                expect(columnsWithoutEffect).toHaveLength(10);
                expect(columnsWithEffect).toHaveLength(11);

                const sourceIdWithoutEffect = columnsWithoutEffect.find(col => col.field === 'sourceId');
                const sourceIdWithEffect = columnsWithEffect.find(col => col.field === 'sourceId');

                expect(sourceIdWithoutEffect.headerName).not.toEqual(sourceIdWithEffect.headerName);
                expect(sourceIdWithoutEffect.headerName).toEqual('#DISRUPTION');
                expect(sourceIdWithEffect.headerName).toEqual('#EFFECT');
            });

            test('should only have parentSourceId column when effect mode is enabled', () => {
                const wrapperWithoutEffect = setup({ useNotificationEffectColumn: false });
                const wrapperWithEffect = setup({ useNotificationEffectColumn: true });

                const columnsWithoutEffect = wrapperWithoutEffect.find(CustomDataGrid).prop('columns');
                const columnsWithEffect = wrapperWithEffect.find(CustomDataGrid).prop('columns');

                const parentSourceIdWithoutEffect = columnsWithoutEffect.find(col => col.field === 'parentSourceId');
                const parentSourceIdWithEffect = columnsWithEffect.find(col => col.field === 'parentSourceId');

                expect(parentSourceIdWithoutEffect).toBeUndefined();
                expect(parentSourceIdWithEffect).toBeDefined();
            });
        });
    });

    test('should pass correct props to CustomDataGrid', () => {
        const wrapper = setup();
        const dataGridProps = wrapper.find(CustomDataGrid).props();

        expect(dataGridProps.dataSource).toEqual(componentPropsMock.notifications);
        expect(dataGridProps.rowCount).toEqual(componentPropsMock.rowCount);
        expect(dataGridProps.datagridConfig).toEqual(componentPropsMock.datagridConfig);
        expect(dataGridProps.serverSideData).toBe(true);
        expect(dataGridProps.detailPanelHeight).toEqual(470);
    });

    test('should render NotificationsDetailView in detail panel', () => {
        const wrapper = setup();
        const getDetailPanelContent = wrapper.find(CustomDataGrid).prop('getDetailPanelContent');
        const mockRow = { id: 'test-notification' };

        const detailPanel = getDetailPanelContent({ row: mockRow });
        expect(detailPanel.type).toEqual(NotificationsDetailView);
        expect(detailPanel.props.notification).toEqual(mockRow);
    });

    test('should update selected notification when row is expanded', () => {
        const wrapper = setup();
        const onRowExpanded = wrapper.find(CustomDataGrid).prop('onRowExpanded');

        const testIds = ['notif-1'];
        onRowExpanded(testIds);

        expect(componentPropsMock.updateSelectedNotification).toHaveBeenCalledWith(
            componentPropsMock.notifications[0],
        );
    });

    test('should clear selected notification when no rows are expanded', () => {
        const wrapper = setup();
        const onRowExpanded = wrapper.find(CustomDataGrid).prop('onRowExpanded');

        onRowExpanded([]);

        expect(componentPropsMock.updateSelectedNotification).toHaveBeenCalledWith(null);
    });

    test('should apply correct row class names based on notification status', () => {
        const wrapper = setup();
        const getRowClassName = wrapper.find(CustomDataGrid).prop('getRowClassName');

        const overwrittenRow = {
            row: { status: 'overwritten', condition: 'published', endTime: null },
        };
        expect(getRowClassName(overwrittenRow)).toEqual('row-overwritten');

        const activeRow = {
            row: { status: 'in-progress', condition: 'published', endTime: null },
        };
        expect(getRowClassName(activeRow)).toEqual('row-highlight');

        const normalRow = {
            row: { status: 'completed', condition: 'published', endTime: 123456 },
        };
        expect(getRowClassName(normalRow)).toEqual('');
    });

    test('should include all expected base columns', () => {
        const wrapper = setup();
        const columns = wrapper.find(CustomDataGrid).prop('columns');

        const expectedFields = [
            'sourceId', 'sourceVersion', 'sourceTitle', 'affectedRoutes',
            'affectedStops', 'cause', 'startTime', 'endTime', 'condition', 'status',
        ];

        expectedFields.forEach((field) => {
            expect(columns.find(col => col.field === field)).toBeDefined();
        });
    });

    test('should set expandedDetailPanels when selectedNotification exists', () => {
        const selectedNotification = { notificationContentId: 'selected-notif' };
        const wrapper = setup({ selectedNotification });

        const expandedDetailPanels = wrapper.find(CustomDataGrid).prop('expandedDetailPanels');
        expect(expandedDetailPanels).toEqual(['selected-notif']);
    });

    test('should set expandedDetailPanels to null when no selectedNotification', () => {
        const wrapper = setup({ selectedNotification: null });

        const expandedDetailPanels = wrapper.find(CustomDataGrid).prop('expandedDetailPanels');
        expect(expandedDetailPanels).toBeNull();
    });
});
