import React from 'react';
import {
    computeLabel,
    ControlProps,
    ControlState,
    isDescriptionHidden,
    isPlainLabel
} from '@jsonforms/core';
import {Control} from '@jsonforms/react';
import {FormGroup, ControlLabel, HelpBlock} from 'rsuite';
import merge from 'lodash/merge';

const defaultValueHandler = (value: any) => value;

export interface ControlledInput<InputType> {
    input: any;
    parseValue?(value: InputType): any
}

export abstract class FormInput<Type> extends Control<ControlProps & ControlledInput<Type>,
    ControlState> {
    render() {
        const {
            data,
            description,
            errors,
            label,
            uischema,
            visible,
            required,
            config,
            input,
            path,
            handleChange,
            parseValue
        } = this.props;

        if (!visible) {
            return null;
        }

        const isValid = errors.length === 0;
        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const showDescription = !isDescriptionHidden(
            visible,
            description as string,
            this.state.isFocused,
            appliedUiSchemaOptions.showUnfocusedDescription
        );
        const help = showDescription
            ? description
            : !isValid
                ? errors
                : null;

        const InnerComponent = input;
        const valueHandler = parseValue || defaultValueHandler;

        return (
            <FormGroup>
                <ControlLabel>
                    {computeLabel(
                        isPlainLabel(label) ? label : label.default,
                        required as boolean,
                        appliedUiSchemaOptions.hideRequiredAsterisk
                    )}
                </ControlLabel>
                <InnerComponent {...this.props} value={data} onChange={(value: Type) => handleChange(path, valueHandler(value))} />
                <HelpBlock>
                    {help}
                </HelpBlock>
            </FormGroup>
        );
    }
}
