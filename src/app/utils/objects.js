const objectSorter = ({ object, isAscending = true }) => {
    // Take note that the property names must be alphabet not numeric
  if (isAscending) {
    return Object.entries(object)
      .sort(([, a], [, b]) => a - b)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  } else {
    return Object.entries(object)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  }
};

module.exports = { objectSorter };
