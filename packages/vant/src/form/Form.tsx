import { defineComponent, type ExtractPropTypes, type PropType } from 'vue';

// Utils
import { FORM_KEY, createNamespace } from '../utils';

// Composables
import { useChildren } from '@vant/use';
import { useExpose } from '../composables/use-expose';
import { useForm } from '../composables/use-form';
import type { FormExpose } from './types';

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
    type: Object as PropType<Record<string, any>>,
    required: true,
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
      dirtyMap,
      handleSubmit,
      validateField,
      clearErrors,
    } = useForm({
      initialValues: props.model as Record<string, any>,
      validateOnMount: false,
    });

    const onSubmit = () => {
      const dirties = Object.entries(dirtyMap)
        .filter(([, value]) => value)
        .map(([key]) => key);
      emit('submit', values, dirties, errors);
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
      clearErrors,
      submit: async () => {
        await validate();
        if (meta.valid.value) onSubmit();
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
