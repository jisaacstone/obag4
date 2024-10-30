import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {fromLonLat} from 'ol/proj.js';
import { Pixel } from 'ol/pixel';
import MapEvent from 'ol/MapEvent.js';
import van from 'vanjs-core';
import 'assets/style.css';

import { mapLayer, stationAreaLayer, sccParcelsLayer } from 'layers';

const { div } = van.tags;

const setup = (mapEl: HTMLElement, infoEl: HTMLElement) => {
  const map = new Map({
    layers: [mapLayer, sccParcelsLayer, stationAreaLayer],
    target: mapEl,
    view: new View({
      center: fromLonLat([-122.1, 37.4]),
      zoom: 14
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

  map.on(['click', 'pointermove'], (evt: MapEvent) => {
    if (evt.dragging) {
      return;
    }
    displayFeatureInfo(evt.pixel);
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
