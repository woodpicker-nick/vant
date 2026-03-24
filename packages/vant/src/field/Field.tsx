import {
  ref,
  shallowRef,
  watch,
  provide,
  computed,
  nextTick,
  reactive,
  onMounted,
  defineComponent,
  watchEffect,
  type PropType,
  type ExtractPropTypes,
  type HTMLAttributes,
  mergeProps,
  h as createVNode,
} from 'vue';

// Utils
import { FORM_KEY, extend, createNamespace, isNotNull } from '../utils';

// Composables
import { useParent } from '@vant/use';
import { useExpose } from '../composables/use-expose';

// Components
import { Icon } from '../icon';
import { Divider } from '../divider';

import { icons } from './icon';

import { useClipboard } from '../composables/use-clipboard';

import { applyFormat, type FieldFormat } from '../composables/use-field';

const [name, bem] = createNamespace('field');

type DividerTypes = 'all' | 'prefix' | 'suffix';

// provide to Search component to inherit
export const fieldSharedProps = {
  id: String,
  value: [Number, String],
  name: String,
};

export const fieldProps = extend({}, fieldSharedProps, {
  type: {
    type: String,
    default: 'text',
  },
  showStarSign: {
    type: Boolean,
    default: !0,
  },
  required: Boolean,
  placeholder: String,
  disabled: Boolean,
  visiblePassword: {
    type: Boolean,
    default: !1,
  },
  clearable: Boolean,
  prefixIcon: String,
  suffixIcon: String,
  prefixStyle: Object,
  suffixStyle: Object,
  divider: {
    type: String as PropType<DividerTypes>,
    default: undefined,
  },
  ignores: {
    type: Array as PropType<string[]>,
  },
  inputClass: [Array, String, Object],
  inputStyle: Object,
  class: [Array, String, Object],
  style: Object,
  showEye: {
    type: Boolean,
    default: (e: any) => e.type === 'password',
  },
  eyeOpenIcon: String,
  eyeCloseIcon: String,
});

export type FieldProps = ExtractPropTypes<typeof fieldProps>;

