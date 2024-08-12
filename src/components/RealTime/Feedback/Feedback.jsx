import React from 'react';
import { connect } from 'react-redux';
import { LuClipboardEdit } from 'react-icons/lu';
import PropTypes from 'prop-types';

import { useNewRealtimeMapFilters } from '../../../redux/selectors/appSettings';

import './Feedback.scss';

const Feedback = props => (
    <a className={ `${props.useNewRealtimeMapFilters ? 'feedback-btn-bottom rounded-top' : 'feedback-btn rounded-0'} position-fixed bg-at-ocean border-0 px-3 py-2` }
        href="mailto:commandcentrefeedback@AT.govt.nz?subject=Command%20Centre%20Feedback"
        target="_self"
        tabIndex="0">
        <span>
            {props.useNewRealtimeMapFilters ? (
                <>
                    <LuClipboardEdit />
                    {' '}
                    Give feedback
                </>
            ) : 'Give feedback' }
        </span>
    </a>
);

Feedback.propTypes = {
    useNewRealtimeMapFilters: PropTypes.bool.isRequired,
};

export default connect(
    state => ({
        useNewRealtimeMapFilters: useNewRealtimeMapFilters(state),
    }),
    { },
)(Feedback);
