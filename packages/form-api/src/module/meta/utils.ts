export const buildResourceIdentifier = (resource: string, id: string): `Resource:${string}#data:${string}` =>
  `Resource:${resource}#data:${id}`;
