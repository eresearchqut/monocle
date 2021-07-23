import React, {useState} from "react";
import "./App.css";

import {Container, Header, Content, Footer, Sidebar} from 'rsuite';
import {JsonForms} from '@jsonforms/react';
import {Grid, Row, Col} from 'rsuite';
import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';

import 'rsuite/lib/styles/index.less';
import 'rsuite/lib/styles/themes/dark/index.less';
import {ThemeProvider, createTheme} from '@material-ui/core/styles';

import JSONInput from 'react-json-editor-ajrm';
// @ts-ignore
import locale from 'react-json-editor-ajrm/locale/en';

import {FlexboxGrid} from 'rsuite';

const App: React.FC = () => {

    const schema = require('./schema/form.json');

    const [data, setData] = useState<any>({
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
                                height='100vh'
                                locale={locale}
                            />
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item >
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
                    </FlexboxGrid>
                </Content>
            </Container>
            <Footer>Footer</Footer>
        </Container>
    )
        ;
};

export default App;
