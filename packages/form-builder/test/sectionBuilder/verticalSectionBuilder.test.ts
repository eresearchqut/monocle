import {Form, Section} from "@trrf/form-definition";
import {VerticalSectionBuilder} from "../../src/sectionBuilder/verticalSectionBuilder";
import {InputType} from "../../../form-definition/dist/interfaces/input";


test('VerticalSectionBuilder build schema', () => {

    const defaultSectionBuilder = new VerticalSectionBuilder();

    expect(defaultSectionBuilder.schema({} as Form, {
        name: 'test',
        inputs: [{inputType: InputType.TEXT, name: 'Family Name'}]
    } as Section))
        .toEqual({type: "object", properties: {familyName: {type: "string"}}});
});
