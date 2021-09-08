import React, {FunctionComponent, useState} from 'react';
import {FormCanvas} from "./FormCanvas";
import {FormPreview} from "./FormPreview";

import {Form} from "../../../form-definition";
import {Card} from 'primereact/card';
import {ErrorObject} from 'ajv';




export interface FormDesignerProps {
    definition: Form;
    data?: any;
    onDefinitionChange?(definition: Form | undefined): void;
    onDataChange?(data: any): void;
}



export const FormDesigner: FunctionComponent<FormDesignerProps> = ({definition, data, onDefinitionChange, onDataChange}) => {
    return (
        <div className="card">
            <div className="p-grid">
                <div className="p-col-12 p-md-6">
                    <Card>
                        <FormCanvas definition={definition} onChange={onDefinitionChange} />
                    </Card>
                </div>
                <div className="p-col-12 p-md-6">
                    <Card>
                        <FormPreview definition={definition} data={data} onChange={onDataChange} />
                    </Card>
                </div>
            </div>
        </div>
    );
};
