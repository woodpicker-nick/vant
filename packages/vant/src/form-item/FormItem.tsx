import {
  defineComponent,
  type ExtractPropTypes,
  type InjectionKey,
  inject,
  computed,
  type PropType,
  watch,
} from 'vue';
import {
  FORM_KEY,
  createNamespace,
} from '../utils';
import { useParent, useChildren } from '@vant/use';
import type { FormProvide } from '../form/types';
import { useFieldExplain } from '../composables/use-field-explain';
import { useField } from 'vee-validate';
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
  required: {
    type: Boolean,
  },
  showRequired: {
    type: Boolean,
    default: !0,
  },
  requiredInDepLabel: Boolean,
  showHelpIcon: {
    type: Boolean,
    default: !0,
  },
  showExplainIcon: {
    type: Boolean,
    default: !0,
  },
  showErrorIcon: {
    type: Boolean,
    default: !0,
  },
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;

export const FORM_ITEM_COMMON_PROPS_KEY: InjectionKey<FormProvide> = Symbol(
  'van-form-item_common_props',
);

export default defineComponent({
  name,
  props: formItemProps,
  setup(props, { emit, slots }) {
    const { linkChildren } = useChildren<any>(FORM_KEY),
      { parent: s } = useParent<any>(FORM_KEY),
      i = inject<any>(FORM_ITEM_COMMON_PROPS_KEY) || {},
      c = (h: any) =>
        (Array.isArray(props.validateTrigger)
          ? props.validateTrigger
          : [props.validateTrigger]
        ).includes(h),
      l = computed(() => {
        var h;
        return (h = s == null ? void 0 : s.layout) != null ? h : props.layout;
      }),
      u = computed(() => {
        var h;
        return (h = s == null ? void 0 : s.labelWidth) != null
          ? h
          : props.labelWidth;
      }),
      d = useFieldExplain(props.name),
      {
        value: r,
        validate: f,
        errorMessage: m,
        meta: y,
        resetField: g,
      } = useField<any>(props.name as string, props.rules, {
        validateOnMount: false,
        validateOnValueUpdate: false,
      });
    watch(
      () => r.value,
      () => {
        let h, R;
        (R = (h = d.value).setFieldError) == null || R.call(h, props.name);
      },
    );
    const v = (h: any, R?: any) => {
      ((r.value = h),
        R &&
          c(R) &&
          (props.delayValidateTrigger
            ? setTimeout(f, props.delayValidateTrigger)
            : f()));
    };
    (linkChildren({
      name: props.name,
      required: computed(() => props.required),
      showStarSign: computed(
        () =>
          props.required &&
          (props.requiredInDepLabel || i.requiredInDepLabel
            ? !0
            : !props.label),
      ),
      onChildChange: (h: any) => v(h, 'onChange'),
      onChildBlur: (h: any) => v(h, 'onBlur'),
      onInitValue: (h: any) => v(h),
    }),
      useExpose({
        validate: f,
        meta: y,
        clearValidate: g,
      }));
    const b = (h: any, R: boolean, P: any) => {
        const O = i.icons || {},
          N = {
            success:
              O.success || 'success',
            warn: O.warn || 'fail',
            error:
              O.error || 'fail',
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
        return !!m.value || (h === 'error' && (R == null ? void 0 : R()));
      });
    return () => (
      <section
        class={bem({
          [props.name as string]: !0,
          style: !props.noStyle,
          horizontal: l.value === 'horizontal',
          required: props.required,
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
            {props.required && props.showRequired && (
              <span class={bem('required-sign')}>*</span>
            )}
            <span class={[bem('label-text')]}>
              {typeof props.label == 'function' ? props.label() : props.label}
            </span>
          </span>
        )}
        <section
          class={bem({
            [props.name as string]: true,
            style: !props.noStyle,
            horizontal: l.value === 'horizontal',
            required: props.required,
            'has-error': _.value,
          })}
          data-item-name={props.name}
        >
          <section class={bem('content', { error: m.value })}>
            <section class={bem('input')}>{slots.default?.()}</section>
            {
              [
                b('error', props.showErrorIcon, () => m.value),
                b(d.value.type, props.showExplainIcon, () => {
                  var R, P;
                  return (P = (R = d.value).message) == null
                    ? void 0
                    : P.call(R);
                }),
                b('warn', props.showHelpIcon, () => props.help),
              ].filter(Boolean)[0]
            }
          </section>
        </section>
      </section>
    );
  },
});