export default defineComponent({
  name,

  props: fieldProps,

  emits: [
    'change',
    'blur',
    'focus',
    'input',
    'update:value',
    'update:visiblePassword',
    'clickSuffix',
    'clickPrefix',
    'clear',
  ],

  setup(props, { emit, slots, attrs }) {
    var ie;
    const { parent } = useParent<any>(FORM_KEY);
    const o = ref(false),
      i = ref(false),
      inputPosition = shallowRef<any>({
        selection: null,
        valueLength: undefined,
      }),
      inputEl = ref<any>(null);
    let u: any = null;
    const getInputValue = () => {
      return inputEl.value?.value;
    };
    const isStop = ref(false),
      resetSelection = (D = '') => {
        var W, ee;
        if (!inputEl.value) return;
        const { selectionStart: I, selectionEnd: G } = inputEl.value;
        if (isNotNull(I) && isNotNull(G) && o.value) {
          const Te =
            ((W = inputPosition.value.selection) != null ? W : 0) -
            (((ee = inputPosition.value.valueLength) != null ? ee : 0) -
              D.length);
          inputEl.value.setSelectionRange(Te, Te);
        }
      },
      changeValue = (value = '', el = 'input') => {
        if (inputEl.value) {
          const { selectionStart } = inputEl.value;
          if (el !== 'input') {
            inputEl.value.value = value;
            resetSelection(value);
          } else {
            inputPosition.value = {
              selection: selectionStart,
              valueLength: value.length,
            };
          }
        }
        if (value !== props.value) {
          if (parent?.format) {
            value = applyFormat(value, parent?.format);
          }
          emit('update:value', value);
          nextTick(() => {
            emit('change', value);
            isStop.value && parent?.onChildChange?.(props.value);
            isStop.value = true;
            if (inputEl.value) {
              const oldValue = props.value ? String(props.value) : '';
              if (inputEl.value.value !== oldValue) {
                inputEl.value.value = oldValue;
                resetSelection(inputEl.value.value);
              }
            }
          });
        } else {
          isStop.value = true;
        }
      },
      initValue = () => {
        changeValue(
          isNotNull(props.value) ? String(props.value) : '',
          'parent',
        );
      };
    watch(
      () => props.value,
      (D) => {
        if (D !== getInputValue()) {
          initValue();
          parent?.onChildChange?.(props.value);
        }
      },
    );
    onMounted(() => {
      initValue();
      parent?.onInitValue?.(props.value);
    });
    const isRequired = computed(() => parent?.required || props.required),
      showStar = computed(() => {
        var D;
        return isNotNull(parent?.showStarSign)
          ? parent?.showStarSign.value
          : props.showStarSign && isRequired.value;
      }),
      _ = computed(() => props.clearable && props.value && o.value),
      h = ref(!1);
    watchEffect(() => {
      props.visiblePassword !== void 0 && (h.value = !!props.visiblePassword);
    });
    const R = () => {
        props.disabled ||
          ((h.value = !h.value), emit('update:visiblePassword', h.value));
      },
      onBlur = (D: any) => {
        emit('blur', D);
        parent?.onChildBlur?.(props.value);
        setTimeout(() => {
          o.value = false;
        }, 300);
      },
      O = (D: any) => {
        (u && clearTimeout(u), emit('focus', D), (o.value = true));
      },
      onInput = () => {
        i.value || changeValue(getInputValue(), 'input');
      },
      A = (D: any) => {
        var G;
        const I = D.key.toLocaleLowerCase();
        I &&
          props.type === 'number' &&
          (G = props.ignores) != null &&
          G.length &&
          props.ignores?.includes(I) &&
          D.preventDefault();
      },
      T = () => {
        var D;
        props.type === 'number' &&
          (D = props.ignores) != null &&
          D.length &&
          useClipboard().then((I: any) => {
            var G;
            if (I) {
              if (inputEl.value && props.ignores)
                for (const W of props.ignores)
                  inputEl.value.value =
                    (G = inputEl.value) == null
                      ? void 0
                      : G.value.replaceAll(W, '');
              changeValue(getInputValue(), 'input');
            }
          });
      },
      E = () => {
        i.value = true;
      },
      S = () => {
        i.value = false;
        onInput();
      },
      B = computed(() =>
        props.type === 'password'
          ? h.value
            ? 'text'
            : 'password'
          : props.type,
      ),
      x = computed(() => {
        // const D = (I: any) =>
        //   `/lobby_asset/common/web/common/comm_icon_${I}.svg`;
        return (
          h.value
            ? [props.eyeOpenIcon, 'eye']
            : [props.eyeCloseIcon, icons.hideEye]
        ).find(Boolean);
      }),
      M = (D: any) => {
        emit('update:value', '');
        emit('clear', D);
        inputEl.value?.focus();
      };
    useExpose({
      focus() {
        inputEl.value && inputEl.value.focus();
      },
      blur() {
        inputEl.value && inputEl.value.blur();
      },
      $input: inputEl,
    });
    const createInputElement = () => {
      const D = props.type === 'textarea' ? 'textarea' : 'input';
      return createVNode(
        'section',
        {
          class: bem('input-container'),
        },
        [
          createVNode(
            D,
            mergeProps(attrs, {
              ref: inputEl,
              spellcheck: 'false',
              size: 1,
              type: B.value,
              placeholder: props.placeholder,
              disabled: props.disabled,
              class: [bem('input'), props.inputClass],
              style: props.inputStyle,
              onInput: onInput,
              //onChange: S,
              onBlur: onBlur,
              onFocus: O,
              onKeydown: A,
              onPaste: T,
              onCompositionend: S,
              onCompositionstart: E,
            }),
          ),
        ],
      );
    };
    return () => (
      <section
        class={[
          bem({
            textarea: props.type === 'textarea',
            disabled: props.disabled,
          }),
          props.class,
          o.value ? 'input-focus' : '',
        ]}
        style={props.style}
      >
        {(slots.prefix || props.prefixIcon) && (
          <span
            style={props.prefixStyle}
            class={
              props.divider &&
              (props.divider === 'all' || props.divider === 'prefix')
                ? 'prefix__has_divider'
                : bem('prefix')
            }
            onClick={() => emit('clickPrefix')}
          >
            {slots.prefix ? (
              slots.prefix()
            ) : (
              <Icon class={bem('prefix-icon')} name={props.prefixIcon}></Icon>
            )}
          </span>
        )}
        {props.divider &&
          (props.divider === 'all' || props.divider === 'prefix') && (
            <Divider vertical />
          )}
        <section class={bem('input-wrap')}>
          {showStar.value && <span class={bem('star-sign')}>*</span>}
          {createInputElement()}
        </section>
        {props.divider &&
          (props.divider === 'all' || props.divider === 'suffix') && (
            <Divider vertical />
          )}
        <section
          class={bem(
            'suffix',
            props.divider &&
              (props.divider === 'all' || props.divider === 'suffix')
              ? 'suffix__has_divider'
              : 'padding',
          )}
        >
          {_.value && (
            <span onClick={M} class={[bem('suffix-icon'), bem('clear')]}>
              <Icon
                name={
                  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 30 30">\n' +
                  '  <g id="5c32be7db9d04da7291cf2c0956b8814-comm_icon_qc" transform="translate(19859 11386)">\n' +
                  '    <rect id="5c32be7db9d04da7291cf2c0956b8814-矩形_28770" data-name="矩形 28770" width="30" height="30" transform="translate(-19859 -11386)" fill="#fff" opacity="0"/>\n' +
                  '    <path id="5c32be7db9d04da7291cf2c0956b8814-清空" d="M3323,1936a14,14,0,1,1,9.9-4.1A14,14,0,0,1,3323,1936Zm0-12.35h0l4.536,4.537a1.167,1.167,0,1,0,1.65-1.65l-4.537-4.536,4.537-4.537a1.167,1.167,0,1,0-1.65-1.65l-4.536,4.536-4.538-4.536a1.167,1.167,0,0,0-1.65,1.651l4.538,4.536-4.538,4.537a1.167,1.167,0,1,0,1.65,1.65l4.537-4.537Z" transform="translate(-23167 -13292.998)" fill="#999"/>\n' +
                  '  </g>\n' +
                  '<script xmlns=""/></svg>'
                }
              />
            </span>
          )}
          {props.showEye && (
            <span
              class={[
                bem('suffix-icon'),
                bem('eye', {
                  show: h.value,
                }),
              ]}
              onClick={R}
            >
              <Icon name={x.value} />
            </span>
          )}
          {(slots.suffix || props.suffixIcon) && (
            <span
              class={bem('suffix-icon')}
              style={props.suffixStyle}
              onClick={() => emit('clickSuffix')}
            >
              {slots.suffix ? slots.suffix() : <Icon name={props.suffixIcon} />}
            </span>
          )}
        </section>
      </section>
    );
  },
});
