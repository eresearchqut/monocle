/**
 * Build identifier string for resource id
 * @param resource
 * @param id
 */
export const buildResourceIdentifier = (resource: string, id: string) => `${buildResourcePrefix(resource)}${id}`;

export const buildResourcePrefix = (resource: string) => `Resource:${resource}#data:`;
