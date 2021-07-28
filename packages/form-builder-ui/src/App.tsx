import React, {useState, useEffect} from "react";
import "./App.css";


import {JsonForms} from '@jsonforms/react';
import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';


import {findFormBuilder} from "@trrf/form-compiler";

import JSONInput from 'react-json-editor-ajrm';
// @ts-ignore
import locale from 'react-json-editor-ajrm/locale/en';


import {Form} from "@trrf/form-definition";
import {cells, renderers} from "@trrf/form-components";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Card} from 'primereact/card';

import 'primereact/resources/themes/fluent-light/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const App: React.FC = () => {

    const schema = require('./schema/form.json');

    const [data, setData] = useState<Form>({
        name: 'Django Unchanged',
        sections: [
            {
                name: 'Act One',
                inputs: [
                    {
                        inputType: 'text',
                        maxLength: 100,
                        minLength: 200,
                        name: 'Cowboy',
                        required: true
                    },
                    {
                        inputType: 'text',
                        name: 'Bee-bop'
                    }
                ]
            }
        ]
    });

    const [formSchema, setFormSchema] = useState<JsonSchema | undefined>(undefined);
    const [formUi, setFormUi] = useState<UISchemaElement | undefined>(undefined);
    const [formData, setFormData] = useState<any>({});


    useEffect(() => {
        const formBuilder = findFormBuilder(data);
        const generatedSchema = formBuilder?.schema(data);
        setFormSchema(() => generatedSchema);
        const generatedUi = formBuilder?.ui(data);
        setFormUi(() => generatedUi);
    }, [data]);


    return (
        <div className="p-grid">
            <div className="p-col">
                <JsonForms
                    schema={schema}
                    data={data}
                    renderers={materialRenderers}
                    cells={materialCells}
                    onChange={({errors, data}) => setData(data)}
                />
            </div>
            <div className="p-col">
                <Card>
                    <JsonForms
                        schema={formSchema}
                        uischema={formUi}
                        data={formData}
                        renderers={renderers}
                        cells={cells}
                        onChange={({errors, data}) => setFormData(data)}
                    />
                </Card>
            </div>
            <div className="p-col">
                <JSONInput
                    id='toBeBuilt'
                    placeholder={data}
                    height='30vh'
                    locale={locale}
                />
                <JSONInput
                    id='toBeBuilt'
                    placeholder={formSchema}
                    height='30vh'
                    locale={locale}
                />
                <JSONInput
                    id='toBeBuilt'
                    placeholder={formUi}
                    height='30vh'
                    locale={locale}
                />
            </div>
        </div>
    );
};

export default App;
