export default {
    initial: 'Failed to load prerequisite data. \nPlease try again later.',
    critical: 'Schedule data unavailable - application is not operational.',
    fetchPastStops: 'Past stops data unavailable, please try again.',
    fetchPastVehicles: 'Past vehicles data unavailable, please try again.',
    fetchPidInformation: 'PID information data unavailable, please try again.',
    geocode: 'Address search unavailable, please try again.',
    geocodeEnabled: false,
    realtime: 'Live vehicle tracking is unavailable at the moment, attempting to reconnect.',
    routesByStop: 'Routes data unavailable, please try again.',
    snapshot: 'Unable to load all vehicle locations.',
    upcomingVehicles: 'Upcoming vehicles data unavailable, please try again.',
    upcomingStops: 'Upcoming stops data unavailable, please try again.',
    vehicleFleetInfo: 'Vehicle capacity data unavailable, please try again.',
    routesFetch: 'Routes data unavailable, please try again.',
    routesFetchEnabled: false,
    routeVariantsFetch: 'Route variants data unavailable, please try again.',
    tripUpdateFailed: tripId => `Sorry, the modification of trip ${tripId} failed`,
    tripNotFound: tripId => `Sorry, we can't find the trip ${tripId}`,
    blockExisted: 'The block you are trying to add already exists',
    addBlock: 'Unable to add a new block, please try again',
    updateBlock: 'Unable to update a new block, please try again',
    moveTrips: 'Unable to move trips to the selected block, please try again',
    fetchStopMessages: false,
    fetchStopMessagesEnabled: false,
    fetchStopGroups: 'Unable to load groups, please try again',
    createStopMessage: 'Unable to create message, please try again',
    createStopGroup: 'Unable to create group, please try again',
    fetchAgencies: 'Agencies data unavailable, please try again.',
    fetchAgenciesEnabled: false,
    fetchAlerts: 'Alerts data unavailable, please try again.',
    userPermissions: 'User permission details unavailable, please try again.',
    fetchFleetEnabled: true,
    fetchDisruptions: 'Unable to load disruptions, please try again',
    fetchNotifications: 'Unable to load notifications, please try again',
    disruptionUpdate: incidentNo => `Failed to update disruption ${incidentNo}.`,
    disruptionCreate: 'Failed to create disruption',
    fetchDisruptionsEnabled: false,
    fetchNotificationsEnabled: false,
    fetchPlatforms: false,
    fetchBlock: false,
    tripsFetch: false,
    fetchTripReplayEnabled: false,
    fetchTripReplayMessage: 'Failed to load trip replay, please try again',
    notificationUpdate: (disruptionId, version) => `Failed to update notification for Disruption ${disruptionId} version ${version}`,
    notificationPublish: (disruptionId, version) => `Failed to publish notification for Disruption ${disruptionId} version ${version}`,
    notificationDelete: (disruptionId, version) => `Failed to delete notification for Disruption ${disruptionId} version ${version}`,
};
