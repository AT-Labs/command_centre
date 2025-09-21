export const getColumnClass = (props, baseClass) => {
    if (props.isAddEffectsStep && props.additionalFrontendChangesEnabled) return `col-2${baseClass}`;
    if (props.useDraftDisruptions && props.isDraftOrCreateMode) return `col-3${baseClass}`;
    return `col-4${baseClass}`;
};

export const getFooterClassName = props => `row m-0 justify-content-between p-4 position-fixed incident-footer-min-height ${props.showFinishButton && props.isAddEffectsStep ? 'footer-with-finish-button' : ''} ${props.additionalFrontendChangesEnabled ? 'additional-frontend-changes-enabled' : ''}`;

export const getCancelButtonClassName = (props) => {
    const baseClass = 'btn cc-btn-secondary btn-block';
    return (props.useDraftDisruptions && props.isDraftOrCreateMode) ? baseClass : `${baseClass} pl-0`;
};
