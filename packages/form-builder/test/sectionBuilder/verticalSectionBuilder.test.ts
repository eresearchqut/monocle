import {Form, Section} from "@trrf/form-definition";
import {VerticalSectionBuilder} from "../../src/sectionBuilder/verticalSectionBuilder";


test('VerticalSectionBuilder build schema', () => {

    const defaultSectionBuilder = new VerticalSectionBuilder();

    expect(defaultSectionBuilder.schema({} as Form, {
        name: 'test',
        inputs: [{inputType: 'TEXT', name: 'Family Name'}]
    } as Section))
        .toEqual({type: "object", properties: {familyName: {type: "string"}}});
});
