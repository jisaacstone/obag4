import EsriJSON from 'ol/format/EsriJSON.js';
import ImageTile from 'ol/source/ImageTile.js';
import Map from 'ol/Map.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {createXYZ} from 'ol/tilegrid.js';
import {fromLonLat} from 'ol/proj.js';
import {tile as tileStrategy} from 'ol/loadingstrategy.js';
import { Pixel } from 'ol/pixel';
import van from 'vanjs-core';
import 'assets/style.css';

const { div } = van.tags;

const serviceUrl =
  'https://services-eu1.arcgis.com/NPIbx47lsIiu2pqz/ArcGIS/rest/services/' +
  'Neptune_Coastline_Campaign_Open_Data_Land_Use_2014/FeatureServer/';
const layer = '0';

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

const vectorSource = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();

    const url =
      serviceUrl +
      layer +
      '/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent(
        '{"xmin":' +
          extent[0] +
          ',"ymin":' +
          extent[1] +
          ',"xmax":' +
          extent[2] +
          ',"ymax":' +
          extent[3] +
          ',"spatialReference":{"wkid":' +
          srid +
          '}}',
      ) +
      '&geometryType=esriGeometryEnvelope&inSR=' +
      srid +
      '&outFields=*' +
      '&outSR=' +
      srid;

    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    }),
  ),
  attributions:
    'University of Leicester (commissioned by the ' +
    '<a href="https://www.arcgis.com/home/item.html?id=' +
    'd5f05b1dc3dd4d76906c421bc1727805">National Trust</a>)',
});

const vector = new VectorLayer({
  source: vectorSource,
  style: function (feature) {
    const classify = feature.get('LU_2014');
    const color = fillColors[classify] || [0, 0, 0, 0];
    style.getFill()?.setColor(color);
    return style;
  },
  opacity: 0.7,
});

const raster = new TileLayer({
  source: new ImageTile({
    attributions:
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  }),
});

const setup = (mapEl: HTMLElement, infoEl: HTMLElement) => {
  const map = new Map({
    layers: [raster, vector],
    target: mapEl,
    view: new View({
      center: fromLonLat([1.72, 52.4]),
      zoom: 14,
    }),
  });

  const displayFeatureInfo = function (pixel: Pixel) {
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature;
    });
    const target = map.getTarget() as HTMLElement;
    if (feature) {
      const info =
        '2014 Land Use: ' +
        feature.get('LU_2014') +
        '<br>1965 Land Use: ' +
        feature.get('LU_1965');
      infoEl.innerHTML = info;
      if (target) {
        target.style.cursor = 'pointer';
      }
    } else {
      infoEl.innerHTML = '&nbsp;<br>&nbsp;';
      if (target) {
        target.style.cursor = 'pointer';
      }
    }
  };

  map.on(['click', 'pointermove'], function (evt) {
    //if (evt.dragging) {
    //  return;
    //}
    ///displayFeatureInfo(evt.pixel);
  });
};

const main = () => {
  const mapEl = div();
  const infoEl = div();
  van.add(document.body, mapEl);
  van.add(document.body, infoEl);
  setup(mapEl, infoEl);
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
