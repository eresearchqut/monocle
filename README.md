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

To start the storybook

```
yarn storybook
```

### Node 17+ failure

If you are running Node 17+ on Linux, you might get an `ERR_OSSL_EVP_UNSUPPORTED` error when running `yarn storybook`.

The fix is to `export NODE_OPTIONS=--openssl-legacy-provider` before running `yarn storybook`.

[StackOwerflow reference](https://stackoverflow.com/questions/69394632/webpack-build-failing-with-err-ossl-evp-unsupported)

_Note: remove this sections if this gets fixed later_
