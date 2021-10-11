import {combineReducers, createStore, Store} from 'redux';
import {Actions, jsonFormsReducerConfig, JsonFormsState, JsonSchema, UISchemaElement} from '@jsonforms/core';
import {ErrorObject} from 'ajv';

export const initStoryStore = ({
                                  data,
                                   path,
                                  schema,
                                  uischema,
                                  errors,
                                  ...other
                              }: {
    data: any;
    path: string,
    uischema: UISchemaElement;
    schema: JsonSchema;
    errors?: string;
    [other: string]: any;
}): Store<JsonFormsState> => {
    const store: Store<JsonFormsState> = createStore(
        combineReducers({
            jsonforms: combineReducers(jsonFormsReducerConfig),
        }),
        {
            jsonforms: {
                ...other
            } as any
        }
    );
    store.dispatch(Actions.init({[path]: data}, schema, uischema));
    if (errors) {
        const error: ErrorObject = {
            keyword: path,
            dataPath: path,
            schemaPath: path,
            params: {},
            propertyName: path,
            message: errors,
            schema: schema,
            data: data
        };
        store.dispatch(Actions.updateErrors([error]));
    }
    return store;
};
