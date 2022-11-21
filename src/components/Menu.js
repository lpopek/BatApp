import React from 'react';
import PropTypes from 'prop-types';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import MapWrapper from './Map.js';
import ColumnGroupingTable from './Table.js';



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box >
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabSwitcher(props) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box sx={{ width: 0.95, bgcolor: '#EDEDED', mx: 'auto'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Display Map" {...a11yProps(0)} />
          <Tab label="Recently discovered" {...a11yProps(1)} />
          {/* <Tab label="About" {...a11yProps(2)}/> */}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <MapWrapper features={props.geopoints} isoData = {props.isoData}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ColumnGroupingTable tableData={props.tableData} isoData = {props.isoData}/>
      </TabPanel>
      {/* <TabPanel value={value} index={2}>
        <Box></Box>
      </TabPanel> */}
    </Box>
  );
}
