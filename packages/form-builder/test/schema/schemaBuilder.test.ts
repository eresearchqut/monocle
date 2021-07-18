import {buildSchema} from '../../src/schema/schemaBuilder';

test('test build undefined returns undefined', () => {
    expect(buildSchema(undefined)).toBeUndefined();
});
