
import React, { useState, useEffect, useRef } from 'react';
import { Point } from 'ol/geom';
import Feature  from 'ol/Feature'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform} from 'ol/proj'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Icon from 'ol/style/Icon'


export default function MapWrapper(props) {

  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState(() =>{
    return new VectorLayer({
    source: new VectorSource(),
  })})
  const [ selectedCoord , setSelectedCoord ] = useState()

  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map
  
  useEffect( () => {
    const rasterLayer = new TileLayer({
      source: new XYZ({
        url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
      })
    })

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        rasterLayer,
        featuresLayer
      ],
      view: new View({
        center: [0, 0],
        zoom: 1
      }),
      controls: []
    })

    initialMap.on('click', handleMapClick)

    
    setMap(initialMap)

  }, [])

  useEffect( () => {

    if (props.features.length) { // may be null on first render
      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )
    }

  },[props.features])

  const handleMapClick = (event) => {

    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
    setSelectedCoord( transormedCoord )

    console.log(transormedCoord)
    
  }

  // render component
  return (      
    <div ref={mapElement} className="map-container"></div>
  ) 

}
