export enum PROJECTION_TYPES {
  INDEX = "INDEX",
  COMPOSITE_TRANSACTION = "COMPOSITE_TRANSACTION",
  COMPOSITE_LOCK = "COMPOSITE_LOCK",
  COMPOSITE_DISCRETE = "COMPOSITE_DISCRETE",
  COMPOSITE_STREAM = "COMPOSITE_STREAM",

  // TODO: multiple relationships to same resource?
  // TODO: validate target resource exists & is authorized
  // TODO: referential integrity when target deleted?
  // TODO: choose between eventual and strong consistency
}

export enum PARTITION_TYPES {
  BARE = "BARE",
  NAME_POSTFIX = "NAME_POSTFIX",
}
