import { computed, InjectionKey } from 'vue';
import { useInjection } from './use-injection';

export const FORM_FIELD_EXPLAIN_KEY: InjectionKey<any> = Symbol(
  'van-form_field_explain',
);

export function useFieldExplain(e: any) {
  const props = useInjection(FORM_FIELD_EXPLAIN_KEY);
  return computed(() => {
    return {
      setFieldWarn: props?.setFieldWarn,
      setFieldError: props?.setFieldError,
      setFieldSuccess: props?.setFieldSuccess,
      message: props?.message?.value?.[e]?.message,
      type: props?.message?.value?.[e]?.type || 'success',
    };
  });
}
