export const cls = (...classes: (string | false | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");
