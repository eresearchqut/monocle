export enum PROJECTION_TYPES {
  COMPOSITE = "COMPOSITE",
  INDEX = "INDEX",
  // TODO: multiple relationships to same resource?
  // TODO: validate target resource exists & is authorized
  // TODO: project non-resource attributes for filtering, sorting
  // TODO: choose between eventual and strong consistency
  // TODO: unbounded composite storage?
}

export const NUMERIC_KEY_PADDING = 10; // TODO: allow configurable padding
