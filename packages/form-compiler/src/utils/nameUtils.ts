import camelCase from 'lodash/camelCase';

export const generatePropertyFromName = (name: string) => camelCase(name);
