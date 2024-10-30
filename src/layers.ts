import EsriJSON from 'ol/format/EsriJSON.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import ImageTile from 'ol/source/ImageTile.js';
import VectorSource from 'ol/source/Vector.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {createXYZ} from 'ol/tilegrid.js';
import {tile as tileStrategy} from 'ol/loadingstrategy.js';
import { Extent } from 'ol/extent.js';
import Feature from 'ol/Feature.js';
import Projection from 'ol/proj/Projection.js';

const fillColors: {[index: string]: number[]} = {
  'Lost To Sea Since 1965': [0, 0, 0, 1],
  'Urban/Built-up': [104, 104, 104, 1],
  'Shacks': [115, 76, 0, 1],
  'Industry': [230, 0, 0, 1],
  'Wasteland': [230, 0, 0, 1],
  'Caravans': [0, 112, 255, 0.5],
  'Defence': [230, 152, 0, 0.5],
  'Transport': [230, 152, 0, 1],
  'Open Countryside': [255, 255, 115, 1],
  'Woodland': [38, 115, 0, 1],
  'Managed Recreation/Sport': [85, 255, 0, 1],
  'Amenity Water': [0, 112, 255, 1],
  'Inland Water': [0, 38, 115, 1],
};

const style = new Style({
  fill: new Fill(),
  stroke: new Stroke({
    color: [0, 0, 0, 1],
    width: 0.5,
  }),
});

const parcelSourceSCC = new VectorSource({
  format: new GeoJSON(),
  loader: (
    extent: Extent,
    _resolution: number,
    projection: Projection,
    success,
    failure
  ) => {
     const proj = projection.getCode();
     const app_token = 'yqzKRsFoPdg87PUFzboWk2rSi';
     const url_base = 'https://data.sccgov.org/resource/2bmn-3ayc.geojson'
     const field = 'the_geom';
     const lat = 37.4;
     const lng = -122.08;
     const meters = 808;
     const url = `${url_base}?$where=within_circle(${field},${lat},${lng},${meters})`;
     console.log(url);
     const xhr = new XMLHttpRequest();
     xhr.open('GET', url);
     xhr.setRequestHeader('X-App-Token', app_token);
     const onError = function() {
       parcelSourceSCC.removeLoadedExtent(extent);
       failure && failure();
     }
     xhr.onerror = onError;
     xhr.onload = function() {
       if (xhr.status == 200) {
         const format = parcelSourceSCC.getFormat();
         if (format) {
           const respObj = JSON.parse(xhr.responseText);
           const fromProj = format.readProjection(respObj);
           const features: Array<Feature> = [];
           format.readFeatures(respObj).forEach((feature) => {
             feature.getGeometry()?.transform(fromProj, proj);
             features.push(feature);
           });
           parcelSourceSCC.addFeatures(features);
           console.log('got features', features);
           success && success(features);
         }
       } else {
         onError();
       }
     }
     xhr.send();
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    }),
  ),
});

const stationAreaSource = new VectorSource({
  format: new EsriJSON(),
  url: function (_extent, _resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();
    const url = 'https://services3.arcgis.com/i2dkYWmb4wHvYPda/arcgis/rest/services/Jurisdiction_Corridor_Buffers_v3a/FeatureServer/4/query?where=1%3D1&outFields=*&outSR='+ srid + '&f=json';
    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    }),
  ),
  attributions:
    '[DRAFT] Transit-Oriented Communities Policy Areas. MTC/ABAG'
});

export const sccParcelsLayer = new VectorLayer({
  source: parcelSourceSCC,
  opacity: 0.7,
});

export const stationAreaLayer = new VectorLayer({
  source: stationAreaSource,
  style: function (feature) {
    const classify = feature.get('LU_2014');
    const color = fillColors[classify] || [0, 0, 0, 0];
    style.getFill()?.setColor(color);
    return style;
  },
  opacity: 0.7,
});

export const mapLayer = new TileLayer({
  source: new ImageTile({
    attributions:
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  }),
});
