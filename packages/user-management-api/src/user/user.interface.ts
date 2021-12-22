export interface User {
    enabled: boolean;
    created: Date;
    lastModified: Date;
    status: string;
    username: string;
    attributes: Record<string, any>;
}