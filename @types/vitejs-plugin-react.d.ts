declare module '@vitejs/plugin-react' {
  import type { Plugin } from 'vite';
  
  export interface Options {
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
    jsxImportSource?: string;
    jsxRuntime?: 'classic' | 'automatic';
    babel?: any;
    reactRefreshHost?: string;
  }
  
  export default function react(opts?: Options): Plugin[];
}
