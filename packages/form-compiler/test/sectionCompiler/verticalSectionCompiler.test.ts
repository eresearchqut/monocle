import {Form} from "@trrf/form-definition";
import {VerticalSectionCompiler} from "../../src/sectionCompiler/verticalSectionCompiler";

describe('VerticalSectionBuilder', () => {

    const sectionBuilder = new VerticalSectionCompiler();

    test('build schema', () => {
        expect(sectionBuilder.schema({} as Form, {
            name: 'test',
            inputs: [{inputType: 'text', name: 'Family Name'}]
        }))
            .toEqual({
                "properties": {
                    "familyName": {
                        "type": "string"
                    }
                },
                "required": [],
                "type": "object"
            });
    });

    test('build ui', () => {
        expect(sectionBuilder.ui({} as Form, {
            name: 'Personal Details',
            inputs: [{inputType: 'text', name: 'Family Name'}]
        }))
            .toEqual({
                "elements": [
                    {
                        "options": {
                            "input": {
                                "inputType": "text",
                                "name": "Family Name"
                            }
                        },
                        "scope": "#/properties/personalDetails/properties/familyName",
                        "type": "Control"
                    }
                ],
                "type": "VerticalLayout"
            });
    });

});