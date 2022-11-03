import React, { useState, useEffect } from 'react';
import TabSwitcher from './components/Menu.js'
import Header from './components/Header.js'
import Footer from './components/Footer.js';

import GeoJSON from 'ol/format/GeoJSON'

import iso_codes from './data/iso_codes.json'
import discovers from './data/discover.json'

function getCordinateStr(cordinates) {
  var lat = cordinates[0] >= 0 ? 'N' : 'S';
  var long = cordinates[1] >= 0 ? 'E' : 'W';

  return `${Math.abs(cordinates[0])} ${lat} ${Math.abs(cordinates[1])} ${long}`
}

const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )

function App() {

  const [ tableData, setTableData ] = useState([])
  const [ isoData, setIsoData ] = useState([])
  const [ geopoints, setGeopoints ] = useState([])
  
  useEffect(() => setIsoData(iso_codes), [])
  useEffect(() => {
    setTableData(discovers)
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
    var featuresPlaces = {}
    for(let i = 0; i < discovers.length; i++){
      var discover = discovers[i]
      if (discover.cordinates === 'N/A'){
        if (discover.country in featuresPlaces)
          featuresPlaces[discover.country].properties.push({
            "id": discover.id,
            "cord": 'N/A',
            "_cord": [iso_codes[ iso_codes[discover.country].long, discover.country].lat],
            "date": discover.date,
            "paper_name": discover.paper_name,
            "bat": discover.bat,
            "virus": discover.virus
          })
        else{
          featuresPlaces[discover.country] = {
            'properties' : [
              {
                "id": discover.id,
                "cord": 'N/A',
                "_cord": [iso_codes[discover.country].long, iso_codes[discover.country].lat],
                "date": discover.date,
                "paper_name": discover.paper_name,
                "bat": discover.bat,
                "virus": discover.virus
              }
            ]
          }
        }
      }
      else {
        if (discover.cordinates in featuresPlaces){
          featuresPlaces[discover.cordinates].properties.push({
            "id": discover.id,
            "cord": getCordinateStr(discover.cordinates),
            "_cord": discover.cordinates,
            "date": discover.date,
            "paper_name": discover.paper_name,
            "bat": discover.bat,
            "virus": discover.virus
          })
        }
        else{
          featuresPlaces[discover.cordinates] = {
            'properties' : [
              {
                "id": discover.id,
                "cord": getCordinateStr(discover.cordinates),
                "_cord": discover.cordinates,
                "date": discover.date,
                "paper_name": discover.paper_name,
                "bat": discover.bat,
                "virus": discover.virus
              }
            ]
          }
        }
      }
    }
    var mapFeatures = objectMap(featuresPlaces, (item) => {
      return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates":  item.properties[0]._cord
        },
        "properties": item.properties
      }
    })
    var mapFeaturesArr = [];
    for (let key in mapFeatures) {
        if (mapFeatures.hasOwnProperty(key)) {
          mapFeaturesArr.push( mapFeatures[key]);
        }
    }
    mapPoints.features = mapFeaturesArr
    const wktOptions = {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    }
    const geopoints = new GeoJSON().readFeatures(mapPoints, wktOptions)
    setGeopoints(geopoints)
  }, [])
    
  return (
    <div className="App">
        <Header/>
        <TabSwitcher geopoints={geopoints} isoData={isoData} tableData={tableData}/>
        <Footer/>
    </div>
  );
}

export default App;
