import React, { useState, useEffect } from 'react';

import TabSwitcher from './components/Menu.js'
import Header from './components/Header.js'
import Footer from './components/Footer.js';

import GeoJSON from 'ol/format/GeoJSON'
import InfoDialog from './components/Dialog.js';


function App() {

  const [ tableData, setTableData ] = useState([])
  const [ geopoints, setGeopoints ] = useState([])

  useEffect( () => {
    fetch('data/discover.json')
      .then((response) => response.json())
      .then((jsonTableData) => {
        setTableData(jsonTableData)
        var mapPoints= {
          "type": "FeatureCollection",
          "crs": {
            "type": "name",
            "properties": {
              "name": "ESPG:4326"
               }
          },
          "features" : []
        }
        var mapFeatures = jsonTableData.discovers.map((item) => {
            return {
              "type": "Feature",
              "geometry": {
                 "type": "Point",
                 "coordinates":  item.cordinates
              },
              "properties": {
                "id": item.id,
                "date": item.date,
                "paper_name": item.paper_name,
                "bat": item.bat,
                "virus": item.virus
              }
            }
        })
        mapPoints.features = mapFeatures
        const wktOptions = {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }
        const geopoints = new GeoJSON().readFeatures(mapPoints, wktOptions)
        setGeopoints(geopoints)
      })
    }, [])
    
  return (
    <div className="App">
        <Header/>
        <TabSwitcher geopoints={geopoints} tableData={tableData}/>
        <Footer/>
    </div>
  );
}

export default App;
