import React from 'react';
import PropTypes from 'prop-types';

import './Main.scss';

const Main = props => (
    <section className={ `main ${props.className}` }>
        { props.children }
    </section>
);

Main.propTypes = {
    children: PropTypes.array.isRequired,
    className: PropTypes.string,
};

Main.defaultProps = {
    className: '',
};

export default Main;
