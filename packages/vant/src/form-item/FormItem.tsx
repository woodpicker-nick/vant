import {
  defineComponent,
  type ExtractPropTypes,
  type InjectionKey,
  inject,
  computed,
  type PropType,
  watch,
} from 'vue';
import { FORM_KEY, createNamespace } from '../utils';
import { useParent, useChildren } from '@vant/use';
import type { FormProvide } from '../form/types';
import { useFieldExplain } from '../composables/use-field-explain';
import { type FieldFormat, useField } from '../composables/use-field';
import { useExpose } from '../composables/use-expose';
import Icon from '../icon';

const [name, bem] = createNamespace('form-item');

type FieldRule<T = unknown> = (
  val: T,
) => true | string | Promise<true | string>;
type ExplainType = 'success' | 'warn' | 'error';

export const formItemProps = {
  name: {
    type: String,
    required: true,
  },
  label: [Function, String],
  validateTrigger: {
    type: [String, Array],
    default: ['onBlur', 'onChange'],
  },
  delayValidateTrigger: {
    type: Number,
    default: void 0,
  },
  rules: {
    type: Object as PropType<FieldRule<string>>,
  },
  labelWidth: {
    type: String,
  },
  help: String,
  layout: {
    type: String,
    default: 'vertical',
  },
  noStyle: {
    type: Boolean,
    default: void 0,
  },
  showRequired: {
    type: Boolean,
    default: false,
  },
  requiredInDepLabel: Boolean,
  showHelpIcon: {
    type: Boolean,
    default: true,
  },
  showExplainIcon: {
    type: Boolean,
    default: true,
  },
  showErrorIcon: {
    type: Boolean,
    default: true,
  },
  format: {
    type: Object as PropType<FieldFormat<any>>,
  },
  validateOnValueUpdate: {
    type: Boolean,
    default: false,
  },
  validateOnMount: {
    type: Boolean,
    default: false,
  },
  initialValue: {
    type: Object as PropType<any>,
  },
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;

export const FORM_ITEM_COMMON_PROPS_KEY: InjectionKey<FormProvide> = Symbol(
  'van-form-item_common_props',
);

export default defineComponent({
  name,
  props: formItemProps,
  setup(props, { slots }) {
    const { linkChildren } = useChildren<any>(FORM_KEY),
      { parent } = useParent<any>(FORM_KEY),
      i = inject<any>(FORM_ITEM_COMMON_PROPS_KEY) || {},
      haveTrigger = (h: any) =>
        (Array.isArray(props.validateTrigger)
          ? props.validateTrigger
          : [props.validateTrigger]
        ).includes(h),
      l = computed(() => {
        return parent?.layout || props.layout;
      }),
      u = computed(() => {
        return parent?.labelWidth || props.labelWidth;
      }),
      d = useFieldExplain(props.name),
      rules = computed(() => props.rules),
      {
        value,
        validate,
        errorMessage,
        meta,
        resetField: g,
      } = useField(props.name as string, rules, {
        validateOnMount: false,
        validateOnValueUpdate: props.validateOnValueUpdate,
        format: props.format,
        initialValue: props.initialValue,
      });
    watch(
      () => value.value,
      () => {
        let h, R;
        (R = (h = d.value).setFieldError) == null || R.call(h, props.name);
      },
    );
    const triggerFun = (h: any, eventName?: any) => {
      value.value = h;
      if (eventName && haveTrigger(eventName)) {
        props.delayValidateTrigger
          ? setTimeout(validate, props.delayValidateTrigger)
          : validate();
      }
    };
    const required = computed(() => {
      const currentRules = props.rules;
      return (
        Array.isArray(currentRules) &&
        currentRules.some((rule) => rule?.required === true)
      );
    });

    linkChildren({
      name: props.name,
      required: computed(() => required.value),
      showStarSign: computed(
        () =>
          required.value &&
          props.showRequired &&
          (props.requiredInDepLabel || i.requiredInDepLabel
            ? true
            : !props.label),
      ),
      onChildChange: (h: any) => triggerFun(h, 'onChange'),
      onChildBlur: (h: any) => triggerFun(h, 'onBlur'),
      onInitValue: (h: any) => triggerFun(h),
      format: props.format,
      valid: computed(() => meta.valid.value),
    });
    useExpose({
      validate: validate,
      meta,
      clearValidate: g,
    });
    const message = (h: any, R: boolean, P: any) => {
        const O = i.icons || {},
          N = {
            success: O.success || 'success',
            warn: O.warn || 'fail',
            error: O.error || 'fail',
          };
        if (!P()) return;
        const A = typeof P() != 'string';
        return (
          <section class={bem('explain')} data-formitem-error={h === 'error'}>
            <span
              class={[bem('explain-icon'), bem(`explain-icon__${h}`)]}
              v-show={R}
            >
              <Icon name={N[h as ExplainType]}></Icon>
            </span>
            {A ? (
              <span class={[bem('explain-text'), bem(`explain-text__${h}`)]}>
                {P()}
              </span>
            ) : (
              <span
                class={[bem('explain-text'), bem(`explain-text__${h}`)]}
                v-html={P()}
              />
            )}
          </section>
        );
      },
      _ = computed(() => {
        const { type: h, message: R } = d.value;
        return (
          !!errorMessage.value || (h === 'error' && (R == null ? void 0 : R()))
        );
      });
    return () => (
      <section
        class={bem({
          [props.name as string]: !0,
          style: !props.noStyle,
          horizontal: l.value === 'horizontal',
          required: required.value,
          'has-error': _.value,
        })}
        data-item-name={props.name}
      >
        {props.label && (
          <span
            class={bem('label')}
            style={{
              width: l.value === 'horizontal' ? u.value : 'auto',
            }}
          >
            {required.value && props.showRequired && (
              <span class={bem('required-sign')}>*</span>
            )}
            <span class={[bem('label-text')]}>
              {typeof props.label == 'function' ? props.label() : props.label}
            </span>
          </span>
        )}
        <section class={bem('content', { error: errorMessage.value })}>
          <section class={bem('input')}>{slots.default?.()}</section>
          {
            [
              message('error', props.showErrorIcon, () => errorMessage.value),
              message(d.value.type, props.showExplainIcon, () => {
                d.value?.message?.();
              }),
              message('warn', props.showHelpIcon, () => props.help),
            ].filter(Boolean)[0]
          }
        </section>
      </section>
    );
  },
});
