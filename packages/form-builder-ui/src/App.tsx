import React from "react";
import "./App.css";

import { Container, Header, Content, Footer, Sidebar } from 'rsuite';

import 'rsuite/lib/styles/index.less';

const App: React.FC = () => {
    return (
        <Container>
            <Header>Header</Header>
            <Container>
                <Sidebar>Sidebar</Sidebar>
                <Content>Content</Content>
            </Container>
            <Footer>Footer</Footer>
        </Container>
    );
};

export default App;
