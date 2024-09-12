import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from "react-router-dom";

import './index.css';
import ScrollToTop from './utils/ScrollToTop';

const darkTheme = createTheme({
  typography: {
    fontFamily: 'Uncut-Sans-Variable'
  },
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(255, 255, 255)',
    },
    secondary: {
      main: 'rgb(166, 213, 250)'
    }
  },
});

ReactDOM.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <BrowserRouter>
      <ScrollToTop>
        <App />
      </ScrollToTop>
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
);

