// Define the type of the environment variables.
declare interface Env {
  readonly NODE_ENV: string;
  readonly API_URL: string;
  [key: string]: string | undefined;
}

// Choose how to access the environment variables.
// Remove the unused options.

// 1. Use import.meta.env.YOUR_ENV_VAR in your code. (conventional)
declare interface ImportMeta {
  readonly env: Env;
}

// 2. Use NGX_ENV_.YOUR_ENV_VAR in your code. (customizable)
// You can modify the name of the variable in angular.json.
// ngxEnv: {
//  define: 'NGX_ENV_',
// }
declare const NGX_ENV_: Env;

// 3. Use process.env.YOUR_ENV_VAR in your code. (deprecated)
declare namespace NodeJS {
  export interface ProcessEnv extends Env {}
}
