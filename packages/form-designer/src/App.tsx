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


const App: React.FC = () => {

    const [data, setData] = useState<any>({

    });


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

        <div className="card">
            <div className="p-grid">
                <div className="p-col-12 p-md-6">
                    <Card>
                        <FormCanvas definition={definition} onChange={({errors, data}) => setDefinition(data)} />
                    </Card>
                </div>
                <div className="p-col-12 p-md-6">
                    <Card>
                        <FormPreview definition={definition} data={data} onChange={({errors, data}) => setData(data)}   />
                    </Card>
                </div>

            </div>
        </div>


    );
};

export default App;
