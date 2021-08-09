import * as React from 'react';

import {
    ControlElement,
    getData,
    HorizontalLayout,
    JsonSchema,
    update
} from '@jsonforms/core';

import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import InputTextCell, {inputTextCellTester} from '../../src/cells/InputTextCell';
import HorizontalLayoutRenderer from '../../src/layouts/HorizontalLayout';
import {initTestStore} from '../testStore';

import * as Enzyme from 'enzyme';
import {ReactWrapper, mount} from 'enzyme';
const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');

Enzyme.configure({adapter: new Adapter()});

const defaultMaxLength = 524288;

const controlElement: ControlElement = {
    type: 'Control',
    scope: '#/properties/name'
};

const fixture = {
    data: {name: 'Foo'},
    minLengthSchema: {
        type: 'string',
        minLength: 3
    },
    maxLengthSchema: {
        type: 'string',
        maxLength: 5
    },
    schema: {type: 'string'},
    uischema: controlElement,
    styles: [
        {
            name: 'control',
            classNames: ['control']
        },
        {
            name: 'control.validation',
            classNames: ['validation']
        }
    ]
};

test('Text cell tester', () => {
    expect(inputTextCellTester({type: 'Foo'}, {type: 'string'})).toEqual(-1);
    expect(inputTextCellTester(controlElement, {type: 'string'})).toEqual(1);
})

describe('Text cell', () => {

    let wrapper: ReactWrapper;
    afterEach(() => wrapper.unmount());
    test.skip('autofocus on first element', () => {
        const schema: JsonSchema = {
            type: 'object',
            properties: {
                firstName: {type: 'string'},
                lastName: {type: 'string'}
            }
        };
        const firstControlElement: ControlElement = {
            type: 'Control',
            scope: '#/properties/firstName',
            options: {focus: true}
        };
        const secondControlElement: ControlElement = {
            type: 'Control',
            scope: '#/properties/lastName',
            options: {focus: true}
        };
        const uischema: HorizontalLayout = {
            type: 'HorizontalLayout',
            elements: [firstControlElement, secondControlElement]
        };
        const store = initTestStore({
            data: {firstName: 'Foo', lastName: 'Boo'},
            schema,
            uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <HorizontalLayoutRenderer schema={schema} uischema={uischema}/>
            </Provider>
        );
        const inputs = wrapper.find('input');
        expect(document.activeElement).not.toBe(inputs.at(0).getDOMNode());
        expect(document.activeElement).toBe(inputs.at(1).getDOMNode());
    });

    test.skip('autofocus active', () => {
        const uischema: ControlElement = {
            type: 'Control',
            scope: '#/properties/name',
            options: {focus: true}
        };
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell
                        schema={fixture.minLengthSchema}
                        uischema={uischema}
                        path='name'
                    />
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode();
        expect(document.activeElement).toBe(input);
    });

    test('autofocus inactive', () => {
        const uischema: ControlElement = {
            type: 'Control',
            scope: '#/properties/name',
            options: {focus: false}
        };
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode();
        expect(document.activeElement).not.toBe(input);
    });

    test('autofocus inactive by default', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode();
        expect(document.activeElement).not.toBe(input);
    });

    test('render', () => {
        const schema: JsonSchema = {
            type: 'object',
            properties: {
                name: {type: 'string'}
            }
        };
        const store = initTestStore({
            data: {name: 'Foo'},
            schema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={schema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.value).toBe('Foo');
    });

    test('update via input event', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input');
        input.simulate('change', {target: {value: 'Bar'}});
        expect(getData(store.getState()).name).toBe('Bar');
    });

    test('update via action', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        store.dispatch(update('name', () => 'Bar'));
        expect(input.value).toBe('Bar');
    });

    test('update with undefined value', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        store.dispatch(update('name', () => undefined));
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.value).toBe('');
    });

    test('update with null value', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        store.dispatch(update('name', () => null));
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.value).toBe('');
    });

    test('update with wrong ref', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        store.dispatch(update('firstname', () => 'Bar'));
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.value).toBe('Foo');
    });

    test('disable', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'
                               enabled={false}/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.disabled).toBe(true);
    });

    test('enabled by default', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.minLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.minLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.disabled).toBe(false);
    });

    test('use maxLength for attributes size and maxlength', () => {
        const uischema: ControlElement = {
            type: 'Control',
            scope: '#/properties/name'
        };
        const config = {
            restrict: true,
            trim: true
        };
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.maxLengthSchema,
            uischema,
            config
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.maxLengthSchema} uischema={uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.maxLength).toBe(5);
    });


    test('do not use maxLength by default', () => {
        const store = initTestStore({
            data: fixture.data,
            schema: fixture.maxLengthSchema,
            uischema: fixture.uischema
        });
        wrapper = mount(
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <InputTextCell schema={fixture.maxLengthSchema} uischema={fixture.uischema} path='name'/>
                </JsonFormsReduxContext>
            </Provider>
        );
        const input = wrapper.find('input').getDOMNode() as HTMLInputElement;
        expect(input.maxLength).toBe(defaultMaxLength);
    });


});
