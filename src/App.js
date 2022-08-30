import React, { useState, useEffect } from 'react';

import TabSwitcher from './components/Menu.js'
import Header from './components/Header.js'
import Footer from './components/Footer.js';

import GeoJSON from 'ol/format/GeoJSON'

function App() {

  const [ tableData, setTableData ] = useState([])
  const [ geopoints, setGeopoints ] = useState([])

  useEffect( () => {
    fetch('data/discover.json')
      .then((response) => response.json())
      .then((jsonTableData) => setTableData(jsonTableData))
    }, [])

  useEffect( () => {
    fetch('data/mock-points.json')
      .then((response) => response.json())
      .then((fetchedFeatures) => {
        const wktOptions = {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }
        const geopoints = new GeoJSON().readFeatures(fetchedFeatures, wktOptions)
        setGeopoints(geopoints)
      })
  },[])
  return (
    <div className="App">
        <Header/>
        <TabSwitcher geopoints={geopoints} tableData={tableData}/>
        <Footer/>
    </div>
  );
}

export default App;
