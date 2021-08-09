import {VerticalFormBuilder} from "../../src/formBuilder/verticalFormBuilder";

describe('VerticalFormBuilder', () => {

    const formBuilder = new VerticalFormBuilder();

    test('build schema', () => {
        expect(
            formBuilder.schema({
                name: "All The Details",
                sections: [
                    {
                        name: 'Personal Details',
                        inputs: [{inputType: 'text', name: 'Family Name'}]
                    }
                ]
            })
        ).toEqual({
            "properties": {
                "personalDetails": {
                    "properties": {
                        "familyName": {
                            "type": "string"
                        }
                    },
                    "required": [],
                    "type": "object"
                }
            },
            "type": "object"
        });
    });

    test('build ui', () => {
        expect(formBuilder.ui({
            name: "All The Details",
            sections: [
                {
                    name: 'Personal Details',
                    inputs: [{inputType: 'text', name: 'Family Name'}]
                }
            ]
        }))
            .toEqual({
                "elements": [
                    {
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
                    }
                ],
                "type": "VerticalLayout"
            });
    });

})
;
