import camelCase from 'lodash/camelCase';
import isEmpty from 'lodash/isEmpty';

export const generatePathFromName = (name: string): string | undefined =>
  isEmpty(camelCase(name)) ? undefined : camelCase(name);

export const buildPropertyPath = (properties: (string | undefined)[]): string =>
  '#/properties/' + properties.filter((property): property is string => !!property).join('/properties/');
