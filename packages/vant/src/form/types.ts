import type { ComponentPublicInstance } from 'vue';
import type { FormProps } from './Form';

export type FormExpose = {
  submit: () => void;
  validate: (name?: any) => Promise<any>;
  validateField: (name?: any) => Promise<any>;
  resetForm: () => void;
  setErrors: (fields: any) => void;
  setFieldValue: (name?: any, value?: any, initValue?: any) => void;
  setValues: (fields: any) => void;
  errors: Record<string, string>;
  getDirties: () => Record<string, any>;
  clearErrors: () => void;
  // getValues: () => Record<string, unknown>;
  // scrollToField: (
  //   name: string,
  //   options?: boolean | ScrollIntoViewOptions | undefined,
  // ) => void;
  // resetValidation: (name?: string | string[] | undefined) => void;
  // getValidationStatus: () => Record<string, FieldValidationStatus>;
};

export type FormProvide = {
  props: FormProps;
};

export type FormInstance = ComponentPublicInstance<FormProps, FormExpose>;
