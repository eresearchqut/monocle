import { TextInputCompiler } from '../../src/inputCompiler/textInputCompiler';
import { Form, Section, TextInput } from '@eresearchqut/form-definition';

describe('TextInputCompiler', () => {
    const inputCompiler = new TextInputCompiler();
    test('supports', () => {
        expect(inputCompiler.supports({} as Form, {} as Section, { type: 'text' } as TextInput)).toBe(true);
    });

    test('schema', () => {
        expect(
            inputCompiler.schema(
                {} as Form,
                { name: 'Personal Details' } as Section,
                { name: 'Family Name' } as TextInput
            )
        ).toEqual({ type: 'string' });
    });

    test('ui', () => {
        expect(
            inputCompiler.ui({} as Form, { name: 'Personal Details' } as Section, { name: 'Family Name' } as TextInput)
        ).toEqual({
            "label": "Family Name",
            "options": {
                "name": "Family Name"
            },
            "scope": "#/properties/personalDetails/properties/familyName",
            "type": "Control"
        });
    });

    test('ui empty section name', () => {
        expect(
            inputCompiler.ui({} as Form, { name: '' } as Section, { name: 'Family Name' } as TextInput)
        ).toEqual({
            "label": "Family Name",
            "options": {
                "name": "Family Name"
            },
            "scope": "#/properties/familyName",
            "type": "Control"
        });
    });

    test('ui empty property name', () => {
        expect(
            inputCompiler.ui({} as Form, { name: 'Personal Details' } as Section, { name: '' } as TextInput)
        ).toBeUndefined();
    });
});
