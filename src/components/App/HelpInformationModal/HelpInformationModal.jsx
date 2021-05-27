import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import CustomModal from '../../Common/CustomModal/CustomModal';
import * as blobService from '../../../utils/transmitters/blob-service';
import FAQ from './FAQ/FAQ';
import ReleaseNotes from './ReleaseNotes/ReleaseNotes';
import { idFromString } from '../../../utils/helpers';

const FAQs = [{
    question: 'Do I have access to all features?',
    answer: `All users would have read only access to most features within Command Centre.
    If you require write access as part of your role, you must raise this through the access request within AT Assist.`,
}, {
    question: 'Something is broken, what do I do?',
    answer: 'Please raise an incident at the earliest so the support team can identify and resolve the issue ASAP.',
}, {
    question: 'How can I give feedback/improvement ideas?',
    answer: 'Email to CommandCentreFeedback@at.govt.nz',
}];

export const HelpInformationModal = ({ onClose }) => {
    const [releaseNotes, setReleaseNotes] = useState('');

    useEffect(() => {
        blobService.getReleaseNotes().then((notes) => {
            setReleaseNotes(notes);
        });
    }, []);

    const manualLink = blobService.getManualLink();

    return (
        <CustomModal
            className=""
            title="Helpful information"
            onClose={ onClose }
            isModalOpen
        >
            {!!manualLink && (
                <section className="mb-4">
                    <h3>Training Manual</h3>
                    <a href={ manualLink } target="_blank" rel="noreferrer" download>Download the manual</a>
                </section>
            )}
            <section className="mb-4">
                <h3>FAQ</h3>
                {FAQs.map((faq, index) => {
                    const isLastItem = index === (FAQs.length - 1);
                    const id = idFromString(faq.question);
                    return (
                        <FAQ className={ isLastItem ? '' : 'mb-2' } key={ id } id={ id } question={ faq.question } answer={ faq.answer } />
                    );
                })}
            </section>
            {!!releaseNotes && (
                <section className="mb-4">
                    <h3>Release notes</h3>
                    <ReleaseNotes notes={ releaseNotes } />
                </section>
            )}
        </CustomModal>
    );
};

HelpInformationModal.propTypes = {
    onClose: PropTypes.func.isRequired,
};
