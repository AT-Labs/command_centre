import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

const WhiteTooltip = styled(({ className, ...props }) => (
    <Tooltip { ...props } classes={ { popper: className } } />
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#fff',
        color: '#000',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '0.875rem',
    },
}));

const SingleLineTextWithTooltip = (props) => {
    const { text } = props;
    return (
        <WhiteTooltip title={ text }>
            <span
                style={ {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    maxWidth: '100%',
                } }
            >
                {text}
            </span>
        </WhiteTooltip>
    );
};

SingleLineTextWithTooltip.propTypes = {
    text: PropTypes.string.isRequired,
};

export default SingleLineTextWithTooltip;
