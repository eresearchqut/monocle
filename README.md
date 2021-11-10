# future-state-mono-repo

## Background

Repository of future state modules. This repository will be renamed at some point.

## Build instructions

```
yarn prepare
yarn build
```

## Modules

| Module | Description |
|--------|-------------|
| Form Definition | Typescript and JSON Schema definitions for Forms, Sections and Inputs |
| Form Compiler | Compiles form definitions into json schema and ui schema definitions compatible with [JSONForms](https://jsonforms.io) |
| Form Components | [JSONForms](https://jsonforms.io) layouts, controls and cell that render [Prime React](https://www.primefaces.org/primereact) react components |
| Form Designer | Drag and Drop form designer that utilises the form-compiler and form-component packages |


## Storybook

To start the storybook for a package

```
cd [package-name]
yarn storybook
```