import { defineComponent, type ExtractPropTypes } from 'vue';

// Utils
import { FORM_KEY, createNamespace } from '../utils';

// Composables
import { useChildren } from '@vant/use';
import { useExpose } from '../composables/use-expose';

import type { FormExpose } from './types';
import { useForm } from 'vee-validate';

const [name, bem] = createNamespace('form');

export const formProps = {
  layout: {
    type: String,
    default: 'horizontal',
  },
  labelWidth: {
    type: String,
  },
  model: {
    type: Object,
    required: !0,
  },
  scrollToError: Boolean,
};

export type FormProps = ExtractPropTypes<typeof formProps>;

export default defineComponent({
  name,

  props: formProps,

  emits: ['submit'],

  setup(props, { emit, slots }) {
    const { linkChildren } = useChildren<any>(FORM_KEY);

    linkChildren({
      layout: props.layout,
      labelWidth: props.labelWidth,
    });

    const {
      values,
      meta,
      validate,
      setErrors,
      setFieldValue,
      setValues,
      resetForm,
      errors,
      handleSubmit,
      validateField,
    } = useForm({
      initialValues: props.model,
    });

    const onSubmit = () => {
      emit('submit', values);
    };

    linkChildren({ props });
    useExpose<FormExpose>({
      validate,
      validateField,
      resetForm,
      setErrors,
      setFieldValue,
      setValues,
      errors,
      submit: async () => {
        await validate();
        if (meta.value.valid) onSubmit();
        else if (props.scrollToError) {
          const el = document.querySelector(
            '.van-form-item__explain[data-formitem-error="true"]',
          );
          el &&
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });
        }
      },
    });

    return () => (
      <form class={bem()} novalidate={true} onSubmit={handleSubmit(onSubmit)}>
        {slots.default?.()}
      </form>
    );
  },
});
