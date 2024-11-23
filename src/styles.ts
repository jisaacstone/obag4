import { Fill, Stroke, Style } from 'ol/style.js';

export const blackOutline = new Style({
  fill: new Fill({color: [100, 100, 100, 0.1]}),
  stroke: new Stroke({
    color: [34, 33, 32, 0.9],
    width: 2,
  }),
});

export const grey = new Style({
  fill: new Fill({color: [160, 160, 161, 0.7]}),
  stroke: new Stroke({
    color: [100, 101, 100, 0.8],
    width: 1,
  }),
});
export const hilite = new Style({
  fill: new Fill({color: [244, 244, 244, 1]}),
  stroke: new Stroke({
    color: [13, 10, 11, 1],
    width: 3,
  }),
});
export const disabled = new Style({
  fill: new Fill({color: [190, 190, 191, 0.6]}),
  stroke: new Stroke({
    color: [90, 91, 90, 0.7],
    width: 1,
  }),
});

const zo = new Stroke({color: [232, 220, 235], width: 2});

export const zones: {[index: string]: Style} = {
  "R1": new Style({ stroke: zo, fill: new Fill({ color: [237, 237, 18] }) }),
  "R2": new Style({ stroke: zo, fill: new Fill({ color: [237, 200, 28] }) }),
  "R3": new Style({ stroke: zo, fill: new Fill({ color: [237, 187, 32] }) }),
  "RMH": new Style({ stroke: zo, fill: new Fill({ color: [237, 150, 18] }) }),
  "CRA": new Style({ stroke: zo, fill: new Fill({ color: [237, 15, 18] }) }),
  "CN": new Style({ stroke: zo, fill: new Fill({ color: [217, 50, 18] }) }),
  "CS": new Style({ stroke: zo, fill: new Fill({ color: [247, 5, 38] }) }),
  "CO": new Style({ stroke: zo, fill: new Fill({ color: [217, 5, 68] }) }),
  "PF": new Style({ stroke: zo, fill: new Fill({ color: [17, 245, 18] }) }),
  "P": new Style({ stroke: zo, fill: new Fill({ color: [237, 18, 237] }) }),
  "ML": new Style({ stroke: zo, fill: new Fill({ color: [160, 150, 170] }) }),
  "MM": new Style({ stroke: zo, fill: new Fill({ color: [160, 100, 200] }) }),
};
