import camelCase from 'lodash/camelCase';
import isEmpty from 'lodash/isEmpty';

export const generatePropertyFromName = (name: string): string | undefined => isEmpty(camelCase(name)) ? undefined : camelCase(name);
