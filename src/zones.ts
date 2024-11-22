import { MultiPolygon } from 'ol/geom.js';
import { VectorSourceEvent } from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Select from 'ol/interaction/Select.js';
import VectorEventType from 'ol/source/VectorEventType.js';
import van from 'vanjs-core';

import * as styles from 'styles';
import * as layers from 'layers';

const { div, ul, li, select, input } = van.tags;
const zoneParcels: {[index: string]: { parcels: Feature[], area: number, zones: Set<Feature> }} = {};
const zoneInfo = div({"class": "info"});
const hoverSelect = new Select({
  layers: [ layers.mvZoningLayer ],
  style: () => styles.hilite
});
const disabledSelect = new Select({
  layers: [ layers.parcelsLayer ],
  style: () => styles.disabled
});

export const setup = (infoEl: HTMLElement, map: Map) => {
  map.addInteraction(hoverSelect);
  layers.parcelsLayer.on("change:source", (evt) => {
    evt.target.get("source").on(VectorEventType.ADDFEATURE, parcelAdded);
    evt.target.get("source").on(VectorEventType.FEATURESLOADEND, allParcelsAdded);
  });
  van.add(
    infoEl, div(
      zoneInfo
    )
  );
};

const makeRow = (zone: string, parcels: Feature[], area: number, zones: Set<Feature>): HTMLLIElement => {
  const inp = input({
    type: "checkbox",
    oninput: () => {
      disabledSelect.getFeatures().extend(parcels);
    }
  });
  const sel = select();
  const row = li(
    {
      class: "zoneInfoList",
      onmouseenter: () => hoverSelect.getFeatures().extend(Array.from(zones)),
      onmouseleave: () => hoverSelect.getFeatures().clear()
    },
    div(zone),
    div(parcels.length),
    div(Math.round(area)),
    inp,
    sel
  );
  return row;
};

const allParcelsAdded = ({ features }: VectorSourceEvent) => {
  if (!features || !features.length) { return }
  const list = ul(li({"class": "zoneInfoList"}, div("Zone"), div("Parcels"), div("Area")));
  const sorted = Object.entries(zoneParcels)
    .sort(([,{area: a1}], [,{ area: a2 }]) => a2 - a1);
  for (const [zone, {parcels, area, zones}] of sorted) {
    const row = makeRow(zone, parcels, area, zones);
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
    feature?.set('zone', zone);
    feature?.set('zoneclass', zf.get('ZONECLASS'));
    const pars = zoneParcels[zone];
    if (pars) {
      pars.parcels.push(feature);
      pars.zones.add(zf);
      pars.area += geom.getArea();
    } else {
      zoneParcels[zone] = { parcels: [feature], area: geom.getArea(), zones: new Set([zf]) };
    }
  }
};
