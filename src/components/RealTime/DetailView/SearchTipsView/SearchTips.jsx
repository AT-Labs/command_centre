import React from 'react';
import Icon from '../../../Common/Icon/Icon';

import './SearchTips.scss';

const SearchTips = () => (
    <div className="search-tips h-100">
        <Icon className="search-tips-icon" icon="search" />
        <h3 className="font-weight-bold search-tips-title">Search tips</h3>
        <div>
            <h3 className="text-muted font-weight-normal search-tips-content">
                Search and select multiple routes, stop or vehicles to view on the map
            </h3>
        </div>
    </div>
);

export default SearchTips;
