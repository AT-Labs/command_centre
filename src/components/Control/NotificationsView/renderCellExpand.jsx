import * as React from 'react';
import { Paper, Popper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { isOverflown } from '@material-ui/data-grid';

const useStyles = makeStyles(theme => createStyles({
    root: {
        alignItems: 'center',
        lineHeight: '24px',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        '& .MuiRating-root': {
            marginRight: theme.spacing(1),
        },
        '& .cellValue': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    },
}));

const CellExpand = React.memo((props) => {
    const { width, value } = props;
    const wrapper = React.useRef(null);
    const cellDiv = React.useRef(null);
    const cellValue = React.useRef(null);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const classes = useStyles();
    const [showFullCell, setShowFullCell] = React.useState(false);
    const [showPopper, setShowPopper] = React.useState(false);

    const showCell = React.useCallback(() => {
        setShowFullCell(true);
    }, []);
    const hideCell = React.useCallback(() => {
        setShowFullCell(false);
    }, []);

    React.useEffect(() => {
        if (cellDiv.current) {
            setAnchorEl(cellDiv.current);
        }
    }, []);
    React.useEffect(() => {
        if (cellValue && cellValue.current) {
            const isCurrentlyOverflown = isOverflown(cellValue.current);
            setShowPopper(isCurrentlyOverflown);
        }
    }, [width]);

    return (
        <div
            ref={ wrapper }
            className={ classes.root }
            onMouseEnter={ showCell }
            onMouseLeave={ hideCell }
        >
            <div
                ref={ cellDiv }
                style={ {
                    height: 1,
                    width,
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                } }
            />
            <div ref={ cellValue } className="cellValue">
                {value}
            </div>
            {showPopper && (
                <Popper
                    id="popper"
                    open={ showFullCell && anchorEl != null }
                    anchorEl={ anchorEl }
                    style={ { width, marginLeft: -17 } }
                >
                    <Paper
                        elevation={ 1 }
                        style={ { minHeight: wrapper.current.offsetHeight - 2 } }
                    >
                        <div style={ { padding: 5 } }>{value}</div>
                    </Paper>
                </Popper>
            )}
        </div>
    );
});
export function RenderCellExpand(params) {
    return (
        <CellExpand
            value={ params.value ? params.value.toString() : '' }
            width={ params.colDef.width }
        />
    );
}
