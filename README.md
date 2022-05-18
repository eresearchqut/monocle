# future-state-mono-repo

## Background

Repository of future state modules. This repository will be renamed at some point.

## Dependencies

* [Node 16](https://nodejs.org/en/download/)
* [Yarn](https://yarnpkg.com/getting-started/install)

## Useful commands

```
yarn install - Initialise the workspace
yarn build - Build all packages
yarn lint - Lint all packages
yarn changeset - Generate a changeset
yarn clean - Clean up all node_modules and dist folders (runs each package's clean script)
yarn storybook - Start the storybook
```

## Modules

| Module | Description |
|--------|-------------|
| Form Definition | Typescript and JSON Schema definitions for Forms, Sections and Inputs |
| Form Compiler | Compiles form definitions into json schema and ui schema definitions compatible with [JSONForms](https://jsonforms.io) |
| Form Components | [JSONForms](https://jsonforms.io) layouts, controls and cell that render [Prime React](https://www.primefaces.org/primereact) react components |
| Form Designer | Drag and Drop form designer that utilises the form-compiler and form-component packages |


## Versioning and Publishing packages

Package publishing has been configured using [Changesets](https://github.com/changesets/changesets). Please review their [documentation](https://github.com/changesets/changesets#documentation) to familarize yourself with the workflow.

On push to the main branch the [Release](.github/workflows/release.yml) [GitHub Action](https://github.com/changesets/action)

For more information about this automation, refer to the official [changesets documentation](https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md)
