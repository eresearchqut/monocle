import {Form} from "@trrf/form-definition";
import {VerticalSectionBuilder} from "../../src/sectionBuilder/verticalSectionBuilder";

describe('VerticalSectionBuilder', () => {

    const sectionBuilder = new VerticalSectionBuilder();

    test('build schema', () => {
        expect(sectionBuilder.schema({} as Form, {
            name: 'test',
            inputs: [{inputType: 'text', name: 'Family Name'}]
        }))
            .toEqual({type: "object", properties: {familyName: {type: "string"}}});
    });

    test('build ui', () => {
        expect(sectionBuilder.ui({} as Form, {
            name: 'test',
            inputs: [{inputType: 'text', name: 'Family Name'}]
        }))
            .toEqual({
                "type": "VerticalLayout",
                "elements": [
                    {
                        "scope": "#/properties/test/properties/familyName",
                        "type": "Control"
                    }
                ]
            });
    });

});
