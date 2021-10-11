import {combineReducers, createStore, Store} from 'redux';
import {
    Actions, CellProps,
    ControlProps,
    jsonFormsReducerConfig,
    JsonFormsState,
} from '@jsonforms/core';
import {ErrorObject} from 'ajv';

export const initStoryStore = ({path, data, schema, uischema, errors, cells}: ControlProps | CellProps
): Store<JsonFormsState> => {
    const store: Store<JsonFormsState> = createStore(
        combineReducers({
            jsonforms: combineReducers(jsonFormsReducerConfig),
        }),
        {
            jsonforms: {
                cells
            } as any
        }
    );
    store.dispatch(Actions.init({[path]: cells ? {[path]: data} : data}, schema, uischema));
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
