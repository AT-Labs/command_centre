import React from 'react';
import PropTypes from 'prop-types';
import { Button, UncontrolledCollapse } from 'reactstrap';

const FAQ = ({ className, id, question, answer }) => (
    <div className={ className }>
        <Button color="link" id={ id }>{ question }</Button>
        <UncontrolledCollapse className="mt-2 ml-4" toggler={ id }>
            { answer }
        </UncontrolledCollapse>
    </div>
);

FAQ.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
};

FAQ.defaultProps = {
    className: '',
};

export default FAQ;
