import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import sinon from "sinon";
import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import MockDate from "mockdate";

import {
    goToRoutesView,
    goToBlocksView,
    goToDisruptionsView,
    goToDisruptionEditPage,
    goToIncidentsView,
} from "./link";
import * as tripMgtApi from "../../../utils/transmitters/trip-mgt-api";
import ACTION_TYPE from "../../action-types";
import VIEW_TYPE from "../../../types/view-types";

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);

const store = mockStore({
    control: {
        routes: {
            tripInstances: {},
            filters: {
                routeType: 3,
            },
        },
    },
    datagridConfig: {
        routesTripsDatagridConfig: {
            filterModel: { items: [] },
            sortModel: [],
        },
    },
});

let sandbox;

const mockTrips = {
    totalCount: 2,
    tripInstances: [
        {
            tripId: "1",
            serviceDate: "20190608",
            startTime: "10:00:00",
            routeShortName: "10",
            routeType: 3,
            status: "COMPLETED",
        },
        {
            tripId: "2",
            serviceDate: "20190608",
            startTime: "10:00:00",
            routeShortName: "20",
            routeType: 3,
            status: "NOT_STARTED",
        },
    ],
    _links: {
        permissions: [
            {
                _rel: "cancel",
            },
            {
                _rel: "copy",
            },
            {
                _rel: "delay",
            },
            {
                _rel: "view",
            },
            {
                _rel: "advancer",
            },
            {
                _rel: "recurrent_cancel",
            },
            {
                _rel: "new",
            },
        ],
    },
};
const mockTrip = {
    agencyId: "",
    routeVariantId: "11111",
    routeType: 2,
    routeShortName: "EAST",
    startTime: "06:00:00",
};
const mockStoreTrips = {
    "1-20190608-10:00:00": {
        tripId: "1",
        serviceDate: "20190608",
        startTime: "10:00:00",
        routeShortName: "10",
        routeType: 3,
        status: "COMPLETED",
    },
    "2-20190608-10:00:00": {
        tripId: "2",
        serviceDate: "20190608",
        startTime: "10:00:00",
        routeShortName: "20",
        routeType: 3,
        status: "NOT_STARTED",
    },
};

