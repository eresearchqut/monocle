import {combineReducers, createStore, Store} from 'redux';
import {
    Actions,
    jsonFormsReducerConfig,
    JsonFormsState,
    JsonSchema,
    UISchemaElement
} from '@jsonforms/core';

export const initTestStore = ({
                                  data,
                                  schema,
                                  uischema,
                                  ...other
                              }: {
    data: any;
    uischema: UISchemaElement;
    schema: JsonSchema;
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
    store.dispatch(Actions.init(data, schema, uischema));
    return store;
};
