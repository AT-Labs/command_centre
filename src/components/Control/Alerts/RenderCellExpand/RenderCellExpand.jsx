import * as React from 'react';
import { Paper, Popper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';

const theme = createTheme();

const useStyles = makeStyles(() => ({
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

const isOverflown = element => element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;

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
        <ThemeProvider theme={ theme }>
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
                        style={ { width, marginLeft: -17, pointerEvents: 'none' } }
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
        </ThemeProvider>
    );
});

CellExpand.propTypes = {
    width: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
};

function RenderCellExpand(params) {
    return (
        <CellExpand
            value={ params.value ? params.value.toString() : '' }
            width={ params.colDef.width }
        />
    );
}

export default RenderCellExpand;
