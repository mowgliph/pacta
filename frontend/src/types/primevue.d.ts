declare module 'primevue/usetoast' {
  export interface ToastMessageOptions {
    severity: 'success' | 'info' | 'warn' | 'error';
    summary?: string;
    detail?: string;
    life?: number;
    closable?: boolean;
    group?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  }

  export interface ToastServiceMethods {
    add(message: ToastMessageOptions): void;
    removeGroup(group: string): void;
    removeAllGroups(): void;
  }

  export function useToast(): ToastServiceMethods;
}

declare module 'primevue/toast' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{
    group?: string;
    position?: string;
    autoZIndex?: boolean;
    baseZIndex?: number;
    breakpoints?: {
      [key: string]: string;
    };
  }>;
  export default component;
}

declare module 'primevue/toastservice' {
  import { App, Plugin } from 'vue';
  
  const plugin: Plugin;
  export default plugin;
}

declare module 'primevue/api' {
  export enum FilterMatchMode {
    STARTS_WITH = 'startsWith',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'notContains',
    ENDS_WITH = 'endsWith',
    EQUALS = 'equals',
    NOT_EQUALS = 'notEquals',
    IN = 'in',
    LESS_THAN = 'lt',
    LESS_THAN_OR_EQUAL_TO = 'lte',
    GREATER_THAN = 'gt',
    GREATER_THAN_OR_EQUAL_TO = 'gte',
    BETWEEN = 'between',
    DATE_IS = 'dateIs',
    DATE_IS_NOT = 'dateIsNot',
    DATE_BEFORE = 'dateBefore',
    DATE_AFTER = 'dateAfter'
  }
}

declare module 'primevue/useconfirm' {
  export interface ConfirmOptions {
    message?: string;
    header?: string;
    icon?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptIcon?: string;
    rejectIcon?: string;
    acceptClass?: string;
    rejectClass?: string;
    accept?: () => void;
    reject?: () => void;
    group?: string;
  }

  export interface ConfirmMethods {
    require(options: ConfirmOptions): void;
    close(): void;
  }

  export function useConfirm(): ConfirmMethods;
}

declare module 'primevue/config' {
  import { App, Plugin } from 'vue';
  
  const plugin: Plugin;
  export default plugin;
}

declare module 'primevue/button' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/inputtext' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/dropdown' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/datatable' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/column' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/dialog' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/calendar' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/textarea' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/password' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/checkbox' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/tag' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/badge' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/avatar' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/confirmdialog' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
}

declare module 'primevue/confirmationservice' {
  import { App, Plugin } from 'vue';
  const plugin: Plugin;
  export default plugin;
}

declare module 'primevue/progressspinner' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<any>;
  export default component;
} 