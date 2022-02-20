export enum RELATIONSHIP_TYPES {
  COMPOSITE = "COMPOSITE",
  INDEX = "INDEX",
  // TODO: nested / hierarchical
  // TODO: multiple relationships to same resource?
  // TODO: validate target resource exists & is authorized
  // TODO: project non-resource attributes for filtering, sorting
  // TODO: choose between eventual and strong consistency
  // TODO: unbounded composite storage?
}
