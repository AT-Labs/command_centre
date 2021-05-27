import React from 'react';
import PropTypes from 'prop-types';
import { idFromString } from '../../../../utils/helpers';

import './ReleaseNotes.scss';

const ELEMENT_TYPES = {
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    ul: 'ul',
    img: 'img',
};

const ReleaseNotes = ({ notes }) => (
    <div className="release-notes">
        {notes.map((element) => {
            const { tag, content, items, alt, src } = element;
            if (tag === ELEMENT_TYPES.h1) {
                const key = idFromString(content.slice(0, 50));
                return <h3 key={ key }>{content}</h3>;
            }

            if (tag === ELEMENT_TYPES.h2) {
                const key = idFromString(content.slice(0, 50));
                return <h4 key={ key }>{content}</h4>;
            }

            if (tag === ELEMENT_TYPES.p) {
                const key = idFromString(content.slice(0, 50));
                return <p key={ key }>{content}</p>;
            }

            if (tag === ELEMENT_TYPES.ul) {
                const key = items.reduce((result, item) => result + idFromString(item).slice(0, 10), '');
                return (
                    <ul className="m-0" key={ key }>
                        {items.map(item => <li key={ idFromString(item) }>{item}</li>)}
                    </ul>
                );
            }
            if (tag === ELEMENT_TYPES.img) {
                return (
                    <img className="mw-100" key={ idFromString(alt + src) } alt={ alt || '' } src={ src } />
                );
            }

            return null;
        })}
    </div>
);

ReleaseNotes.propTypes = {
    notes: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.shape({
                tag: PropTypes.oneOf([ELEMENT_TYPES.h1, ELEMENT_TYPES.h2, ELEMENT_TYPES.p]).isRequired,
                content: PropTypes.string.isRequired,
            }),
            PropTypes.shape({
                tag: PropTypes.oneOf([ELEMENT_TYPES.ul]).isRequired,
                items: PropTypes.arrayOf(PropTypes.string).isRequired,
            }),
            PropTypes.shape({
                tag: PropTypes.oneOf([ELEMENT_TYPES.img]).isRequired,
                alt: PropTypes.string,
                src: PropTypes.string.isRequired,
            }),
        ]),
    ).isRequired,
};

export default ReleaseNotes;
