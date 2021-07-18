import {Form} from './types';

export const schema = require('./schema.json');

export type V1Form = Form & {
    version: 'v1';
}

export * from './types';




