import van from 'vanjs-core';

const { div, ul, li, h2, input, button } = van.tags;

const makeRow = (zone: string) => {
  return li(
    div(zone),
    input({type: "number"}),
    input({type: "number"}),
    input({type: "checkbox"}),
    input({type: "number"})
  );
};

export const setup = (zoneInfo: HTMLElement, roZones: Set<string>) => {
  const title = h2({"class": "title"}, "Set stats");
  const list = ul(li(
    {"class": "zoneInfoList"},
    div("Min Density"),
    div("Max Density"),
    div("No Parking Minimum"),
    div("Parking Maximum")
  ));
  const btn = button(
    { onclick: () => console.log("ok") },
    "Next"
  );
  for (const zone in roZones) {
    const row = makeRow(zone);
    van.add(list, row);
  };
  zoneInfo.replaceChildren(title, list, btn);
};
