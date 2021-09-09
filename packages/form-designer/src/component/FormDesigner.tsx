import React, {FunctionComponent, useState, useEffect} from 'react';
import {FormCanvas} from "./FormCanvas";
import {FormPreview} from "./FormPreview";

import {Form} from "../../../form-definition";
import {Card} from 'primereact/card';
import Ajv, {ErrorObject} from 'ajv';
import {JsonFormsCore} from "@jsonforms/core";




export interface FormDesignerProps {
    definition: Form;
    data?: any;
    onDefinitionChange?(state: { errors?: ErrorObject[], data: any }): void;
    onDataChange?(state: { errors?: ErrorObject[], data: any }): void;
}



export const FormDesigner: FunctionComponent<FormDesignerProps> = props => {

    const [formDesignerState, setFormDesignerState] = useState<FormDesignerProps>(props);

    
    const handleDefinitionChange = (state: { errors?: ErrorObject[], data: any } ) => {
        setFormDesignerState((prevState) => ({...prevState, definition: state.data}))
        if (formDesignerState.onDefinitionChange) {
            formDesignerState.onDefinitionChange(state);
        }
    }

    const handleDataChange = (state: { errors?: ErrorObject[], data: any }) => {
        setFormDesignerState((prevState) => ({...prevState, data: state.data}))
        if (formDesignerState.onDataChange) {
            formDesignerState.onDataChange(state);
        }
    }

    return (
        <div className="card">
            <div className="p-grid">
                <div className="p-col-12 p-md-6">
                    <Card>
                        <FormCanvas definition={formDesignerState.definition} onChange={handleDefinitionChange} />
                    </Card>
                </div>
                <div className="p-col-12 p-md-6">
                    <Card>
                        <FormPreview definition={formDesignerState.definition} data={formDesignerState.data} onChange={handleDataChange} />
                    </Card>
                </div>
            </div>
        </div>
    );
};
