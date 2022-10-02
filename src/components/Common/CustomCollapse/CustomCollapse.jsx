import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Button, Collapse } from 'reactstrap';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import './CustomCollapse.scss';

export const CustomCollapse = (props) => {
    const collapseRef = React.useRef(null);
    const [collapse, setCollapse] = useState();
    const [collapseInitialHeight, setInitialHeight] = useState(0);

    useEffect(() => {
        setInitialHeight(collapseRef.current.clientHeight);
    }, []);

    const toggle = () => setCollapse(!collapse);

    const showViewMoreLessButton = () => {
        const collapseNode = collapseRef.current;
        return collapseNode && collapseNode.scrollHeight > collapseInitialHeight;
    };

    return (
        <section className={ `custom-collapse__contain ${props.height} ${props.className}` }>
            <div className="w-100">
                <Collapse innerRef={ collapseRef } isOpen={ collapse } className="w-100">
                    { props.children }
                </Collapse>
                {showViewMoreLessButton() && (
                    <Button
                        className="btn cc-btn-link pl-0 pt-1 font-weight-bold"
                        onClick={ toggle }>
                        {collapse ? 'View less' : 'View more'}
                        {collapse
                            ? <IoIosArrowUp size={ 20 } color="black" className="ml-1" />
                            : <IoIosArrowDown size={ 20 } color="black" className="ml-1" />}
                    </Button>
                )}
            </div>
        </section>
    );
};

CustomCollapse.propTypes = {
    children: PropTypes.element.isRequired,
    className: PropTypes.string,
    height: PropTypes.oneOf(['tiny', 'small']),
};

CustomCollapse.defaultProps = {
    className: '',
    height: 'small',
};

export default CustomCollapse;
