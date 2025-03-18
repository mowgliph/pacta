declare module '@/components/base/BaseButton.vue' {
  import { DefineComponent } from 'vue';

  interface BaseButtonProps {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
  }

  const BaseButton: DefineComponent<BaseButtonProps>;
  export default BaseButton;
}