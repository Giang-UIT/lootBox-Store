/// <reference types="vite/client" />

declare module "*.vue" { //for every file that ends with ".vue"
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>; //Defining component as "any" type
    export default component; //export every vue file as component with "any" as type 
  }

// This tells TypeScript: "Whenever a vue file being imported, treat it as valid (i.e "any" type)""
