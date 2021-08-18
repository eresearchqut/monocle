import React, {useState} from 'react';
import {Form} from "@trrf/form-definition";
import {Card} from "primereact/card";

export interface FormBuilderUiProps  {
    form: Form;
}

export const FormBuilderUi = ({form, ...props}: FormBuilderUiProps) => {
    return (<Card title={form.name}></Card>);
}
