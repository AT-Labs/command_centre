import { shallow } from 'enzyme';
import React from 'react';
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

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<NotificationsView { ...props } />);
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
        test('should render single sourceId column when useNotificationEffectColumn is false', () => {
            const wrapper = setup({ useNotificationEffectColumn: false });
            const columns = wrapper.find(CustomDataGrid).prop('columns');

            const sourceIdColumns = columns.filter(col => col.field === 'sourceId');
            const parentSourceIdColumns = columns.filter(col => col.field === 'parentSourceId');

            expect(sourceIdColumns).toHaveLength(1);
            expect(sourceIdColumns[0].headerName).toEqual('#DISRUPTION');
            expect(parentSourceIdColumns).toHaveLength(0);
            expect(columns).toHaveLength(10);
        });

        test('should render both parentSourceId and sourceId columns when useNotificationEffectColumn is true', () => {
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

        test('should configure sourceId column differently based on useNotificationEffectColumn', () => {
            const wrapperWithoutEffect = setup({
                useNotificationEffectColumn: false,
                useDisruptionsNotificationsDirectLink: true,
            });
            const columnsWithoutEffect = wrapperWithoutEffect.find(CustomDataGrid).prop('columns');
            const sourceIdColWithoutEffect = columnsWithoutEffect.find(col => col.field === 'sourceId');

            expect(sourceIdColWithoutEffect.headerName).toEqual('#DISRUPTION');
            expect(sourceIdColWithoutEffect.renderCell).toBeDefined();

            const wrapperWithEffect = setup({ useNotificationEffectColumn: true });
            const columnsWithEffect = wrapperWithEffect.find(CustomDataGrid).prop('columns');
            const sourceIdColWithEffect = columnsWithEffect.find(col => col.field === 'sourceId');

            expect(sourceIdColWithEffect.headerName).toEqual('#EFFECT');
            expect(sourceIdColWithEffect.renderCell).toBeDefined();
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
