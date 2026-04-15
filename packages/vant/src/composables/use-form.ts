import {
  computed,
  inject,
  provide,
  reactive,
  readonly,
  ref,
  toRaw,
  onMounted,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue';
import Schema from 'async-validator';


export type FieldFormat<T> =
  | ((value: T) => T)
  | {
  pattern: RegExp;
  replace: string;
};

export type FieldRules = any[] | Record<string, any> | undefined;

export function applyFormat<T>(value: T, format?: FieldFormat<T>): T {
  if (!format) return value;

  if (typeof format === 'function') {
    return format(value);
  }

  if (typeof value === 'string') {
    return value.replace(format.pattern, format.replace) as T;
  }

  return value;
}

export type ValidateResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export type FieldValidateResult = {
  valid: boolean;
  error?: string;
};

export type UseFormOptions<T extends Record<string, any>> = {
  initialValues: T;
  validateOnMount: boolean;
};

export type FormMeta = {
  valid: ComputedRef<boolean>;
  dirty: ComputedRef<boolean>;
  touched: ComputedRef<boolean>;
  validating: Readonly<Ref<boolean>>;
  submitting: Readonly<Ref<boolean>>;
};

export type FormContext<T extends Record<string, any>> = {
  values: T;
  errors: Record<string, string>;
  touchedMap: Record<string, boolean>;
  dirtyMap: Record<string, boolean>;
  initialValues: Ref<T>;
  meta: FormMeta;
  clearErrors: () => void;
  registerField: <K extends keyof T & string>(name: K, rules?: FieldRules) => void;
  unregisterField: <K extends keyof T & string>(name: K) => void;
  setFieldRules: <K extends keyof T & string>(name: K, rules?: FieldRules) => void;
  getFieldRules: <K extends keyof T & string>(name: K) => FieldRules;

  validate: () => Promise<ValidateResult>;
  validateField: <K extends keyof T & string>(name: K) => Promise<FieldValidateResult>;

  setErrors: (errors: Partial<Record<keyof T & string, string>>) => void;
  setFieldError: <K extends keyof T & string>(name: K, message?: string) => void;
  setFieldValue: <K extends keyof T & string>(name: K, value: T[K], initValue: T[K], format?: any) => void;
  setValues: (values: Partial<T>) => void;
  setFieldTouched: <K extends keyof T & string>(name: K, touched?: boolean) => void;

  resetForm: (opts?: {
    values?: Partial<T>;
    errors?: Partial<Record<keyof T & string, string>>;
  }) => void;

  handleSubmit: (
    onValid: (values: T) => void | Promise<void>,
    onInvalid?: (ctx: { values: T; errors: Record<string, string> }) => void | Promise<void>,
  ) => (e?: Event) => Promise<void>;
};

const FORM_CTX_KEY: InjectionKey<FormContext<any>> = Symbol('FORM_CTX_KEY');

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>,
): FormContext<T> {
  const { initialValues, validateOnMount } = options;

  const values = reactive({ ...initialValues }) as T;
  const errors = reactive<Record<string, string>>({});
  const touchedMap = reactive<Record<string, boolean>>({});
  const dirtyMap = reactive<Record<string, boolean>>({});

  const validating = ref(false);
  const submitting = ref(false);
  const initialValuesRef = ref({ ...initialValues }) as Ref<T>;

  // 核心：字段规则注册中心
  const fieldRulesMap = reactive<Record<string, FieldRules>>({});

  function buildDescriptor() {
    const descriptor: Record<string, any> = {};
    Object.keys(fieldRulesMap).forEach((key) => {
      const rules = fieldRulesMap[key];
      if (rules) {
        descriptor[key] = rules;
      }
    });
    return descriptor;
  }

  function clearErrors() {
    Object.keys(errors).forEach((key) => {
      delete errors[key];
    });
  }

  function registerField<K extends keyof T & string>(name: K, rules?: FieldRules) {
    if (!(name in values)) {
      (values as Record<string, any>)[name] = undefined;
    }
    fieldRulesMap[name] = rules;
  }

  function unregisterField<K extends keyof T & string>(name: K) {
    delete fieldRulesMap[name];
    delete errors[name];
    delete touchedMap[name];
    delete dirtyMap[name];
  }

  function setFieldRules<K extends keyof T & string>(name: K, rules?: FieldRules) {
    fieldRulesMap[name] = rules;
  }

  function getFieldRules<K extends keyof T & string>(name: K) {
    return fieldRulesMap[name];
  }

  function setErrors(newErrors: Partial<Record<keyof T & string, string>>) {
    clearErrors();
    Object.keys(newErrors).forEach((key) => {
      const msg = newErrors[key as keyof typeof newErrors];
      if (msg) {
        errors[key] = msg;
      }
    });
  }

  function setFieldError<K extends keyof T & string>(name: K, message?: string) {
    if (!message) {
      delete errors[name];
      return;
    }
    errors[name] = message;
  }

  function setFieldValue<K extends keyof T & string>(name: K, value: T[K], initValue: T[K], format?: any) {
    values[name] = value;
    const formattedValue = format ? applyFormat(initialValuesRef.value[name], format) : initialValuesRef.value[name];
    dirtyMap[name] = ((value === '' && !!initialValuesRef.value[name]) || value !== '') && value !== formattedValue && initValue !== formattedValue;
  }

  function setValues(newValues: Partial<T>) {
    for (const key of Object.keys(newValues) as Array<keyof T & string>) {
      const value = newValues[key];
      if (value !== undefined) {
        values[key] = value as T[typeof key];
        dirtyMap[key] = value !== initialValuesRef.value[key];
      }
    }
  }

  function setFieldTouched<K extends keyof T & string>(name: K, touched = true) {
    touchedMap[name] = touched;
  }

  async function validate(): Promise<ValidateResult> {
    validating.value = true;

    try {
      const descriptor = buildDescriptor();
      const validator = new Schema(descriptor);
      await validator.validate(toRaw(values), { firstFields: true });

      clearErrors();
      return {
        valid: true,
        errors: {},
      };
    } catch (e: any) {
      clearErrors();

      const nextErrors: Record<string, string> = {};
      const fields = e?.fields || {};

      Object.keys(fields).forEach((key) => {
        const msg = fields[key]?.[0]?.message || '校验失败';
        errors[key] = msg;
        nextErrors[key] = msg;
      });

      return {
        valid: false,
        errors: nextErrors,
      };
    } finally {
      validating.value = false;
    }
  }

  async function validateField<K extends keyof T & string>(
    name: K,
  ): Promise<FieldValidateResult> {
    validating.value = true;

    try {
      const rules = fieldRulesMap[name];
      if (!rules) {
        delete errors[name];
        return { valid: true };
      }

      const validator = new Schema({
        [name]: rules,
      });

      await validator.validate(
        { [name]: toRaw(values)[name] },
        { firstFields: true },
      );

      delete errors[name];
      return { valid: true };
    } catch (e: any) {
      const fieldErrors = e?.fields?.[name];
      if (fieldErrors?.length) {
        const msg = fieldErrors[0]?.message || '校验失败';
        errors[name] = msg;
        return {
          valid: false,
          error: msg,
        };
      }

      delete errors[name];
      return { valid: true };
    } finally {
      validating.value = false;
    }
  }

  function resetForm(opts?: {
    values?: Partial<T>;
    errors?: Partial<Record<keyof T & string, string>>;
  }) {
    const nextValues = {
      ...initialValuesRef.value,
      ...(opts?.values || {}),
    } as T;

    Object.keys(values).forEach((key) => {
      delete values[key as keyof T];
    });

    Object.assign(values, nextValues);
    initialValuesRef.value = { ...nextValues };

    clearErrors();

    if (opts?.errors) {
      setErrors(opts.errors);
    }

    Object.keys(touchedMap).forEach((key) => {
      touchedMap[key] = false;
    });

    Object.keys(dirtyMap).forEach((key) => {
      dirtyMap[key] = false;
    });
  }

  function handleSubmit(
    onValid: (values: T) => void | Promise<void>,
    onInvalid?: (ctx: { values: T; errors: Record<string, string> }) => void | Promise<void>,
  ) {
    return async (e?: Event) => {
      e?.preventDefault?.();

      submitting.value = true;
      const result = await validate();

      try {
        if (result.valid) {
          await onValid(toRaw(values) as T);
        } else {
          await onInvalid?.({
            values: toRaw(values) as T,
            errors: { ...errors },
          });
        }
      } finally {
        submitting.value = false;
      }
    };
  }

  const meta: FormMeta = {
    valid: computed(() => Object.keys(errors).length === 0),
    dirty: computed(() => Object.values(dirtyMap).some(Boolean)),
    touched: computed(() => Object.values(touchedMap).some(Boolean)),
    validating: readonly(validating),
    submitting: readonly(submitting),
  };

  const ctx: FormContext<T> = {
    values,
    errors,
    touchedMap,
    dirtyMap,
    initialValues: initialValuesRef,
    meta,
    registerField,
    unregisterField,
    setFieldRules,
    getFieldRules,
    validate,
    validateField,
    setErrors,
    setFieldError,
    setFieldValue,
    setValues,
    setFieldTouched,
    resetForm,
    handleSubmit,
    clearErrors
  };

  provide(FORM_CTX_KEY, ctx);

  onMounted(() => {
    if (validateOnMount) {
      void validate();
    }
  });

  return ctx;
}

export function useFormContext<T extends Record<string, any>>() {
  const ctx = inject<FormContext<T>>(FORM_CTX_KEY);

  if (!ctx) {
    throw new Error('useField 必须在已经调用 useForm() 的组件中使用');
  }

  return ctx;
}