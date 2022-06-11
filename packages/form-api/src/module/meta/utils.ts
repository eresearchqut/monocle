import { Form } from "@eresearchqut/form-definition";
import { JSONPath } from "jsonpath-plus";
import { KeyError } from "./errors";
import { RESERVED_NAMES } from "./constants";

export const buildResourceIdentifier = (resource: string, id: string): `Resource:${string}#data:${string}` =>
  `Resource:${resource}#data:${id}`;

export const buildResourceConstraint = (
  resource: string,
  constraint: string
): `Resource:${string}#constraint:${string}` => `Resource:${resource}#constraint:${constraint}`;

// Check for empty keys, or keys containing separators
export const validKey = (key: string) => /^[^#:]+$/.test(key);

export const validName = (name: string) => validKey(name) && !RESERVED_NAMES.has(name.trim().toLowerCase());

export const jsonPathData = (data: any, key: string) =>
  JSONPath({
    path: key,
    json: data,
    wrap: true,
    preventEval: true,
  });

const NUMERIC_KEY_PADDING = 20; // TODO: allow configurable padding

const padNumber = (n: number) => n.toString().padStart(NUMERIC_KEY_PADDING, "0");

export const getKeys = (data: Form, key: string): string[] => {
  const keys = jsonPathData(data, key);
  if (keys === undefined || keys === null || !Array.isArray(keys)) {
    throw new KeyError(`Failed retrieving relationship key ${key}`);
  }
  return keys.map((i) => {
    if (i === undefined || typeof i === "object") {
      throw new KeyError(`Invalid key value ${i} for key ${key}`);
    } else if (typeof i === "number") {
      if (i < 0) {
        throw new KeyError(`Invalid numeric key value ${i} for key ${key}`);
      }
      return padNumber(i);
    } else if (typeof i === "boolean") {
      return i.toString();
    } else if (typeof i == "string") {
      return i;
    } else {
      throw new KeyError(`Unknown key value ${i} (${typeof i}) for key ${key}`);
    }
  });
};
