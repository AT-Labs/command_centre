export default {
    // Activity
    DATA_LOADING: 'data-loading',
    DATA_ERROR: 'data-error',
    DISMISS_DATA_ERROR: 'dismiss-data-error',
    SET_MODAL_ERROR: 'set-modal-error',
    SET_MODAL_STATUS: 'set-modal-status',
    // All stops
    FETCH_STOPS: 'fetch-stops',
    // All routes
    FETCH_ROUTES: 'fetch-routes',
    // All agencies
    POPULATE_AGENCIES: 'populate-agencies',
    // All vehicles
    FETCH_VEHICLES_REALTIME: 'fetch-vehicles-realtime',
    FETCH_TRIP_UPDATES_REALTIME: 'fetch-trip-updates-realtime',
    MERGE_VEHICLE_FILTERS: 'merge-vehicle-filters',
    // Search
    SEARCH_LOADING: 'addresses-loading',
    UPDATE_SEARCH_TERMS: 'update-search-terms',
    UPDATE_ADDRESS_SEARCH_RESULTS: 'update-address-search-results',
    UPDATE_STOP_SEARCH_RESULTS: 'update-stop-search-results',
    UPDATE_ROUTE_SEARCH_RESULTS: 'update-route-search-results',
    UPDATE_STOP_GROUP_SEARCH_RESULTS: 'update-stop-group-search-results',
    UPDATE_STOP_GROUP_MERGED_SEARCH_RESULTS: 'update-stop-group-merged-search-results',
    UPDATE_STOP_MESSAGE_SEARCH_RESULTS: 'update-stop-message-search-results',
    UPDATE_STOP_IN_GROUP_SEARCH_RESULTS: 'update-stop-in-group-search-results',
    CLEAR_SEARCH_RESULTS: 'clear-search-results',
    // Detail
    CLEAR_DETAIL: 'clear-detail',
    DISPLAY_REAL_TIME_DETAIL: 'display-real-time-detail',
    UPDATE_SELECTED_VEHICLE: 'update-selected-vehicle',
    UPDATE_SELECTED_ADDRESS: 'update-selected-address',
    UPDATE_SELECTED_STOP: 'update-selected-stop',
    UPDATE_SELECTED_ROUTE: 'update-selected-route',
    // Stop detail
    FETCH_STOP_INFO: 'fetch-stop-info',
    FETCH_STOP_UPCOMING_VEHICLES: 'fetch-stop-upcoming-vehicles',
    FETCH_STOP_PAST_VEHICLES: 'fetch-stop-past-vehicles',
    FETCH_STOP_ROUTES: 'fetch-stop-routes',
    UPDATE_VISIBLE_STOPS: 'update-visible-stops',
    // Route detail
    FETCH_ROUTE_INFO: 'fetch-route-info',
    FETCH_ROUTE_TRIPS: 'fetch-route-trips',
    // Fleet
    FETCH_TRAINS_FROM_FLEET: 'fetch-trains-from-fleet',
    FETCH_BUSES_FROM_FLEET: 'fetch-buses-from-fleet',
    FETCH_FERRIES_FROM_FLEET: 'fetch-ferries-from-fleet',
    // Vehicle detail
    FETCH_VEHICLE_INFO: 'fetch-vehicle-info',
    FETCH_VEHICLE_FLEET_INFO: 'fetch-vehicle-fleet-info',
    FETCH_VEHICLE_UPCOMING_STOPS: 'fetch-vehicle-upcoming-stops',
    FETCH_VEHICLE_PAST_STOPS: 'fetch-vehicle-past-stops',
    FETCH_TRIP: 'fetch-trip',
    // Map
    RECENTER_MAP: 'recenter-map',
    // navigation
    UPDATE_MAIN_VIEW: 'update-main-view',
    TOGGLE_RT_SIDE_PANEL: 'toggle-rt-side-panel',
    UPDATE_SECONDARY_PANEL_VIEW: 'update-secondary-panel-view',
    // Blocks
    FETCH_CONTROL_BLOCKS: 'fetch-control-blocks',
    FETCH_CONTROL_VEHICLE_ALLOCATIONS: 'fetch-control-vehicle-allocations',
    UPDATE_CONTROL_VEHICLE_ALLOCATIONS: 'update-control-vehicle-allocations',
    UPDATE_CONTROL_BLOCKS_SORTING_PARAMS: 'update-control-blocks-sorting-params',
    UPDATE_CONTROL_BLOCKS_ACTIVE_BLOCK: 'update-control-blocks-active-block',
    UPDATE_CONTROL_BLOCKS_ACTIVE_TRIP: 'update-control-blocks-active-trip',
    UPDATE_CONTROL_BLOCKS_LOADING: 'update-control-blocks-loading',
    UPDATE_CONTROL_BLOCKS_ACTIVE_BLOCK_LOADING: 'update-control-blocks-active-block-loading',
    UPDATE_CONTROL_BLOCK_SEARCH_RESULTS: 'update-control-block-search-results',
    UPDATE_BLOCKS_PERMISSIONS: 'update-blocks-permissions',
    // Stop Messaging
    FETCH_CONTROL_STOP_MESSAGES: 'fetch-control-stop-messages',
    UPDATE_CONTROL_STOP_MESSAGES_LOADING: 'update-control-stop-messages-loading',
    FETCH_CONTROL_STOP_GROUPS: 'fetch-control-stop-groups',
    UPDATE_CONTROL_STOP_GROUPS_LOADING: 'update-control-stop-groups-loading',
    UPDATE_STOP_MESSAGES_PERMISSIONS: 'update-stop-messages-permissions',
    // VEHICLE_ALLOCATION
    UPDATE_VEHICLE_SEARCH_RESULTS: 'update-search-vehicle-results',
    UPDATE_SEARCH_VEHICLE_SELECTED: 'update-search-vehicle-selected',
    SEARCH_VEHICLE_LOADING: 'search-vehicle-loading',
    CLEAR_SEARCH_VEHICLE_RESULTS: 'clear-search-vehicle-results',
    // Control
    UPDATE_CONTROL_DETAIL_VIEW: 'update-control-detail-view',
    // Control: agencies
    FETCH_CONTROL_AGENCIES: 'fetch-control-agencies',
    // Control: routes
    FETCH_CONTROL_ROUTES: 'fetch-control-routes',
    CLEAR_CONTROL_ROUTES: 'clear-control-routes',
    UPDATE_CONTROL_ROUTES_LOADING: 'update-control-routes-loading',
    UPDATE_CONTROL_ACTIVE_ROUTE: 'update-control-active-route',
    UPDATE_CONTROL_ROUTES_SEARCH_RESULTS: 'update-control-routes-search-results',
    // Control: route variants
    UPDATE_CONTROL_ROUTE_VARIANTS: 'update-control-route-variants',
    CLEAR_CONTROL_ROUTE_VARIANTS: 'clear-control-route-variants',
    UPDATE_CONTROL_ROUTE_VARIANTS_LOADING: 'update-control-route-variants-loading',
    UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT: 'update-control-active-route-variant',
    UPDATE_CONTROL_ROUTE_VARIANTS_SEARCH_RESULTS: 'update-control-route-variants-search-results',
    // Control: filters
    MERGE_CONTROL_ROUTES_FILTERS: 'merge-control-routes-filters',
    // Control: tripInstances
    FETCH_CONTROL_TRIP_INSTANCES: 'fetch-control-trip-instances',
    CLEAR_CONTROL_TRIP_INSTANCES: 'clear-control-trip-instances',
    UPDATE_CONTROL_TRIP_INSTANCES_LOADING: 'update-control-trip-instances-loading',
    UPDATE_CONTROL_TRIP_INSTANCES_UPDATING: 'update-control-trip-instances-updating',
    UPDATE_CONTROL_TRIP_INSTANCE_ENTRY: 'update_control_trip_instance_entry',
    SET_TRIP_INSTANCE_ACTION_RESULT: 'set_trip_instance_action_result',
    CLEAR_TRIP_INSTANCE_ACTION_RESULT: 'clear_trip_instance_action_result',
    UPDATE_TRIP_INSTANCE_ACTION_LOADING: 'update_trip_instance_action_loading',
    UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE: 'update-control-active-trip-instance',
    ADD_CONTROL_TRIP_INSTANCE_ENTRY: 'add-control-active-trip-instance',
    SELECT_CONTROL_SINGLE_TRIP: 'select-control-single-trip',
    SELECT_CONTROL_ALL_TRIPS: 'select-control-all-trips',
    DESELECT_CONTROL_ALL_TRIPS: 'deselect-control-all-trips',
    UPDATE_CONTROL_SELECTED_TRIPS: 'update-control-selected-trips',
    SELECT_CONTROL_SINGLE_STOP: 'select-control-single-stop',
    DESELECT_CONTROL_ALL_STOPS_BY_TRIP: 'deselect-control-all-stops-by-trip',
    UPDATE_CONTROL_SELECTED_STOPS_BY_TRIP: 'update-control-selected-stops-by-trip',
    UPDATE_CONTROL_SELECTED_STOPS_UPDATING: 'update-control-selected-stops-updating',
    CLEAR_CONTROL_SELECTED_STOPS: 'clear-control-selected-stops',
    // Control: Cross Link
    UPDATE_TRIP_CROSS_LINK: 'update-trip-cross-link',
    CLEAR_TRIP_CROSS_LINK: 'clear-trip-cross-link',
    // Control: Service date
    UPDATE_SERVICE_DATE: 'update-service-date',
    // Control: Platforms
    UPDATE_PLATFORMS: 'update-platforms',
    // User
    UPDATE_USER_PROFILE: 'update-user-profile',
    UPDATE_USER_BLOCKS_PERMISSIONS: 'update-user-blocks-permissions',
    UPDATE_USER_ROUTES_PERMISSIONS: 'update-user-routes-permissions',
    // Notifications:
    FETCH_CONTROL_NOTIFICATIONS: 'fetch-control-notifications',
    UPDATE_CONTROL_NOTIFICATIONS_ROUTES: 'update-control-notifications-routes',
    UPDATE_CONTROL_NOTIFICATIONS_FILTERS: 'update-notifications-filters',
    UPDATE_CONTROL_NOTIFICATIONS_ROUTES_SEARCH_RESULTS: 'update-control-notifications-search-results',
    UPDATE_USER_PERMISSIONS: 'update-user-permissions',
    // Disruptions
    FETCH_CONTROL_DISRUPTIONS: 'fetch-control-disruptions',
    UPDATE_CONTROL_DISRUPTIONS_PERMISSIONS: 'update-control-disruptions-permissions',
    UPDATE_CONTROL_DISRUPTIONS_LOADING: 'update-control-disruptions-loading',
    UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING: 'update-control-disruption-action-requesting',
    UPDATE_CONTROL_DISRUPTION_ACTION_RESULT: 'update-control-disruption-action-result',
    UPDATE_CONTROL_ACTIVE_DISRUPTION_ID: 'update-control-active-disruption-id',
    UPDATE_DISRUPTIONS_REVERSE_GEOCODE_LOADING_STATE: 'update-disruptions-reverse-geocode-loading-state',
    UPDATE_DISRUPTIONS_ROUTES_LOADING_STATE: 'update-disruptions-routes-loading-state',
    COPY_DISRUPTION: 'copy-disruptions',

    // TripReplays
    UPDATE_CONTROL_TRIP_REPLAYS_LOADING: 'update-control-trip-replays-loading',
    UPDATE_CONTROL_TRIP_REPLAYS_CURRENT_TRIP_DETAIL: 'update-control-trip-replays-current-trip-detail',
    CLEAR_CONTROL_TRIP_REPLAY_CURRENT_TRIP: 'clear-control-trip-replay-current-trip',
    UPDATE_CONTROL_TRIP_REPLAYS_SEARCH_TERM: 'update-control-trip-replay-search-term',
    RESET_CONTROL_TRIP_REPLAYS_SEARCH_TERM: 'reset-control-trip-replay-search-term',
    UPDATE_CONTROL_TRIP_REPLAYS_SEARCH_DATE: 'update-control-trip-replay-search-date',
    UPDATE_CONTROL_TRIP_REPLAYS_START_TIME: 'update-control-trip-replay-start-time',
    UPDATE_CONTROL_TRIP_REPLAYS_END_TIME: 'update-control-trip-replay-end-time',
    UPDATE_CONTROL_TRIP_REPLAYS_DISPLAY_FILTERS: 'update-control-trip-replay-display-filters',
    UPDATE_CONTROL_TRIP_REPLAYS_CLEAR_DATE: 'update-control-trip-replay-clear-date',
    FETCH_CONTROL_TRIP_REPLAYS_TRIPS: 'update-control-trip-replay-trips',
    CLEAR_CONTROL_TRIP_REPLAYS_TRIPS: 'clear-control-trip-replay-trips',
    DISPLAY_CONTROL_TRIP_REPLAYS_SINGLE_TRIP: 'display-control-trip-replays-single-trip',
};
