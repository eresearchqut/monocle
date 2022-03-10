declare module '*.scss';
declare module '*.svg';

// Allow importing JS modules
// this is to get around build errors after added QR Scanner
// TODO: check if there is a better solution than this workaround
declare module '*.js';