describe("Link actions", () => {
    before(() => {
        MockDate.set(new Date(Date.UTC(2023, 2, 1, 0, 0, 0)));
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    after(() => {
        MockDate.reset();
    });

    it("when going from Blocks to R&T, updates the link and sets the route filters", async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, "getTrips").callsFake(fakeGetTrips);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
                payload: {
                    activeTripInstanceId: null,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_TRIP_CROSS_LINK,
                payload: {
                    ...mockTrip,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.ROUTES,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE,
                payload: {
                    activeRouteShortName: mockTrip.routeShortName,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: mockTrip.routeVariantId,
                },
            },
            {
                type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
                payload: {
                    filters: {
                        agencyId: "",
                        depotIds: [],
                        routeType: mockTrip.routeType,
                        isGroupedByRoute: true,
                        isGroupedByRouteVariant: true,
                        startTimeFrom: "",
                        startTimeTo: "",
                        tripStatus: "",
                        routeShortName: "",
                        routeVariantId: "",
                    },
                },
            },
            {
                type: ACTION_TYPE.UPDATE_ROUTES_TRIPS_DATAGRID_CONFIG,
                payload: {
                    filterModel: {
                        items: [
                            {
                                columnField: "startTime",
                                operatorValue: "onOrAfter",
                                value: "",
                            },
                        ],
                    },
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING,
                payload: {
                    isUpdating: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LAST_FILTER,
                payload: {
                    lastFilterRequest: {
                        delayRange: undefined,
                        agencyId: undefined,
                        depotIds: undefined,
                        tripStatus: undefined,
                        startTimeFrom: undefined,
                        startTimeTo: undefined,
                        limit: undefined,
                        page: NaN,
                        routeType: 3,
                        serviceDate: "20230301",
                        sorting: undefined,
                    },
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    timestamp: 1677628800000,
                    tripInstances: mockStoreTrips,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel",
                        },
                        {
                            _rel: "copy",
                        },
                        {
                            _rel: "delay",
                        },
                        {
                            _rel: "view",
                        },
                        {
                            _rel: "advancer",
                        },
                        {
                            _rel: "recurrent_cancel",
                        },
                        {
                            _rel: "new",
                        },
                    ],
                },
            },
        ];

        await store.dispatch(
            goToRoutesView(mockTrip, {
                agencyId: mockTrip.agencyId,
                routeType: mockTrip.routeType,
                isGroupedByRoute: true,
                isGroupedByRouteVariant: true,
                startTimeFrom: "",
                startTimeTo: "",
                tripStatus: "",
                routeShortName: "",
                routeVariantId: "",
            })
        );
        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
    });

    it("when going from R&T to Blocks, updates the link", async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_CROSS_LINK,
                payload: {
                    ...mockTrip,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.BLOCKS,
                },
            },
        ];

        await store.dispatch(goToBlocksView(mockTrip));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it("when going from Messaging to Disruptions, updates the link", async () => {
        const message = {
            incidentId: "DISR00644",
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView:
                        VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                },
            },
        ];

        await store.dispatch(
            goToDisruptionsView(message, { setActiveDisruption: false })
        );
        expect(store.getActions()).to.eql(expectedActions);
    });

    it("when going from Messaging to Disruptions(with an active disruption), updates the link", async () => {
        const message = {
            incidentId: "DISR00643",
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView:
                        VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_DISRUPTION_ID,
                payload: {
                    activeDisruptionId: message.incidentId,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
                payload: {
                    disruptionId: null,
                    resultStatus: null,
                    resultMessage: null,
                    resultDisruptionVersion: null,
                },
            },
        ];

        await store.dispatch(
            goToDisruptionsView(message, { setActiveDisruption: true })
        );
        expect(store.getActions()).to.eql(expectedActions);
    });

    it("goToDisruptionEditPage", () => {
        const disruptionId = "123456789";
        const message = {
            disruptionId: disruptionId,
        };
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView:
                        VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_ACTIVE_CONTROL_ENTITY_ID,
                payload: {
                    activeControlEntityId: message.disruptionId,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_DISRUPTION_ID,
                payload: {
                    activeDisruptionId: disruptionId,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
                payload: {
                    disruptionId: null,
                    resultStatus: null,
                    resultMessage: null,
                    resultDisruptionVersion: null,
                },
            },
        ];

        store.dispatch(
            goToDisruptionEditPage(
                { disruptionId: disruptionId },
                { setActiveDisruption: true }
            )
        );
        expect(store.getActions()).to.eql(expectedActions);
    });

    it("goToDisruptionEditPage with setActiveDisruption false", () => {
        const disruptionId = "123456789";
        const message = {
            disruptionId: disruptionId,
        };
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView:
                        VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_ACTIVE_CONTROL_ENTITY_ID,
                payload: {
                    activeControlEntityId: message.disruptionId,
                },
            },
        ];

        store.dispatch(
            goToDisruptionEditPage(
                { disruptionId: disruptionId },
                { setActiveDisruption: false }
            )
        );
        expect(store.getActions()).to.eql(expectedActions);
    });

    it("goToIncidentsView", () => {
        const incidentDisruptionNo = "DISR00644";
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.INCIDENTS,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT,
                payload: {
                    activeIncidentId: null,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT,
                payload: {
                    activeIncidentId: incidentDisruptionNo,
                },
            },
        ];
        store.dispatch(
            goToIncidentsView(
                { incidentDisruptionNo },
                { setActiveIncident: true }
            )
        );
        expect(store.getActions()).to.eql(expectedActions);
    });

    it("goToIncidentsView with setActiveIncident false", () => {
        const incidentDisruptionNo = "DISR00644";
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.INCIDENTS,
                },
            },
        ];

        store.dispatch(
            goToIncidentsView(
                { incidentDisruptionNo },
                { setActiveIncident: false }
            )
        );
        expect(store.getActions()).to.eql(expectedActions);
    });
});
