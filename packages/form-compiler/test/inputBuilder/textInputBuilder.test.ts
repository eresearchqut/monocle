import {TextInputBuilder} from "../../src/inputBuilder/textInputBuilder";
import {Form, Section, TextInput} from "@trrf/form-definition";




describe('TextInputBuilder', () => {

    const inputBuilder = new TextInputBuilder();
    test('supports', () => {
        expect(inputBuilder.supports({} as Form, {} as Section,
            {inputType: 'text'} as TextInput))
            .toBe(true);
    });

    test('schema', () => {
        expect(inputBuilder.schema({} as Form, {name: 'Personal Details'} as Section,
            {name: 'Family Name'} as TextInput))
            .toEqual({type: "string"});
    });

    test('ui', () => {
        expect(inputBuilder.ui({} as Form, {name: 'Personal Details'} as  Section,
            {name: 'Family Name'} as TextInput))
            .toEqual({
                "scope": "#/properties/personalDetails/properties/familyName",
                "type": "Control"
            });
    });

    test('ui empty section name', () => {
        expect(inputBuilder.ui({} as Form, {name: ''} as Section,
            {name: 'Family Name'} as TextInput))
            .toBeUndefined();
    });

    test('ui empty property name', () => {
        expect(inputBuilder.ui({} as Form, {name: 'Personal Details'} as Section,
            {name: ''} as TextInput))
            .toBeUndefined();
    });

});
