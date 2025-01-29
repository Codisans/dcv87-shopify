export const parseFields = (fields) => {
  if (fields.length == 0) return {};

  return Object.fromEntries(
    fields.map((field) => {
      const result = {...field};
      result['key'] = undefined;
      return [field.key, result];
    }),
  );
};
