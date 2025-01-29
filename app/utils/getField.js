export const getField = (fields = [], key = '') => {
  return fields.find((f) => f.key === key) || null;
};
