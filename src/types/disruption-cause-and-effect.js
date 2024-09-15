export const DEFAULT_IMPACT = {
    label: '',
    value: '',
};

export const IMPACTS = [
    DEFAULT_IMPACT,
    {
        label: 'Alternate transport',
        value: 'ALTERNATE_TRANSPORT',
    },
    {
        label: 'Bus replacement',
        value: 'BUS_REPLACEMENT',
    },
    {
        label: 'Bus stop closed',
        value: 'BUS_STOP_CLOSED',
    },
    {
        label: 'Cancellations',
        value: 'CANCELLATIONS',
    },
    {
        label: 'Customers left behind',
        value: 'CUSTOMERS_LEFT_BEHIND',
    },
    {
        label: 'Delays',
        value: 'DELAYS',
    },
    {
        label: 'Delays and cancellations',
        value: 'DELAYS_AND_CANCELLATIONS',
    },
    {
        label: 'Detour',
        value: 'DETOUR',
    },
    {
        label: 'Escalator not working',
        value: 'ESCALATOR_NOT_WORKING',
    },
    {
        label: 'Lift not working',
        value: 'LIFT_NOT_WORKING',
    },
    {
        label: 'Partial cancellation',
        value: 'PARTIAL_CANCELLATION',
    },
    {
        label: 'Pier closed',
        value: 'PIER_CLOSED',
    },
    {
        label: 'Reduced capacity',
        value: 'REDUCED_CAPACITY',
    },
    {
        label: 'Reduced customer Information',
        value: 'REDUCED_CUSTOMER_INFORMATION',
    },
    {
        label: 'Reduced frequency',
        value: 'REDUCED_FREQUENCY',
    },
    {
        label: 'Service cancelled',
        value: 'SERVICE_CANCELLED',
    },
    {
        label: 'Some cancellations',
        value: 'SOME_CANCELLATIONS',
    },
    {
        label: 'Stop closed',
        value: 'STOP_CLOSED',
    },
    {
        label: 'Stop moved',
        value: 'STOP_MOVED',
    },
    {
        label: 'Taxi replacement',
        value: 'TAXI_REPLACEMENT',
    },
];

export const DEFAULT_CAUSE = {
    label: '',
    value: '',
};

export const CAUSES = [
    DEFAULT_CAUSE,
    {
        label: 'Boarding and disembarking delays',
        value: 'BOARDING_AND_DISEMBARKING_DELAYS',
    },
    {
        label: 'Breakdown',
        value: 'BREAKDOWN',
    },
    {
        label: 'Bunkering, Thrusters',
        value: 'BUNKERING_THRUSTERS',
    },
    {
        label: 'Capacity Issue',
        value: 'CAPACITY_ISSUE',
    },
    {
        label: 'Congestion',
        value: 'CONGESTION',
    },
    {
        label: 'Cruise ship arrival',
        value: 'CRUISE_SHIP_ARRIVAL',
    },
    {
        label: 'Cruise ship departure',
        value: 'CRUISE_SHIP_DEPARTURE',
    },
    {
        label: 'Cruise ship operations',
        value: 'CRUISE_SHIP_OPERATIONS',
    },
    {
        label: 'Customer matter',
        value: 'CUSTOMER_MATTER',
    },
    {
        label: 'Emergency services incident',
        value: 'EMERGENCY_SERVICES_INCIDENT',
    },
    {
        label: 'Event',
        value: 'EVENT',
    },
    {
        label: 'Flooding',
        value: 'FLOODING',
    },
    {
        label: 'Health and Safety Event',
        value: 'HEALTH_AND_SAFETY_EVENT',
    },
    {
        label: 'High customer numbers',
        value: 'HIGH_CUSTOMER_NUMBERS',
    },
    {
        label: 'Incident',
        value: 'INCIDENT',
    },
    {
        label: 'Industrial action',
        value: 'INDUSTRIAL_ACTION',
    },
    {
        label: 'Infrastructure Issue',
        value: 'INFRASTRUCTURE_ISSUE',
    },
    {
        label: 'Maintenance',
        value: 'MAINTENANCE',
    },
    {
        label: 'Mechanical issues',
        value: 'MECHANICAL_ISSUES',
    },
    {
        label: 'Operational Constraints',
        value: 'OPERATIONAL_CONSTRAINTS',
    },
    {
        label: 'Operational Incident',
        value: 'OPERATIONAL_INCIDENT',
    },
    {
        label: 'Other',
        value: 'OTHER',
    },
    {
        label: 'Overhead line problem',
        value: 'OVERHEAD_LINE_PROBLEM',
    },
    {
        label: 'Protest',
        value: 'PROTEST',
    },
    {
        label: 'Roadworks',
        value: 'ROADWORKS',
    },
    {
        label: 'Signal issue',
        value: 'SIGNAL_ISSUE',
    },
    {
        label: 'Staff matter',
        value: 'STAFF_MATTER',
    },
    {
        label: 'System Outage',
        value: 'SYSTEM_OUTAGE',
    },
    {
        label: 'Tidal issue',
        value: 'TIDAL_ISSUE',
    },
    {
        label: 'Track fault',
        value: 'TRACK_FAULT',
    },
    {
        label: 'Trespasser',
        value: 'TRESPASSER',
    },
    {
        label: 'Vandalism',
        value: 'VANDALISM',
    },
    {
        label: 'Weather - fog',
        value: 'WEATHER_FOG',
    },
    {
        label: 'Weather - high winds',
        value: 'WEATHER_HIGH_WINDS',
    },
    {
        label: 'Weather Event',
        value: 'WEATHER_EVENT',
    },
];

