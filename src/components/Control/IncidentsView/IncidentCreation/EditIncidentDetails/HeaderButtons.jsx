import React from 'react';
import PropTypes from 'prop-types';

import DiversionsButton from './DiversionsButton';

const HeaderButtons = ({
    disruption,
    useDiversionFlag,
    isDiversionManagerOpen,
    onViewDiversions,
    openDiversionManagerAction,
    updateDiversionModeAction,
    updateDiversionToEditAction,
    toggleEditEffectPanel,
    fetchDiversionsAction,
    clearDiversionsCacheAction,
}) => (
    <>
        {useDiversionFlag && (
            <DiversionsButton
                disruption={ disruption }
                onViewDiversions={ onViewDiversions }
                useDiversionFlag={ useDiversionFlag }
                openDiversionManagerAction={ openDiversionManagerAction }
                updateDiversionModeAction={ updateDiversionModeAction }
                updateDiversionToEditAction={ updateDiversionToEditAction }
                isDiversionManagerOpen={ isDiversionManagerOpen }
                toggleEditEffectPanel={ toggleEditEffectPanel }
                fetchDiversionsAction={ fetchDiversionsAction }
                clearDiversionsCacheAction={ clearDiversionsCacheAction }
            />
        )}
    </>
);

HeaderButtons.propTypes = {
    disruption: PropTypes.object,
    useDiversionFlag: PropTypes.bool,
    isDiversionManagerOpen: PropTypes.bool,
    onViewDiversions: PropTypes.func,
    openDiversionManagerAction: PropTypes.func,
    updateDiversionModeAction: PropTypes.func,
    updateDiversionToEditAction: PropTypes.func,
    toggleEditEffectPanel: PropTypes.func,
    fetchDiversionsAction: PropTypes.func,
    clearDiversionsCacheAction: PropTypes.func,
};

HeaderButtons.defaultProps = {
    disruption: null,
    useDiversionFlag: false,
    isDiversionManagerOpen: false,
    onViewDiversions: () => {},
    openDiversionManagerAction: () => {},
    updateDiversionModeAction: () => {},
    updateDiversionToEditAction: () => {},
    toggleEditEffectPanel: () => {},
    fetchDiversionsAction: () => {},
    clearDiversionsCacheAction: () => {},
};

export default HeaderButtons;
