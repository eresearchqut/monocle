import {TextInputBuilder} from "../../src/inputBuilder/textInputBuilder";
import {Form, Input, Section} from "@trrf/form-definition";
import {DefaultSectionBuilder} from "../../src/sectionBuilder/defaultSectionBuilder";


test('DefaultSectionBuilder build schema', () => {

    const defaultSectionBuilder = new DefaultSectionBuilder();

    expect(defaultSectionBuilder.schema({} as Form, {
        name: 'test',
        inputs: [{inputType: 'TEXT', name: 'textField'}]
    } as Section))
        .toEqual({type: "object", properties: {textField: {type: "string"}}});
});
