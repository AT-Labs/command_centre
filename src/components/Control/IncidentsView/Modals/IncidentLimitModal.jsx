import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { IconContext } from 'react-icons';
import { FaExclamationTriangle } from 'react-icons/fa';

import CustomModal from '../../../Common/CustomModal/CustomModal';

const IncidentLimitModal = ({
    isOpen,
    onClose,
    totalEntities,
    itemsSelectedText,
    maxLimit,
}) => {
    const iconContextValue = useMemo(() => ({ className: 'text-warning w-100 m-2' }), []);
    return (
        <CustomModal
            title="Log a Disruption"
            okButton={ {
                label: 'OK',
                onClick: onClose,
                isDisabled: false,
                className: 'test',
            } }
            onClose={ onClose }
            isModalOpen={ isOpen }>
            <IconContext.Provider value={ iconContextValue }>
                <FaExclamationTriangle size={ 40 } />
            </IconContext.Provider>
            <p className="font-weight-light text-center mb-0">
                {`${totalEntities} ${itemsSelectedText} have been selected. Please reduce the selection to less than the maximum allowed of ${maxLimit}`}
            </p>
        </CustomModal>
    );
};

IncidentLimitModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    totalEntities: PropTypes.number.isRequired,
    itemsSelectedText: PropTypes.string.isRequired,
    maxLimit: PropTypes.number.isRequired,
};

export default IncidentLimitModal;
