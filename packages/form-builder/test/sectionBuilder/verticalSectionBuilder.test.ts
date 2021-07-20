import {Form} from "@trrf/form-definition";
import {VerticalSectionBuilder} from "../../src/sectionBuilder/verticalSectionBuilder";

test('VerticalSectionBuilder build schema', () => {

    const defaultSectionBuilder = new VerticalSectionBuilder();

    expect(defaultSectionBuilder.schema({} as Form, {
        name: 'test',
        inputs: [{inputType: 'text', name: 'Family Name'}]
    }))
        .toEqual({type: "object", properties: {familyName: {type: "string"}}});
});
