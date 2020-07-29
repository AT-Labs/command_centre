import React from 'react';

import RouteDetails from './RouteDetails/RouteDetails';
import Routes from './RouteDetails/Routes';

const RouteDetailView = () => (
    <section className="route-detail-view">
        <RouteDetails />
        <Routes />
    </section>
);

export default RouteDetailView;
