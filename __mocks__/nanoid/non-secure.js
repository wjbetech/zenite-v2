// Manual Jest mock for 'nanoid/non-secure' ESM package
exports.nanoid = function nanoid() {
  return 'fixed-nanoid';
};
