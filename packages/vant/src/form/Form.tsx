import { defineComponent, type ExtractPropTypes, type PropType, ref } from 'vue';

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

  emits: ['submit', 'hasError'],

  setup(props, { emit, slots }) {
    const { linkChildren } = useChildren<any>(FORM_KEY);

    const renderKey = ref(0);

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
      resetForm: g,
      errors,
      dirtyMap,
      handleSubmit,
      validateField,
      clearErrors,
    } = useForm({
      initialValues: props.model as Record<string, any>,
      validateOnMount: false,
    });

    const getDirties = () => {
      const o = {} as Record<string, any>;
      const dirties = Object.entries(dirtyMap)
        .filter(([, value]) => value)
        .map(([key]) => key);
      if(dirties.length > 0) {
        dirties.forEach(dir => {
          o[dir] = values[dir];
        })
      }
      return o;
    }

    const onSubmit = () => {
      const dirties = getDirties();
      emit('submit', values, dirties);
    };

    const resetForm = () => {
      g();
      renderKey.value++;
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
      getDirties,
      clearErrors,
      submit: async () => {
        await validate();
        if (meta.valid.value) {
          onSubmit();
        }
        else if (props.scrollToError) {
          emit("hasError");
          const el = document.querySelector(
            '.van-form-item__explain[data-formitem-error="true"]',
          );
          el &&
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });
        } else {
          emit("hasError");
        }
      },
    });

    return () => (
      <form key={`van-form-${renderKey.value}`} class={bem()} novalidate={true} onSubmit={handleSubmit(onSubmit)}>
        {slots.default?.()}
      </form>
    );
  },
});
