import PropTypes from 'prop-types';

export const SearchResultItemShape = PropTypes.shape({
    text: PropTypes.string.isRequired,
    icon: PropTypes.string,
    category: PropTypes.object,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
});

export const SearchResultsShape = PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.object,
    items: PropTypes.arrayOf(SearchResultItemShape),
}));
