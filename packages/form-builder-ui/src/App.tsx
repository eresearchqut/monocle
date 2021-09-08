import React, {useState} from "react";
import "./App.css";

import {Form} from "@trrf/form-definition";
import {FormBuilder} from './component/FormBuilder'

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/fluent-light/theme.css'

import {Card} from 'primereact/card';


const App: React.FC = () => {
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
                        multiline: true
                    },
                    {
                        type: 'currency',
                        name: 'Owes',
                        currencyCode: 'AUD',
                        currencyDisplay: 'symbol'
                    },
                    {
                        type: 'boolean',
                        name: 'Unrequired Truthy',
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
        <Card>
             <FormBuilder definition={definition} onChange={({errors, data}) => setDefinition(data)} />
        </Card>
    );
};

export default App;
