import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj.js';
import Feature from 'ol/Feature.js';
import Select from 'ol/interaction/Select.js';
import SelectEvent from 'ol/MapEvent.js';
import { click } from 'ol/events/condition.js';
import { Fill, Stroke, Style } from 'ol/style.js';
import van from 'vanjs-core';

import 'assets/style.css';
import * as layers from 'layers';

const { div } = van.tags;

const stationAreaSelect = new Select({
  condition: click,
  layers: [ layers.stationAreaLayer ],
  style: (_feature, layer) => {
    console.log('stile', layer);
    return new Style({
      fill: new Fill({color: 'rgba(199, 212, 222, 0.7)'}),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    });
  }
});

const setup = (mapEl: HTMLElement, infoEl: HTMLElement) => {
  const infoState = {
    id: van.state(0),
    tier: van.state(''),
    corridor: van.state(''),
  };

  van.add(
    infoEl, div(
      div("id", infoState.id),
      div("tier", infoState.tier),
      div("corridor", infoState.corridor)
    )
  );

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
      console.log(feature);
      const id = feature.get("OBJECTID");
      infoState.id.val = id;
      infoState.tier.val = feature.get("service_tier");
      infoState.corridor.val = feature.get("corridor_id");
      layers.updateParcelSource(id, feature.get("geometry"));
    }
  };

  map.addInteraction(stationAreaSelect);
  stationAreaSelect.on("select", (evt: SelectEvent) => {
    displayFeatureInfo(evt.selected[0]);
  });
};

const main = () => {
  const mapEl = div({id: "map"});
  const infoEl = div({id: "info"});
  const appEl = div({id: "app"}, mapEl, infoEl);
  van.add(document.body, appEl);
  setup(mapEl, infoEl);
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
