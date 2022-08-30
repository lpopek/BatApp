
import React, { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform, fromLonLat} from 'ol/proj'

import {Circle, RegularShape, Fill, Stroke, Style} from 'ol/style'

const colors = [
  new Fill({color: 'rgba(255, 0, 0, 0.3)'}),
  new Fill({color: 'rgba(0, 255, 0, 0.5)'}),
  new Fill({color: 'rgba(0, 0, 255, 0.7)'}),
];

const strokes = [
  new Stroke({color: 'red', width: 1}),
  new Stroke({color: 'green', width: 1}),
  new Stroke({color: 'blue', width: 1}),
]

var defaultIcon = new Circle({
  fill: colors[0],
  radius: 5,
  stroke: strokes[0],
});

var markerStyle = {
  'Point': new Style({
    image: defaultIcon
  })
};

var defaultStyleFunction = function(feature) {
  return markerStyle[feature.getGeometry().getType()];
};

const hoverStyle = new Style({
  image: new Circle({  
    fill: colors[1],
    radius: 10,
    stroke: strokes[1],
    })
});

const selectedStyle = new Style({
  image: new RegularShape({  
    fill: colors[2],
    points: 5,
    radius: 10,
    radius2: 5,
    angle: 0,
    stroke: strokes[2],
    })
});

export default function MapWrapper(props) {

  const [ map, setMap ] = useState()

  const [ featuresLayer, setFeaturesLayer ] = useState(() =>{
    return new VectorLayer({
    style: defaultStyleFunction,
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
    initialMap.on('pointermove', handleFeatureHover)
    setMap(initialMap)

  }, [])

  useEffect( () => {

    if (props.features.length) { 
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )
    }

  },[props.features])

  let hoverOver = null;
  const handleFeatureHover = (event) =>{
    if (hoverOver !== null) {
      hoverOver.setStyle(undefined);
      hoverOver = null;
    }
    mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
      hoverOver = feature;
      hoverOver.setStyle(hoverStyle);
      return true;
    });
  }

  var featureOnClick = null;
  const handleMapClick = (event) => {
    featureOnClick = mapRef.current.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
      if (featureOnClick !== null) {
        featureOnClick.setStyle(undefined);
        featureOnClick = null;
      }
      featureOnClick = feature
      featureOnClick.setStyle(selectedStyle)
      return feature;
    });

    // const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    // const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
    // setSelectedCoord( transormedCoord )
    // console.log(transormedCoord)
    
  }

  // render component
  return (      
    <div ref={mapElement} className="map-container"></div>
  ) 

}
