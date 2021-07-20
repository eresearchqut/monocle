import {TextInputBuilder} from "../../src/inputBuilder/textInputBuilder";
import {Form, Section, TextInput} from "@trrf/form-definition";


test('TextInputBuilder supports', () => {
    const textInputBuild = new TextInputBuilder();
    expect(textInputBuild.supports({} as Form, {} as Section,
        {inputType: 'text'} as TextInput))
        .toBe(true);
});

test('TextInputBuilder build schema', () => {
    const textInputBuild = new TextInputBuilder();
    expect(textInputBuild.schema({} as Form, {} as Section,
        {name: 'test'} as TextInput))
        .toEqual({type: "string"});
});
