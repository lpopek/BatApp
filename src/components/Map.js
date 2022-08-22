
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


export default function MapWrapper(props) {

  const place = [-110, 45];

 const point = new Point(place);

  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()

  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map

  useEffect( () => {

    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    })

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
            features: [new Feature(point)]
          }),
        style: {
          'circle-radius': 9,
          'circle-fill-color': 'red',
        }
        })
        
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2
      }),
      controls: []
    })

    initialMap.on('click', handleMapClick)

    
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)

  },[])

  const handleMapClick = (event) => {

    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
    setSelectedCoord( transormedCoord )

    console.log(transormedCoord, clickedCoord)
    
  }

  // render component
  return (      
    <div ref={mapElement} className="map-container"></div>
  ) 

}
