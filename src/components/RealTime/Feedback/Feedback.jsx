import React from 'react';
import './Feedback.scss';

const Feedback = () => (
    <a className="feedback-btn position-fixed bg-at-ocean border-0 rounded-0 px-3 py-2"
        href="mailto:commandcentrefeedback@AT.govt.nz?subject=Command%20Centre%20Feedback"
        target="_self"
        tabIndex="0">
        <span>Give feedback</span>
    </a>
);

export default Feedback;
