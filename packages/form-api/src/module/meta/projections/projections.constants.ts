export enum PROJECTION_TYPES {
  COMPOSITE = "COMPOSITE",
  INDEX = "INDEX",
  // TODO: multiple relationships to same resource?
  // TODO: validate target resource exists & is authorized
  // TODO: project non-resource attributes for filtering, sorting
  // TODO: choose between eventual and strong consistency
  // TODO: unbounded composite storage?
}