export const OLD_IMPACTS = [
    {
        label: 'Additional services',
        value: 'ADDITIONAL_SERVICE',
    },
    {
        label: 'Buses replace trains',
        value: 'BUSES_REPLACE_TRAINS',
    },
    {
        label: 'No service',
        value: 'NO_SERVICE',
    },
    {
        label: 'Modified service',
        value: 'MODIFIED_SERVICE',
    },
    {
        label: 'Other effect (not represented by any of these options)',
        value: 'OTHER_EFFECT',
    },
    {
        label: 'Reduced service',
        value: 'REDUCED_SERVICE',
    },
    {
        label: 'Services replaced by alternative transport',
        value: 'SERVICES_REPLACED_BY_ALTERNATIVE_TRANSPORT',
    },
    {
        label: 'Significant delays',
        value: 'SIGNIFICANT_DELAYS',
    },
    {
        label: 'Speed restrictions',
        value: 'SPEED_RESTRICTIONS',
    },
    {
        label: 'Unknown effect',
        value: 'UNKNOWN_EFFECT',
    },
];

export const OLD_CAUSES = [
    {
        label: 'Accident',
        value: 'ACCIDENT',
    },
    {
        label: 'Construction',
        value: 'CONSTRUCTION',
    },
    {
        label: 'Demonstration',
        value: 'DEMONSTRATION',
    },
    {
        label: 'Derailment',
        value: 'DERAILMENT',
    },
    {
        label: 'Ferry traffic',
        value: 'FERRY_TRAFFIC',
    },
    {
        label: 'Holiday',
        value: 'HOLIDAY',
    },
    {
        label: 'Level crossing issue',
        value: 'LEVEL_CROSSING_ISSUE',
    },
    {
        label: 'Medical Emergency',
        value: 'MEDICAL_EMERGENCY',
    },
    {
        label: 'Other Cause (not represented by any of these options)',
        value: 'OTHER_CAUSE',
    },
    {
        label: 'Police Activity',
        value: 'POLICE_ACTIVITY',
    },
    {
        label: 'Severe weather',
        value: 'SEVERE_WEATHER',
    },
    {
        label: 'Strike',
        value: 'STRIKE',
    },
    {
        label: 'Technical Problem',
        value: 'TECHNICAL_PROBLEM',
    },
    {
        label: 'Tides',
        value: 'TIDES',
    },
    {
        label: 'Unknown Cause',
        value: 'UNKNOWN_CAUSE',
    },
    {
        label: 'Weather',
        value: 'WEATHER',
    },
    {
        label: 'Weather - heat',
        value: 'WEATHER_HEAT',
    },
];
