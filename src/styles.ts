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

export const zones: {[index: string]: Style} = {
  "R1": new Style({ fill: new Fill({ color: [237, 237, 18] }) }),
  "R2": new Style({ fill: new Fill({ color: [237, 200, 28] }) }),
  "R3": new Style({ fill: new Fill({ color: [237, 187, 32] }) }),
  "RMH": new Style({ fill: new Fill({ color: [237, 150, 18] }) }),
  "CRA": new Style({ fill: new Fill({ color: [237, 15, 18] }) }),
  "CN": new Style({ fill: new Fill({ color: [217, 50, 18] }) }),
  "CS": new Style({ fill: new Fill({ color: [247, 5, 38] }) }),
  "CO": new Style({ fill: new Fill({ color: [217, 5, 68] }) }),
  "PF": new Style({ fill: new Fill({ color: [17, 245, 18] }) }),
  "P": new Style({ fill: new Fill({ color: [237, 18, 237] }) }),
};
