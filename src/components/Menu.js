import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import GeoJSON from 'ol/format/GeoJSON'

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

export default function TabSwitcher() {

  const [ features, setFeatures ] = useState([])
  useEffect( () => {

    fetch('./mock-geojson-api.json')
      .then(response => response.json())
      .then( (fetchedFeatures) => {
        // parse fetched geojson into OpenLayers features
        //  use options to convert feature from EPSG:4326 to EPSG:3857
        const wktOptions = {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }
        const parsedFeatures = new GeoJSON().readFeatures(fetchedFeatures)
        // set features into state (which will be passed into OpenLayers
        //  map component as props)
        setFeatures(parsedFeatures)
      })
  
  },[])
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
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <MapWrapper features={features}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ColumnGroupingTable/>
      </TabPanel>
    </Box>
  );
}
