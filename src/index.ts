import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { getUid } from 'ol/util.js';
import { fromLonLat } from 'ol/proj.js';
import Feature from 'ol/Feature.js';
import Select from 'ol/interaction/Select.js';
import SelectEvent from 'ol/MapEvent.js';
import VectorEventType from 'ol/source/VectorEventType.js';
import { VectorSourceEvent } from 'ol/source/Vector.js';
import { click } from 'ol/events/condition.js';
import { MultiPolygon } from 'ol/geom.js';
import van from 'vanjs-core';

import 'assets/style.css';
import * as layers from 'layers';
import * as styles from 'styles';

const { div, ul, li } = van.tags;

const stationAreaSelect = new Select({
  condition: click,
  layers: [ layers.stationAreaLayer ],
  style: () => styles.blackOutline
});

const hoverSelect = new Select({
  layers: [ layers.mvZoningLayer ],
  style: () => styles.hilite
});

const zoomToFeature = (map: Map, feature: Feature) => {
  const extent = feature.getGeometry()?.getExtent();
  //const size = map.getSize();
  if (extent) {
    map.getView().fit(extent);
  }
};

const setup = (mapEl: HTMLElement, infoEl: HTMLElement) => {
  const infoState = {
    id: van.state(0),
    tier: van.state(''),
    corridor: van.state(''),
  };

  const zoneParcels: {[index: string]: { ids: string[], area: number, zones: Set<Feature> }} = {};
  const zoneInfo = div({"class": "info"});

  van.add(
    infoEl, div(
      div("id", infoState.id),
      div("tier", infoState.tier),
      div("corridor", infoState.corridor),
      zoneInfo
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
      const id = feature.get("OBJECTID");
      infoState.id.val = id;
      infoState.tier.val = feature.get("service_tier");
      infoState.corridor.val = feature.get("corridor_id");
      layers.updateParcelSource(id, feature.get("geometry"));
      zoomToFeature(map, feature);
    }
  };

  const allParcelsAdded = ({ features }: VectorSourceEvent) => {
    if (!features || !features.length) { return }
    const list = ul(li({"class": "zoneInfoList"}, div("Zone"), div("Parcels"), div("Area")));
    const sorted = Object.entries(zoneParcels)
      .sort(([,{area: a1}], [,{ area: a2 }]) => a2 - a1);
    for (const [zone, {ids, area, zones}] of sorted) {
      const row = li(
        {"class": "zoneInfoList"},
        div(zone),
        div(ids.length),
        div(Math.round(area))
      );
      row.onmouseenter = () => {
        console.log('mouseover', row, zone, zones);
        hoverSelect.getFeatures().clear();
        hoverSelect.getFeatures().extend(Array.from(zones));
      };
      van.add(list, row);
    };
    zoneInfo.replaceChildren(list);
  };

  const parcelAdded = ({ feature }: VectorSourceEvent) => {
    const geom: MultiPolygon = feature?.get('geometry');
    if (geom) {
      const points = geom.getInteriorPoints()
      const features = layers.mvZoningLayer.getSource()?.getFeaturesAtCoordinate(points.getFirstCoordinate());
      console.log(features?.length);
      if (!features || features.length == 0) {
        return;
      }
      const zf = features[0];
      const zone: string = zf.get('ZONELABEL');
      let id = getUid(feature);
      feature?.set('zone', zone);
      feature?.set('zoneclass', zf.get('ZONECLASS'));
      const pars = zoneParcels[zone];
      if (pars) {
        pars.ids.push(id);
        pars.zones.add(zf);
        pars.area += geom.getArea();
      } else {
        zoneParcels[zone] = { ids: [id], area: geom.getArea(), zones: new Set([zf]) };
      }
    }
  };

  map.addInteraction(stationAreaSelect);
  map.addInteraction(hoverSelect);
  layers.parcelsLayer.on("change:source", (evt) => {
    evt.target.get("source").on(VectorEventType.ADDFEATURE, parcelAdded);
    evt.target.get("source").on(VectorEventType.FEATURESLOADEND, allParcelsAdded);
  });
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
