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
import {
  FORM_KEY,
  extend,
  createNamespace,
  isNotNull,
} from '../utils';

// Composables
import {
  useParent,
} from '@vant/use';
import { useExpose } from '../composables/use-expose';

// Components
import { Icon } from '../icon';
import { Divider } from '../divider';

import { icons } from './icon';

import { useClipboard } from '../composables/use-clipboard';

const [name, bem] = createNamespace('field');

type DividerTypes = "all" | "prefix" | "suffix";

// provide to Search component to inherit
export const fieldSharedProps = {
  id: String,
  value: [Number, String],
  name: String
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
    default: undefined
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
    const o = ref(!1),
      i = ref(!1),
      c = shallowRef<any>({
        selection: null,
        valueLength: void 0,
      }),
      l = ref<any>(null);
    let u: any = null;
    const d = ref(!1),
      r = () => {
        let D: any;
        return (D = l.value) == null ? void 0 : D.value;
      },
      f = (D = '') => {
        var W, ee;
        if (!l.value) return;
        const { selectionStart: I, selectionEnd: G } = l.value;
        if (isNotNull(I) && isNotNull(G) && o.value) {
          const Te =
            ((W = c.value.selection) != null ? W : 0) -
            (((ee = c.value.valueLength) != null ? ee : 0) - D.length);
          l.value.setSelectionRange(Te, Te);
        }
      },
      m = (D = '', I = 'input') => {
        if (l.value) {
          const { selectionStart: G } = l.value;
          I !== 'input'
            ? ((l.value.value = D), f(D))
            : (c.value = {
                selection: G,
                valueLength: D.length,
              });
        }
        D !== props.value
          ? (emit('update:value', D),
            nextTick(() => {
              var G;
              if (
                (emit('change', D),
                d.value &&
                  ((G = g == null ? void 0 : g.onChildChange) == null ||
                    G.call(g, props.value)),
                (d.value = !0),
                l.value)
              ) {
                const W = props.value ? String(props.value) : '';
                l.value.value !== W && ((l.value.value = W), f(l.value.value));
              }
            }))
          : (d.value = !0);
      },
      y = () => {
        m(isNotNull(props.value) ? String(props.value) : '', 'parent');
      };
    (watch(
      () => props.value,
      (D) => {
        var I;
        D !== r() &&
          (y(),
          (I = g == null ? void 0 : g.onChildChange) == null ||
            I.call(g, props.value));
      },
    ),
      onMounted(() => {
        var D;
        (y(),
          (D = g == null ? void 0 : g.onInitValue) == null ||
            D.call(g, props.value));
      }));
    const { parent: g } = useParent<any>(FORM_KEY);
    (ie = g == null ? void 0 : g.onInitValue) == null ||
      ie.call(g, props.value);
    const v = computed(() => {
        var D, I;
        return !!((I =
          (D = g == null ? void 0 : g.required) == null ? void 0 : D.value) !=
        null
          ? I
          : props.required);
      }),
      b = computed(() => {
        var D;
        return isNotNull(
          (D = g == null ? void 0 : g.showStarSign) == null ? void 0 : D.value,
        )
          ? g.showStarSign.value
          : props.showStarSign && v.value;
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
      P = (D: any) => {
        var I;
        (emit('blur', D),
          (I = g == null ? void 0 : g.onChildBlur) == null ||
            I.call(g, props.value),
          (u = setTimeout(() => {
            o.value = !1;
          }, 300)));
      },
      O = (D: any) => {
        (u && clearTimeout(u), emit('focus', D), (o.value = !0));
      },
      N = () => {
        i.value || m(r(), 'input');
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
              if (l.value && props.ignores)
                for (const W of props.ignores)
                  l.value.value =
                    (G = l.value) == null ? void 0 : G.value.replaceAll(W, '');
              m(r(), 'input');
            }
          });
      },
      E = () => {
        i.value = !0;
      },
      S = () => {
        ((i.value = !1), N());
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
        var I;
        (emit('update:value', ''),
          emit('clear', D),
          (I = l.value) == null || I.focus());
      };
    useExpose({
      focus() {
        l.value && l.value.focus();
      },
      blur() {
        l.value && l.value.blur();
      },
      $input: l,
    });
    const H = () => {
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
              ref: l,
              spellcheck: 'false',
              size: 1,
              type: B.value,
              placeholder: props.placeholder,
              disabled: props.disabled,
              class: [bem('input'), props.inputClass],
              style: props.inputStyle,
              onInput: N,
              onChange: S,
              onBlur: P,
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
            class={props.divider && (props.divider === 'all' || props.divider === 'prefix') ? '' : bem('prefix')}
            onClick={() => emit('clickPrefix')}
          >
            {slots.prefix ? (
              slots.prefix()
            ) : (
              <Icon class={bem('prefix-icon')} name={props.prefixIcon}></Icon>
            )}
          </span>
        )}
        {props.divider && (props.divider === 'all' || props.divider === 'prefix') && <Divider vertical />}
        <section class={bem('input-wrap')}>
          {b.value && <span class={bem('star-sign')}>*</span>}
          {H()}
        </section>
        {props.divider && (props.divider === 'all' || props.divider === 'suffix') && <Divider vertical />}
        <section class={bem('suffix', props.divider && (props.divider === 'all' || props.divider === 'suffix') ? '' : 'padding')}>
          {_.value && (
            <span onClick={M} class={[bem('suffix-icon'), bem('clear')]}>
              <Icon name={'/lobby_asset/common/web/common/comm_icon_qc.svg'} />
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
