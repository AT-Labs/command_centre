import React from 'react';
import PropTypes from 'prop-types';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import DiversionsButton from './DiversionsButton';

const HeaderButtons = ({
    disruption,
    useDiversionFlag,
    isDiversionManagerOpen,
    isWorkaroundPanelOpen,
    onViewDiversions,
    onOpenWorkaroundPanel,
    openDiversionManagerAction,
    updateDiversionModeAction,
    updateDiversionToEditAction,
    toggleEditEffectPanel,
    fetchDiversionsAction,
    clearDiversionsCacheAction,
}) => {
    return (
        <>
            {useDiversionFlag && (
                                                    <DiversionsButton 
                                        disruption={disruption}
                                        onViewDiversions={onViewDiversions}
                                        useDiversionFlag={useDiversionFlag}
                                        openDiversionManagerAction={openDiversionManagerAction}
                                        updateDiversionModeAction={updateDiversionModeAction}
                                        updateDiversionToEditAction={updateDiversionToEditAction}
                                        isDiversionManagerOpen={isDiversionManagerOpen}
                                        toggleEditEffectPanel={toggleEditEffectPanel}
                                        fetchDiversionsAction={fetchDiversionsAction}
                                        clearDiversionsCacheAction={clearDiversionsCacheAction}
                                    />
            )}
        </>
    );
};

HeaderButtons.propTypes = {
    disruption: PropTypes.object,
    useDiversionFlag: PropTypes.bool,
    isDiversionManagerOpen: PropTypes.bool,
    isWorkaroundPanelOpen: PropTypes.bool,
    onViewDiversions: PropTypes.func,
    onOpenWorkaroundPanel: PropTypes.func,
    openDiversionManagerAction: PropTypes.func,
    updateDiversionModeAction: PropTypes.func,
    updateDiversionToEditAction: PropTypes.func,
    toggleEditEffectPanel: PropTypes.func,
    fetchDiversionsAction: PropTypes.func,
    clearDiversionsCacheAction: PropTypes.func,
};

export default HeaderButtons; 