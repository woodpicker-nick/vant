import { computed, getCurrentInstance, inject, InjectionKey } from 'vue';
import { useInjection } from './use-injection';

export const FORM_FIELD_EXPLAIN_KEY: InjectionKey<any> = Symbol(
  'van-form_field_explain',
);

export function useFieldExplain(e: any) {
  const props = useInjection(FORM_FIELD_EXPLAIN_KEY);
  return computed(() => {
    let n, s, o;
    return {
      setFieldWarn: props == null ? void 0 : props.setFieldWarn,
      setFieldError: props == null ? void 0 : props.setFieldError,
      setFieldSuccess: props == null ? void 0 : props.setFieldSuccess,
      message:
        (n = props == null ? void 0 : props.message.value[e]) == null
          ? void 0
          : n.message,
      type:
        (o =
          (s = props == null ? void 0 : props.message.value[e]) == null
            ? void 0
            : s.type) != null
          ? o
          : 'success',
    };
  });
}
