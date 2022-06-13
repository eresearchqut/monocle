export const SYSTEM_USER = "system";

export const RESERVED_NAMES = new Set([
  // Top-level Modules
  "meta",
  "dynamodb",
  "resource",

  // Meta modules
  "authorization",
  "constraint",
  "form",
  "metadata",
  "relationship",

  // ItemEntity Base Attributes
  "pk",
  "sk",
  "id",
  "itemtype",
  "createdat",
  "createdby",
  "data",
  "ttl",

  // ItemEntity Extended Attributes
  "version",
  "increment",
  "resource",
  "resourcename",
  "resourceversion",
  "constraintname",
]);
