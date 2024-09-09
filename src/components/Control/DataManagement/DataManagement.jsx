import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import MuiDrawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { MdAddLocationAlt } from 'react-icons/md';
import { Divider, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StopGroupsView from './StopGroups/StopGroupsView';
import { getPageSettings } from '../../../redux/selectors/control/dataManagement/dataManagement';
import { updateDataManagementPageSettings } from '../../../redux/actions/control/dataManagement';
import BusPriorityRoutesDataGrid from './BusPriority/BusPriorityRoutes';
import { useBusPriorityDataManagement } from '../../../redux/selectors/appSettings';
import { getStopMessagesPermissions } from '../../../redux/selectors/control/stopMessaging/stopMessages';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import { isGlobalEditStopMessagesPermitted } from '../../../utils/user-permissions';
import { getControlBusPriorityViewPermission } from '../../../redux/selectors/user';

import './DataManagement.scss';

const drawerWidth = 240;

const openedMixin = theme => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = theme => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        height: '100%',
        zIndex: '1',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export const DataManagement = (props) => {
    const isGlobalEditMessagesPermitted = IS_LOGIN_NOT_REQUIRED || isGlobalEditStopMessagesPermitted(props.stopMessagesPermissions);

    const drawerList = [];

    if (isGlobalEditMessagesPermitted) {
        drawerList.push({
            id: 0,
            icon: <MdAddLocationAlt size={ 25 } />,
            label: 'Stop Groups',
            component: <StopGroupsView displayTitle={ false } />,
            header: 'Manage Stop Groups',
        });
    }

    if (props.useBusPriorityDataManagement && props.isBusPriorityViewPermitted) {
        drawerList.push({
            id: 1,
            icon: <MdAddLocationAlt size={ 25 } />,
            label: 'Bus Priority Routes',
            component: <BusPriorityRoutesDataGrid />,
            header: 'Manage Bus Priority Allowed Routes',
        });
    }

    const handleListItemClick = (event, index) => {
        props.updatePageSettings({ selectedIndex: index });
    };

    const renderListItem = element => (
        <ListItem disablePadding key={ element.id }>
            <ListItemButton selected={ props.pageSettings.selectedIndex === element.id }
                onClick={ event => handleListItemClick(event, element.id) }>
                <ListItemIcon>
                    {element.icon}
                </ListItemIcon>
                <ListItemText primary={ element.label } />
            </ListItemButton>
            <Divider />
        </ListItem>
    );

    const renderContent = () => {
        const result = drawerList.find(menu => menu.id === props.pageSettings.selectedIndex);
        if (result && result.component) return result.component;
        return null;
    };

    const toggleDrawerView = () => props.updatePageSettings({ drawerOpen: !props.pageSettings.drawerOpen });

    return (
        <div className="control-general-settings-view">
            {
                drawerList.length > 0 && (
                    <div className="mb-3">
                        <h1>{ `Data Management - ${drawerList[props.pageSettings.selectedIndex].header}` }</h1>
                        <Box className="pt-2" sx={ { display: 'flex' } }>
                            <Drawer variant="permanent" open={ props.pageSettings.drawerOpen }>
                                <DrawerHeader open={ props.pageSettings.drawerOpen }>
                                    <IconButton onClick={ toggleDrawerView }>
                                        {props.pageSettings.drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                                    </IconButton>
                                </DrawerHeader>
                                <Divider />
                                <List>
                                    {drawerList.map(menu => renderListItem(menu))}
                                </List>
                            </Drawer>
                            <Box sx={ { flexGrow: 1, p: 3, pt: 0 } }>
                                <div>
                                    {renderContent()}
                                </div>
                            </Box>
                        </Box>
                    </div>
                )
            }
        </div>
    );
};

DataManagement.propTypes = {
    pageSettings: PropTypes.object.isRequired,
    updatePageSettings: PropTypes.func.isRequired,
    useBusPriorityDataManagement: PropTypes.bool.isRequired,
    isBusPriorityViewPermitted: PropTypes.bool.isRequired,
    stopMessagesPermissions: PropTypes.array.isRequired,
};

export default connect(state => ({
    pageSettings: getPageSettings(state),
    useBusPriorityDataManagement: useBusPriorityDataManagement(state),
    isBusPriorityViewPermitted: getControlBusPriorityViewPermission(state),
    stopMessagesPermissions: getStopMessagesPermissions(state),
}), {
    updatePageSettings: updateDataManagementPageSettings,
})(DataManagement);
