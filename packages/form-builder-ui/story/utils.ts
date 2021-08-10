import {Form, Section, Input} from "../../form-definition";
import {findInputBuilder, generatePathFromName} from "../../form-compiler";

export const inputPath = (input: Input) => input && generatePathFromName(input.name) ? generatePathFromName(input.name) : 'pathUndefined';
export const inputUi = (input: Input) => findInputBuilder({} as Form, {} as Section, input).ui({} as Form, {} as Section, input);
export const inputSchema = (input: Input) => findInputBuilder({} as Form, {} as Section, input).schema({} as Form, {} as Section, input);