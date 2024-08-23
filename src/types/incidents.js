export const Category = {
    Accidents: 'Accidents',
    WeatherEnvironmentalConditions: 'WeatherEnvironmentalConditions',
    RoadConditions: 'RoadConditions',
    Emergencies: 'Emergencies',
    TrafficCongestion: 'TrafficCongestion',
    SpecialEvents: 'SpecialEvents',
    Roadworks: 'Roadworks',
    RoadClosed: 'RoadClosed',
    Unknown: 'Unknown',
};

export const CategoryLabelMapping = {
    [Category.Accidents]: 'Accidents',
    [Category.WeatherEnvironmentalConditions]: 'Weather/Environmental Conditions',
    [Category.RoadConditions]: 'Road Conditions',
    [Category.Emergencies]: 'Emergencies',
    [Category.TrafficCongestion]: 'Traffic Congestion',
    [Category.SpecialEvents]: 'Special Events',
    [Category.Roadworks]: 'Road Works',
    [Category.RoadClosed]: 'Road Closure',
    [Category.Unknown]: 'Unknown',
};

export const Probability = {
    Certain: 'certain',
    Probable: 'probable',
    RiskOf: 'riskOf',
    Improbable: 'improbable',
};
