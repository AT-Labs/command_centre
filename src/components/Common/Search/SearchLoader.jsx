import React from 'react';
import Loader from '../Loader/Loader';

const SearchLoader = () => (
    <div className="search__loader">
        <Loader ariaLabel="Loading addresses" />
    </div>
);

export default SearchLoader;
