export const buildResourceIdentifier = (resource: string, id: string): `Resource:${string}#data:${string}` =>
  `Resource:${resource}#data:${id}`;

export const buildResourcePartitionPrefix = (resource: string): `Resource:${string}` => `Resource:${resource}`;
