import van from 'vanjs-core';

export const nextPageButton = (fn: () => any): HTMLButtonElement => {
  const btn = van.tags.button(
    {
      class: "nextPage",
      onclick: fn,
    },
    "Next"
  );
  return btn;
};
