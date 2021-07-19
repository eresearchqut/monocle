import {TextInputBuilder} from "../../src/inputBuilder/textInputBuilder";
import {Form, Input, Section} from "@trrf/form-definition";


test('TextInputBuilder build schema', () => {

    const textInputBuild = new TextInputBuilder();

    expect(textInputBuild.schema({} as Form, {} as Section, {id: '', name: 'test'} as Input))
        .toEqual({type: "string"});
});
