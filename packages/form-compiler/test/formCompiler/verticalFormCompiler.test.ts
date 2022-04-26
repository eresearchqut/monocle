import { CategorizationFormCompiler } from '../../src/formCompiler/categorizationFormCompiler';
import { InputType, SectionType } from '@eresearchqut/form-definition';

describe('VerticalFormBuilder', () => {
    const formBuilder = new CategorizationFormCompiler();

    test('build schema', () => {
        expect(
            formBuilder.schema({
                name: 'All The Details',
                sections: [
                    {
                        id: '31ad8bdd-bdf0-4632-8819-457ca30aa1a8',
                        type: SectionType.DEFAULT,
                        name: 'Personal Details',
                        inputs: [{ type: InputType.TEXT, id: '8f0c22dc-5efc-4660-bd6b-69c99c013e96', name: 'Family Name' }],
                    },
                ],
            })
        ).toEqual({
            properties: {
                personalDetails: {
                    properties: {
                        familyName: {
                            type: 'string',
                        },
                    },
                    required: [],
                    type: 'object',
                },
            },
            type: 'object',
        });
    });

    test('build ui', () => {
        expect(
            formBuilder.ui({
                name: 'All The Details',

                sections: [
                    {
                        id: '31ad8bdd-bdf0-4632-8819-457ca30aa1a8',
                        type: SectionType.DEFAULT,
                        name: 'Personal Details',
                        inputs: [{ type: InputType.TEXT, id: '6f7715f6-4986-46aa-a5cd-850e9eb7b16f', name: 'Family Name' }],
                    },
                ],
            })
        ).toEqual({
            "elements": [
                {
                    "elements": [
                        {
                            "label": "Family Name",
                            "options": {
                                "id": "6f7715f6-4986-46aa-a5cd-850e9eb7b16f",
                                "name": "Family Name",
                                "type": "text"
                            },
                            "scope": "#/properties/personalDetails/properties/familyName",
                            "type": "Control"
                        }
                    ],
                    "label": "Personal Details",
                    "type": "Category"
                }
            ],
            "label": "All The Details",
            "type": "Categorization"
        });
    });
});
