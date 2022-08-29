import { Box } from '@mui/material';

import TabSwitcher from './components/Menu.js'
import Header from './components/Header.js'



import React from 'react';
import Footer from './components/Footer.js';

function App() {

  return (
    <div className="App">
      <Box sx={{width: 1, maxHeight: '1120px', bgcolor: 'black', mx: '0'}}>
        <Header className="Footer"/>
        <TabSwitcher/>
        <Footer className="Footer"/>
      </Box>
    </div>
  );
}

export default App;
