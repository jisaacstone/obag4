import { click } from 'ol/events/condition.js';
import { fromLonLat } from 'ol/proj.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import SelectEvent from 'ol/MapEvent.js';
import Select from 'ol/interaction/Select.js';
import View from 'ol/View.js';
import van from 'vanjs-core';

import 'assets/style.css';

import * as layers from 'layers';
import * as styles from 'styles';
import * as zones from 'screens/choose_zones';

const { div } = van.tags;

const stationAreaSelect = new Select({
  condition: click,
  layers: [ layers.stationAreaLayer ],
  style: () => styles.blackOutline
});

const zoomToFeature = (map: Map, feature: Feature) => {
  const extent = feature.getGeometry()?.getExtent();
  if (extent) {
    map.getView().fit(extent);
  }
};

const setupMap = (mapEl: HTMLElement): Map => {

  const map = new Map({
    layers: [
      layers.mapLayer,
      layers.parcelsLayer,
      layers.mvZoningLayer,
      layers.stationAreaLayer
    ],
    target: mapEl,
    view: new View({
      center: fromLonLat([-122.1, 37.4]),
      zoom: 14
    }),
  });

  const displayFeatureInfo = function (feature: Feature) {
    if (feature) {
      const id = feature.get("OBJECTID");
      layers.updateParcelSource(id, feature.get("geometry"));
      zoomToFeature(map, feature);
    }
  };

  map.addInteraction(stationAreaSelect);
  stationAreaSelect.on("select", (evt: SelectEvent) => {
    displayFeatureInfo(evt.selected[0]);
  });
  return map;
};

const main = () => {
  const mapEl = div({id: "map"});
  const infoEl = div({id: "info"});
  const appEl = div({id: "app"}, mapEl, infoEl);
  van.add(document.body, appEl);
  const map = setupMap(mapEl);
  zones.render(infoEl, map);
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
