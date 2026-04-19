import {
  ref,
  shallowRef,
  watch,
  computed,
  nextTick,
  onMounted,
  defineComponent,
  watchEffect,
  type PropType,
  type ExtractPropTypes,
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
import type { FieldFormat } from "../composables/use-form";
import { applyFormat } from '../composables/use-form';

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
    default: true,
  },
  required: Boolean,
  placeholder: String,
  disabled: Boolean,
  visiblePassword: {
    type: Boolean,
    default: false,
  },
  clearable: Boolean,
  keepError: Boolean,
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
  showEye: {
    type: Boolean,
    default: (e: any) => e.type === 'password',
  },
  eyeOpenIcon: String,
  eyeCloseIcon: String,
  verify: Boolean,
  trim: Boolean,
  secrecy: {
    type: Object as PropType<FieldFormat<any>>, //开启分离模式， 分离模式下初始值会使用此字段展示。
  },
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
    const { parent } = useParent<any>(FORM_KEY);
    const isBlur = ref(false);
    const oldValue = ref('');
    const initValue = ref({
      secrecyValue: '',
      value: ''
    });
    const complete = ref(false);
    const isInput = ref(false),
      i = ref(false),
      inputPosition = shallowRef<any>({
        selection: null,
        valueLength: undefined,
      }),
      inputEl = ref<any>(null);
    //const u: any = null;
    const getInputValue = () => {
      return inputEl.value?.value;
    };
    //const isStop = ref(false);
    const resetSelection = (D = '') => {
      let W, ee;
      if (!inputEl.value) return;
      const { selectionStart: I, selectionEnd: G } = inputEl.value;
      if (isNotNull(I) && isNotNull(G) && isInput.value) {
        const Te =
          ((W = inputPosition.value.selection) != null ? W : 0) -
          (((ee = inputPosition.value.valueLength) != null ? ee : 0) -
            D.length);
        inputEl.value.setSelectionRange(Te, Te);
      }
    };
    const changeValue = (value = '', el = 'input') => {
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
      if (props.trim) {
        value = value.replace(' ', '');
      }
      if(props.secrecy){
        const secrecyValue = applyFormat(props.value, props.secrecy);
        if(value === secrecyValue) {
          if (inputEl.value) {
            inputEl.value.value = value;
            resetSelection(inputEl.value.value);
            complete.value = true;
          }
        } else {
          afterChangeValue(value);
        }
      } else if (value !== props.value) {
        afterChangeValue(value);
      } else {
        //isStop.value = true;
      }
    };
    const afterChangeValue = (value: any) => {
      emit('update:value', value);
      nextTick(() => {
        emit('change', value);
        parent?.onChildChange?.(props.value);
        //isStop.value = true;
        complete.value = false;
        if (inputEl.value) {
          const oldValue = props.value ? String(props.value) : '';
          if (inputEl.value.value !== oldValue) {
            inputEl.value.value = oldValue;
            resetSelection(inputEl.value.value);
          }
        }
      });
    }
    const initValueFn = () => {
      if(isNotNull(props.value)) {
        initValue.value = {
          secrecyValue: props.secrecy ? applyFormat(String(props.value), props.secrecy) : String(props.value),
          value: String(props.value)
        };
        oldValue.value = String(props.value);
      }
      changeValue(initValue.value.secrecyValue, 'parent');
    };
    watch(
      () => props.value,
      (D) => {
        if (D !== getInputValue()) {
          oldValue.value = String(props.value);
          changeValue(oldValue.value, 'parent');
          parent?.onChildChange?.(props.value);
        }
      },
    );
    onMounted(() => {
      initValueFn();
      parent?.onInitValue?.(props.value);
    });
    const isRequired = computed(() => parent?.required.value || props.required);
    const noError = computed(() => {
      if(props.keepError) {
        return parent?.valid.value
      }
      return true;
    });
    const showClear = computed(() => {
      return props.clearable && !!props.value && (isInput.value || !noError.value);
    });
    const showVerified = computed(() => {
      return (
        props.verify && !!props.value && oldValue.value !== '' && (props.value !== oldValue.value) && isBlur.value && parent?.valid.value
      );
    });
    const showStar = computed(() => {
      return isNotNull(parent?.showStarSign)
        ? parent?.showStarSign.value
        : props.showStarSign && isRequired.value;
    });
    const visiblePassword = ref(false);
    watchEffect(() => {
      props.visiblePassword !== void 0 &&
        (visiblePassword.value = !!props.visiblePassword);
    });
    const updateVisiblePassword = () => {
        props.disabled ||
          ((visiblePassword.value = !visiblePassword.value),
          emit('update:visiblePassword', visiblePassword.value));
      },
      onBlur = (event: any) => {
        emit('blur', event);
        parent?.onChildBlur?.(props.value);
        setTimeout(() => {
          isInput.value = false;
          isBlur.value = true;
          if(props.secrecy) {
            //const currentValue = applyFormat(event.target.value, props.secrecy);
            if(event.target.value === initValue.value.value) {
              event.target.value = initValue.value.secrecyValue;
              complete.value = true;
            }
          }
        }, 50);
      },
      onFocus = (event: any) => {
        if(props.secrecy) {
          //const currentValue = applyFormat(el.value, props.secrecy);
          if(event.target.value === initValue.value.secrecyValue) {
            event.target.value = initValue.value.value;
          }
          complete.value = false;
        }
        emit('focus', event);
        isInput.value = true;
        isBlur.value = false;
      },
      onInput = () => {
        if (!isInput.value) isInput.value = true;
        isBlur.value = false;
        i.value || changeValue(getInputValue(), 'input');
      },
      A = (D: any) => {
        let G;
        const I = D.key.toLocaleLowerCase();
        I &&
          props.type === 'number' &&
          (G = props.ignores) != null &&
          G.length &&
          props.ignores?.includes(I) &&
          D.preventDefault();
      },
      T = () => {
        let D;
        props.type === 'number' &&
          (D = props.ignores) != null &&
          D.length &&
          useClipboard().then((I: any) => {
            let G;
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
          ? visiblePassword.value
            ? 'text'
            : 'password'
          : props.type,
      ),
      x = computed(() => {
        // const D = (I: any) =>
        //   `/lobby_asset/common/web/common/comm_icon_${I}.svg`;
        return (
          visiblePassword.value
            ? [props.eyeOpenIcon, 'eye']
            : [props.eyeCloseIcon, icons.hideEye]
        ).find(Boolean);
      }),
      clear = (D: any) => {
        inputEl.value.value = '';
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
              onFocus: onFocus,
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
            error: !noError.value,
            complete: complete.value
          }),
          isInput.value ? 'input-focus' : '',
        ]}
      >
        {(slots.prefix || props.prefixIcon) && (
          <span
            style={props.prefixStyle}
            class={[
              bem('prefix'),
              props.divider &&
              (props.divider === 'all' || props.divider === 'prefix')
                ? 'prefix__has_divider'
                : ''
            ]}
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
          {showClear.value && (
            <span onClick={clear} class={[bem('suffix-icon'), bem('clear')]}>
              <Icon
                name={
                  '<svg xmlns="http://www.w3.org/2000/svg"  width="1em" height="1em" viewBox="0 0 30 30" fill="currentColor" class="">\n' +
                  '  <g id="5c32be7db9d04da7291cf2c0956b8814-comm_icon_qc" transform="translate(19859 11386)">\n' +
                  '    <rect id="5c32be7db9d04da7291cf2c0956b8814-矩形_28770" data-name="矩形 28770" width="30" height="30" transform="translate(-19859 -11386)" opacity="0"></rect>\n' +
                  '    <path id="5c32be7db9d04da7291cf2c0956b8814-清空" d="M3323,1936a14,14,0,1,1,9.9-4.1A14,14,0,0,1,3323,1936Zm0-12.35h0l4.536,4.537a1.167,1.167,0,1,0,1.65-1.65l-4.537-4.536,4.537-4.537a1.167,1.167,0,1,0-1.65-1.65l-4.536,4.536-4.538-4.536a1.167,1.167,0,0,0-1.65,1.651l4.538,4.536-4.538,4.537a1.167,1.167,0,1,0,1.65,1.65l4.537-4.537Z" transform="translate(-23167 -13292.998)"></path>\n' +
                  '  </g>\n' +
                  '\n' +
                  '</svg>'
                }
              />
            </span>
          )}
          {showVerified.value && (
            <span class={[bem('suffix-icon'), bem('clear')]}>
              <Icon
                name={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="1em" height="1em" fill="currentColor">
                        <circle cx="24" cy="24" r="21" fill="currentColor"/>
                        <path d="M14.5 24.5l6.2 6.4L33.5 17.8" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                       </svg>`}
                color={'var(--van-success-color)'}
              />
            </span>
          )}
          {props.showEye && (
            <span
              class={[
                bem('suffix-icon'),
                bem('eye', {
                  show: visiblePassword.value,
                }),
              ]}
              onClick={updateVisiblePassword}
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
