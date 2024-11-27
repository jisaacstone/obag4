import van from 'vanjs-core';

const { div, ul, li, h2, input, button } = van.tags;

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

export const render = (zoneInfo: HTMLElement, roZones: Set<string>) => {
  console.log(roZones);
  const title = h2({"class": "title"}, "Set stats");
  const list = ul(li(
    {"class": "zoneInfoList header"},
    div(),
    div("Min Density"),
    div("Max Density"),
    div("No Parking Minimum"),
    div("Parking Maximum")
  ));
  const btn = button(
    { onclick: () => console.log("ok") },
    "Next"
  );
  for (const zone of roZones) {
    const row = makeRow(zone);
    van.add(list, row);
  };
  zoneInfo.replaceChildren(title, list, btn);
};
