import React, {useState} from "react";
import "./App.css";

import {Form} from "@trrf/form-definition";
import {FormCanvas} from './component/FormCanvas'

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/fluent-light/theme.css'

import {Card} from 'primereact/card';
import {FormPreview} from "./component/FormPreview";
import {FormDesigner} from "./component/FormDesigner";


const App: React.FC = () => {

    const [data, setData] = useState<any>({});


    const [definition, setDefinition] = useState<Form>({
        name: 'Django Unchanged',
        sections: [
            {
                name: 'Act One',
                inputs: [
                    {
                        type: 'text',
                        maxLength: 100,
                        minLength: 200,
                        name: 'Cowboy',
                        required: true
                    },
                    {
                        type: 'text',
                        name: 'Bee-bop',
                        multiline: true,
                        required: false
                    },
                    {
                        type: 'currency',
                        name: 'Owes',
                        currencyCode: 'AUD',
                        currencyDisplay: 'symbol',
                        required: false
                    },
                    {
                        type: 'boolean',
                        name: 'Unrequired Truthy',
                        required: false
                    },
                    {
                        type: 'boolean',
                        required: true,
                        name: 'Required Truthy',
                    },
                    {
                        type: 'date',
                        required: true,
                        name: 'Datum',
                    }
                ]
            }
        ]
    });

    return (
        <FormDesigner definition={definition}
                      onDefinitionChange={({errors, data}) => setDefinition(() => data)}
                      onDataChange={({errors, data}) => setData(() => data)}
        />
    );
};

export default App;
