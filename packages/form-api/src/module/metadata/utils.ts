/**
 * Build identifier string for resource id
 * @param resource
 * @param id
 */
export const buildResourceIdentifier = (resource: string, id: string) => `Resource:${resource}#data:${id}`;
