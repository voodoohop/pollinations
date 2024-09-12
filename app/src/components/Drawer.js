import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export default function TemporaryDrawer({ drawerState, children }) {
  const [state, setState] = drawerState;

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState(open);
  };

  // Removed the onClose prop to allow the page to be scrollable when the drawer is open
  return <Drawer anchor='top' open={state} variant="persistent">
    <DrawerContainer onKeyDown={toggleDrawer(false)}>
      {children}
    </DrawerContainer>
  </Drawer>
};

const DrawerContainer = styled('div')`
background-color: black;
`;