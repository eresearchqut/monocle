import React, {useState, useEffect} from "react";
import "./App.css";

import {Container, Header, Content, Footer, Sidebar} from 'rsuite';
import {JsonForms} from '@jsonforms/react';
import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';

import 'rsuite/lib/styles/index.less';
import 'rsuite/lib/styles/themes/dark/index.less';
import {ThemeProvider, createTheme} from '@material-ui/core/styles';

import {findFormBuilder} from "@trrf/form-compiler";

import JSONInput from 'react-json-editor-ajrm';
// @ts-ignore
import locale from 'react-json-editor-ajrm/locale/en';

import {FlexboxGrid} from 'rsuite';
import {Form} from "@trrf/form-definition";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";

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
                        name: 'Cowboy'
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


    const uischema = {
        "type": "VerticalLayout",
        "elements": [
            {
                "type": "Control",
                "scope": "#/properties/sections"
            }
        ]
    }

    const theme = createTheme({
        palette: {
            type: 'dark',
        },
    });

    return (
        <Container>
            <Header>Header</Header>
            <Container>
                <Sidebar>

                </Sidebar>
                <Content>
                    <FlexboxGrid>
                        <FlexboxGrid.Item>
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
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                            <ThemeProvider theme={theme}>
                                <JsonForms
                                    schema={schema}
                                    uischema={uischema}
                                    data={data}
                                    renderers={materialRenderers}
                                    cells={materialCells}
                                    onChange={({errors, data}) => setData(data)}
                                />
                            </ThemeProvider>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                            <ThemeProvider theme={theme}>
                                <JsonForms
                                    schema={formSchema}
                                    uischema={formUi}
                                    data={formData}
                                    renderers={materialRenderers}
                                    cells={materialCells}
                                    onChange={({errors, data}) => setFormData(data)}
                                />
                            </ThemeProvider>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </Content>
            </Container>
            <Footer>Footer</Footer>
        </Container>
    )
        ;
};

export default App;
