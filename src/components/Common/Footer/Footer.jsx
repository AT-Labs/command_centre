import React from 'react';
import PropTypes from 'prop-types';

const Footer = props => (
    <footer className={ `${props.className} bg-white px-2` }>
        <div className="container-fluid">
            <div className="row">
                { props.children }
            </div>
        </div>
    </footer>
);

Footer.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
};

Footer.defaultProps = {
    className: '',
};

export default Footer;
