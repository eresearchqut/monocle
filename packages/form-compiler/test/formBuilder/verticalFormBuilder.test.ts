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
            type: "object",
            properties:
                {
                    personalDetails:
                        {
                            type: "object",
                            properties:
                                {
                                    familyName: {type: "string"}
                                }
                        }
                }
        });
    });

// test('build ui', () => {
//     expect(sectionBuilder.ui({} as Form, {
//         name: 'Personal Details',
//         inputs: [{inputType: 'text', name: 'Family Name'}]
//     }))
//         .toEqual({
//             "type": "VerticalLayout",
//             "elements": [
//                 {
//                     "scope": "#/properties/personalDetails/properties/familyName",
//                     "type": "Control"
//                 }
//             ]
//         });
// });

})
;
