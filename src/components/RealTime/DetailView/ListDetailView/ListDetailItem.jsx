import PropTypes from 'prop-types';
import React from 'react';
import { Collapse, CardBody, Card, CardHeader, Button } from 'reactstrap';
import { BsCaretDownFill, BsCaretUpFill, BsChevronRight } from 'react-icons/bs';

import './ListDetailView.scss';

const ListDetailItem = (props) => {
    const { checked, title, expandable, expanded, expandedLinkText, collapsedLinkText, inExpandableLinkText, cardBody } = props;

    return (
        <Card className="selection-item border-0">
            <CardHeader className="selection-item-header">
                <input type="checkbox" className="align-middle selection-item__checkbox" checked={ checked } onChange={ props.onCheckboxChange } />
                { title }
                <Button color="link" className="cc-btn-link selection-item__button float-right position-relative" onClick={ props.onButtonClick }>
                    { expandable && expanded && (
                        <>
                            { expandedLinkText }
                            <BsCaretUpFill className="selection-item__icon" />
                        </>
                    )}
                    { expandable && !expanded && (
                        <>
                            { collapsedLinkText }
                            <BsCaretDownFill className="selection-item__icon" />
                        </>
                    ) }
                    { !expandable && (
                        <>
                            { inExpandableLinkText }
                            <BsChevronRight className="selection-item__icon" />
                        </>
                    ) }
                </Button>
            </CardHeader>
            {
                expandable && (
                    <Collapse isOpen={ expanded } className="selection-item-body">
                        <CardBody>
                            { cardBody }
                        </CardBody>
                    </Collapse>
                )
            }
        </Card>
    );
};

ListDetailItem.propTypes = {
    onButtonClick: PropTypes.func.isRequired,
    onCheckboxChange: PropTypes.func.isRequired,
    checked: PropTypes.bool,
    title: PropTypes.string,
    expandable: PropTypes.bool,
    expanded: PropTypes.bool,
    expandedLinkText: PropTypes.string,
    collapsedLinkText: PropTypes.string,
    inExpandableLinkText: PropTypes.string,
    cardBody: PropTypes.object,
};

ListDetailItem.defaultProps = {
    expandable: false,
    expanded: false,
    checked: false,
    title: '',
    expandedLinkText: 'Collapse',
    collapsedLinkText: 'Expand',
    inExpandableLinkText: 'View details',
    cardBody: undefined,
};

export default ListDetailItem;
