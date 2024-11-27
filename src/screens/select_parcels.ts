import van from 'vanjs-core';
import { ResOfficeZones } from 'types';
import { nextPageButton } from 'screens/common';

const { div, ul, li, h2, input } = van.tags;

const makeRow = (zone: string) => {
  console.log('make row', zone);
  return li(
    {"class": "zoneInfoList"},
    div(zone),
    input({type: "number"}),
    input({type: "number"}),
    input({type: "checkbox"}),
    input({type: "number"})
  );
};

const renderOffice = (zoneInfo: HTMLElement, roZones: ResOfficeZones) => {
  const title = h2({"class": "title"}, "Office Standards");
  const list = ul(li(
    {"class": "zoneInfoList header"},
    div(),
    div("Min Height"),
    div("Max Height"),
    div("No Parking Minimum"),
    div("Parking Maximum")
  ));
  const btn = nextPageButton(() => console.log("okk"));
  for (const zone of roZones.office) {
    const row = makeRow(zone);
    van.add(list, row);
  };
  zoneInfo.replaceChildren(title, list, btn);
};
export const render = (zoneInfo: HTMLElement, roZones: ResOfficeZones) => {
  const title = h2({"class": "title"}, "Residential Standards");
  const list = ul(li(
    {"class": "zoneInfoList header"},
    div(),
    div("Min Density"),
    div("Max Density"),
    div("No Parking Minimum"),
    div("Parking Maximum")
  ));
  const btn = nextPageButton(() => renderOffice(zoneInfo, roZones));
  for (const zone of roZones.res) {
    const row = makeRow(zone);
    van.add(list, row);
  };
  zoneInfo.replaceChildren(title, list, btn);
};
