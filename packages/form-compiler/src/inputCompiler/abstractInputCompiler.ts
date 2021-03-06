import { UISchemaElement } from '@jsonforms/core';
import { Form, Input, Section } from '@eresearchqut/form-definition';
import { buildPropertyPath, generatePathFromName } from '../utils';

import merge from 'lodash/merge';

export abstract class AbstractInputCompiler {
    uiControl(
        form: Form,
        section: Section,
        input: Input,
        options?: { [key: string]: any }
    ): UISchemaElement | undefined {
        const inputProperty = generatePathFromName(input.name);
        if (inputProperty) {
            const sectionProperty = generatePathFromName(section.name);
            return {
                type: 'Control',
                scope: buildPropertyPath([sectionProperty, inputProperty]),
                label: input.label || input.name,
                options: merge({}, input, options),
            } as UISchemaElement;
        }
        return undefined;
    }
}
