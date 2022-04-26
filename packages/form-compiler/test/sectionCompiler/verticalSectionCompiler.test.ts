import { Form, InputType, SectionType } from '@eresearchqut/form-definition';
import { CategorySectionCompiler } from '../../src/sectionCompiler/categorySectionCompiler';

describe('VerticalSectionBuilder', () => {
    const sectionBuilder = new CategorySectionCompiler();

    test('build schema', () => {
        expect(
            sectionBuilder.schema({} as Form, {
                id: 'fd7a40aa-899f-43a1-aa9e-9cc9e3ae96cf',
                name: 'test',
                type: SectionType.DEFAULT,
                inputs: [{ type: InputType.TEXT, id: '8836236b-a5af-4356-812e-d17b9fe9914d', name: 'Family Name' }],
            })
        ).toEqual({
            properties: {
                familyName: {
                    type: 'string',
                },
            },
            required: [],
            type: 'object',
        });
    });

    test('build ui', () => {
        expect(
            sectionBuilder.ui({} as Form, {
                id: 'fd7a40aa-899f-43a1-aa9e-9cc9e3ae96cf',
                name: 'test',
                type: SectionType.DEFAULT,
                inputs: [{ type: InputType.TEXT, id: '8836236b-a5af-4356-812e-d17b9fe9914d', name: 'Family Name' }],
            })
        ).toEqual({
            "elements": [
                {
                    "label": "Family Name",
                    "options": {
                        "id": "8836236b-a5af-4356-812e-d17b9fe9914d",
                        "name": "Family Name",
                        "type": "text"
                    },
                    "scope": "#/properties/test/properties/familyName",
                    "type": "Control"
                }
            ],
            "label": "test",
            "type": "Category"
        });
    });
});
