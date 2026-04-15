import {
  computed,
  onBeforeUnmount,
  onMounted,
  watch,
  type ComputedRef,
  type WritableComputedRef,
} from 'vue';
import { useFormContext, applyFormat, type FieldRules, type FieldValidateResult, type FieldFormat } from './use-form';

export type UseFieldOptions<T> = {
  validateOnValueUpdate?: boolean;
  validateOnMount?: boolean;
  initialValue?: T;
  keepValueOnUnmount?: boolean;
  format?: FieldFormat<T>;
  exclude?: boolean;
};

export type FieldMeta = {
  touched: ComputedRef<boolean>;
  dirty: ComputedRef<boolean>;
  valid: ComputedRef<boolean>;
};

export type UseFieldReturn<T> = {
  name: ComputedRef<string>;
  value: WritableComputedRef<T>;
  errorMessage: ComputedRef<string>;
  errors: ComputedRef<string[]>;
  meta: FieldMeta;
  validate: () => Promise<FieldValidateResult>;
  setValue: (value: T, shouldValidate?: boolean) => void;
  setTouched: (isTouched?: boolean) => void;
  setErrors: (messages?: string | string[]) => void;
  setRules: (rules?: FieldRules) => void;
  resetField: (state?: {
    value?: T;
    touched?: boolean;
    errors?: string | string[];
  }) => void;
  handleBlur: () => void;
  handleChange: (e: Event | T, shouldValidate?: boolean) => void;
};

function isInputEvent(value: unknown): value is Event {
  return typeof Event !== 'undefined' && value instanceof Event;
}

export function useField<T = any>(
  name: ComputedRef<string>,
  rules?: ComputedRef<FieldRules>,
  options: UseFieldOptions<T> = {},
): UseFieldReturn<T> {
  let {
    validateOnValueUpdate = false,
    validateOnMount = false,
    initialValue,
    keepValueOnUnmount = true,
    format,
    exclude = false,
  } = options;

  const form = useFormContext<Record<string, any>>();

  form.registerField(name.value, rules?.value);
  if (
    initialValue !== undefined &&
    form.values[name.value] === undefined &&
    !exclude
  ) {
    const formattedInitialValue = applyFormat(initialValue, format);
    form.setFieldValue(
      name.value as never,
      formattedInitialValue as never,
      initialValue as never,
      format,
    );
  }

  watch(
    () => rules?.value,
    (newRules, oldValue) => {
      if (JSON.stringify(newRules) !== JSON.stringify(oldValue)) {
        form.setFieldRules(name.value as never, newRules);
        void form.validateField(name.value as never);
      }
    },
  );

  watch(
    () => name.value,
    (newValue, oldValue) => {
      if (newValue !== oldValue && !!oldValue) {
        form.registerField(newValue, rules?.value);
        form.setFieldValue(newValue, form.values[oldValue], undefined, format);
        form.setFieldValue(
          oldValue as never,
          undefined as never,
          undefined as never
        );
        form.unregisterField(oldValue);
      }
    },
  );

  onMounted(() => {
    if (validateOnMount) {
      void form.validateField(name.value as never);
    }
  });

  onBeforeUnmount(() => {
    form.unregisterField(name.value as never);

    if (!keepValueOnUnmount && !exclude) {
      form.setFieldValue(name.value as never, undefined as never, undefined as never);
    }
  });

  const value = computed<T>({
    get() {
      return form.values[name.value] as T;
    },
    set(newValue) {
      if (!exclude) {
        const formattedValue = applyFormat(newValue, format);
        form.setFieldValue(
          name.value as never,
          formattedValue as never,
          newValue as never,
          format,
        );
        if (validateOnValueUpdate) {
          void form.validateField(name.value as never);
        }
      }
    },
  });

  const errorMessage = computed(() => form.errors[name.value] || '');

  const errors = computed(() => {
    return form.errors[name.value] ? [form.errors[name.value]] : [];
  });

  const meta: FieldMeta = {
    touched: computed(() => form.touchedMap[name.value]),
    dirty: computed(() => form.dirtyMap[name.value]),
    valid: computed(() => !form.errors[name.value]),
  };

  async function validate(): Promise<FieldValidateResult> {
    return await form.validateField(name.value as never);
  }

  function setValue(newValue: T, shouldValidate = false) {
    if (!exclude) {
      const formattedValue = applyFormat(newValue, format);
      form.setFieldValue(
        name.value as never,
        formattedValue as never,
        newValue as never,
        format,
      );

      if (shouldValidate) {
        void form.validateField(name.value as never);
      }
    }
  }

  function setTouched(isTouched = true) {
    form.setFieldTouched(name.value as never, isTouched);
  }

  function setErrors(messages?: string | string[]) {
    if (!messages) {
      form.setFieldError(name.value as never, undefined);
      return;
    }

    if (Array.isArray(messages)) {
      form.setFieldError(name.value as never, messages[0]);
      return;
    }

    form.setFieldError(name.value as never, messages);
  }

  function setRules(nextRules?: FieldRules) {
    form.setFieldRules(name.value as never, nextRules);
  }

  function resetField(state?: {
    value?: T;
    touched?: boolean;
    errors?: string | string[];
  }) {
    const rawValue =
      state?.value !== undefined
        ? state.value
        : (form.initialValues.value[name.value] as T);
    if (!exclude) {
      const nextValue = applyFormat(rawValue, format);

      form.setFieldValue(
        name.value as never,
        nextValue as never,
        rawValue as never,
        format,
      );
    }
    form.setFieldTouched(name.value as never, state?.touched ?? false);

    if (state?.errors) {
      setErrors(state.errors);
    } else {
      form.setFieldError(name.value as never, undefined);
    }
  }

  function handleBlur() {
    form.setFieldTouched(name.value as never, true);
    void form.validateField(name.value as never);
  }

  function handleChange(e: Event | T, shouldValidate = validateOnValueUpdate) {
    let nextValue: T;

    if (isInputEvent(e)) {
      const target = e.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | null;
      if (!target) return;

      if ('type' in target && target.type === 'checkbox') {
        nextValue = (target as HTMLInputElement).checked as T;
      } else {
        nextValue = target.value as T;
      }
    } else {
      nextValue = e;
    }
    if (!exclude) {
      const formattedValue = applyFormat(nextValue, format);
      form.setFieldValue(
        name.value as never,
        formattedValue as never,
        nextValue as never,
        format,
      );
    }

    if (shouldValidate) {
      void form.validateField(name.value as never);
    }
  }

  return {
    name,
    value,
    errorMessage,
    errors,
    meta,
    validate,
    setValue,
    setTouched,
    setErrors,
    setRules,
    resetField,
    handleBlur,
    handleChange,
  };
}