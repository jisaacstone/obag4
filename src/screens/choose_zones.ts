import { click } from 'ol/events/condition.js';
import { MultiPolygon } from 'ol/geom.js';
import { VectorSourceEvent } from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Select from 'ol/interaction/Select.js';
import VectorEventType from 'ol/source/VectorEventType.js';
import van from 'vanjs-core';

import * as styles from 'styles';
import * as layers from 'layers';
import * as select_parcels from 'screens/select_parcels';

const { div, ul, li, h2, input, button } = van.tags;
const resOfficeZones: Set<string> = new Set();
const zoneParcels: {[index: string]: { parcels: Feature[], area: number, zones: Set<Feature> }} = {};
const zoneInfo = div({"class": "info"});
const totalParcels = van.state(0);
const totalArea = van.state(0);
const roundedArea = van.derive(() => Math.round(totalArea.val));
const hoverSelect = new Select({
  layers: [ layers.mvZoningLayer ],
  style: () => styles.hilite
});
const enabledSelect = new Select({
  condition: click,
  layers: [ layers.parcelsLayer ],
  style: (feature) => styles.zones[feature.get('zoneclass')] || styles.grey
});

const makeRow = (zone: string, parcels: Feature[], area: number, zones: Set<Feature>): HTMLLIElement => {
  const inp = input({
    type: "checkbox",
    oninput: () => {
      const selected = enabledSelect.getFeatures();
      if (inp.checked) {
        selected.extend(parcels);
        resOfficeZones.add(zone);
        totalParcels.val += parcels.length;
        totalArea.val += area;
      } else {
        parcels.forEach((parcel) => selected.remove(parcel));
        resOfficeZones.delete(zone);
        totalParcels.val -= parcels.length;
        totalArea.val -= area;
      }
      console.log('roz', resOfficeZones);
    }
  });
  // For some reason just setting innerHTML does not work
  const pp = Array.from(zones)[0].get("PRECISEPLANLINK") || "";
  const lnk = document.createElement('div');
  lnk.innerHTML = pp;
  const el = div(lnk.getElementsByTagName('a')[0] || "")
  const row = li(
    {
      class: "zoneInfoList",
      onmouseenter: () => hoverSelect.getFeatures().extend(Array.from(zones)),
      onmouseleave: () => hoverSelect.getFeatures().clear()
    },
    inp,
    div(zone),
    el,
  )
  return row;
};

const allParcelsAdded = ({ features }: VectorSourceEvent) => {
  if (!features || !features.length) { return }
  const title = h2({"class": "title"}, "Which zones allow residential, office, or mixed use?");
  const info = div({"class": "runningTotal"}, div("Parcels: ", totalParcels), div("Area: ", roundedArea));
  const list = ul(li({"class": "zoneInfoList header"}, div(), div("Zone"), div("Details")));
  const btn = button(
    { onclick: () => select_parcels.render(zoneInfo, resOfficeZones) },
    "Next"
  );
  const sorted = Object.entries(zoneParcels)
    .sort(([za,], [zb,]) => za.localeCompare(zb));
  for (const [zone, {parcels, area, zones}] of sorted) {
    const row = makeRow(zone, parcels, area, zones);
    van.add(list, row);
  };
  zoneInfo.replaceChildren(title, info, list, btn);
};

const parcelAdded = ({ feature }: VectorSourceEvent) => {
  if (feature === undefined) {
    return;
  }
  const geom: MultiPolygon = feature.get('geometry');
  if (geom) {
    const points = geom.getInteriorPoints()
    const features = layers.mvZoningLayer.getSource()?.getFeaturesAtCoordinate(points.getFirstCoordinate());
    console.log(features?.length);
    if (!features || features.length == 0) {
      return;
    }
    const zf = features[0];
    const zone: string = zf.get('ZONELABEL');
    feature.set('zone', zone);
    feature.set('zoneclass', zf.get('ZONECLASS'));
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

export const render = (infoEl: HTMLElement, map: Map) => {
  map.addInteraction(hoverSelect);
  map.addInteraction(enabledSelect);
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
