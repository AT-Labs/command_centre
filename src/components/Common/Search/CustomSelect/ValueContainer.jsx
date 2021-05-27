import React, { useState, useRef, useEffect } from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';

import { SEARCH_BAR_INPUT_STATE } from '../constants';

const { INITIAL, COLLAPSED, EXPANDED } = SEARCH_BAR_INPUT_STATE;

const ValueContainer = ({ children, ...props }) => {
    const valueContainerRef = useRef(null);
    const valueContainerWidth = useRef(0);
    const childrenWidth = [];
    const previousMultiValueCount = useRef(0);
    const previousInputCollapseState = useRef(props.selectProps.inputCollapseState);
    const [childrenDisplayed, setChildrenDisplayed] = useState({ count: 0 });

    const isValuePlaceholder = value => !Array.isArray(value);

    let value = children[0];
    const input = children[1];
    if (!isValuePlaceholder(value)) {
        value = value.map(multiValue => (
            React.cloneElement(multiValue, {
                ref: (element) => {
                    if (element) {
                        childrenWidth.push(element.getBoundingClientRect().width);
                    }
                },
            })
        ));

        if (previousMultiValueCount.current === value.length) {
            value = value.filter((_, index) => index < childrenDisplayed.count);
        }
    }

    useEffect(() => {
        valueContainerWidth.current = valueContainerRef.current.getBoundingClientRect().width;
        const mustUpdateValue = Array.isArray(children[0]) && (
            children[0].length !== previousMultiValueCount.current
            || props.selectProps.inputCollapseState !== previousInputCollapseState.current
        );
        if (mustUpdateValue) {
            previousMultiValueCount.current = children[0].length;
            let sumWidth = 22; // including input width and padding
            let multiValueToDisplay = 0;
            let wrapOccurs = children[0].length > childrenWidth.length;
            let index = 0;
            while (!wrapOccurs && index < childrenWidth.length) {
                wrapOccurs = sumWidth + childrenWidth[index] >= valueContainerWidth.current;
                if (wrapOccurs) {
                    break;
                }
                multiValueToDisplay += 1;
                sumWidth += childrenWidth[index];
                index += 1;
            }
            if (props.selectProps.inputCollapseState === EXPANDED) {
                multiValueToDisplay = children[0].length;
            }
            setChildrenDisplayed({ count: multiValueToDisplay });
            if (props.selectProps.inputCollapseState === INITIAL && wrapOccurs) {
                props.selectProps.setInputCollapse(COLLAPSED);
                previousInputCollapseState.current = COLLAPSED;
            } else if (props.selectProps.inputCollapseState !== INITIAL && !wrapOccurs) {
                props.selectProps.setInputCollapse(INITIAL);
                previousInputCollapseState.current = INITIAL;
            } else {
                previousInputCollapseState.current = props.selectProps.inputCollapseState;
            }
        }
    }, [valueContainerRef, children, props]);

    return (
        <div ref={ valueContainerRef } className="flex-grow-1">
            <components.ValueContainer { ...props }>
                { value }
                { !isValuePlaceholder(value)
                && props.selectProps.inputCollapseState === COLLAPSED
                && <span>...</span>
                }
                { input }
            </components.ValueContainer>
        </div>
    );
};

ValueContainer.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.element,
    ]).isRequired,
    selectProps: PropTypes.object.isRequired,
};

export default ValueContainer;
