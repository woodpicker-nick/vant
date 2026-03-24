import {
  defineComponent,
  type ExtractPropTypes,
  ref,
  shallowRef,
  computed,
  watch,
  provide,
  watchEffect,
  createTextVNode,
  onMounted,
  nextTick,
  h as v,
  type PropType,
  InjectionKey,
} from 'vue';
import {
  createNamespace,
  unknownProp,
  isDef,
  isNull,
  addUnit,
  isNotVueObject,
  makeStringProp, FORM_KEY,
} from "../utils";
import { useChildren, useClickAway, useParent } from '@vant/use';
import { useId } from '../composables/use-id';
import get from 'lodash-es/get';
import Icon from '../icon';
import SelectInput from '../select-input';
import SelectSingle from '../select-single';
import SelectOption from '../select-options';
import Popover, { type PopoverPlacement } from '../popover';
import Scroller from '../scroll';
import { icons } from './icon';
import { useExpose } from "../composables/use-expose";

const [name, bem] = createNamespace('select');

const formItemType = {
  label: 'label',
  value: 'value',
  disabled: 'disabled',
  options: 'options',
  icon: 'icon',
};

function g$(e: any) {
  return Object.assign(formItemType, e);
}

function f$(e: any, t: any) {
  const n = g$(t);
  return e.map((a: any) => ({
    label: a[n.label],
    value: a[n.value],
    options: a[n.options],
  }));
}

function Xv(e: any, t: any, n: any, o: any, a = !0) {
  const r = (i: any) =>
    a
      ? (i || '').includes(t)
      : (i || '').toLowerCase().includes(t.toLowerCase());
  let s = [];
  return (
    e &&
      (n
        ? (s = e.filter((i: any) => (i.props && r(i.props[n])) || r(i[n])))
        : (s = e.filter((i: any) => {
            const l =
                i.props &&
                ((isDef(i.props.label) && r(i.props.label)) ||
                  (isDef(i.props.value) && r(String(i.props.value)))),
              c =
                (isDef(i.label) && r(i.label)) ||
                (isDef(i.value) && r(String(i.value)));
            return l || c;
          }))),
    o == null || o(s),
    s
  );
}

export const selectProps = {
  options: Array,
  width: {
    type: [Number, String],
  },
  maxHeight: {
    type: [Number, String],
  },
  placement: makeStringProp<PopoverPlacement>('bottom-start'),
  offset: {
    type: Array as unknown as PropType<[number, number]>,
    default: () => [0, 0],
  },
  size: {
    type: String,
    default: 'middle',
  },
  round: Boolean,
  class: String,
  dropdownClassName: String,
  optionActiveClass: String,
  displayedOptions: Array,
  filterKey: String,
  wrapperClass: unknownProp,
  popoverClass: unknownProp,
  labelRender: {
    type: Function,
    default: (e: any) => e.label,
  },
  renderNotFount: {
    type: Function,
  },
  placeholder: {
    type: String,
  },
  modelValue: [Array, String, Number, Boolean, Object],
  zIndex: {
    type: [Number, String],
  },
  autoFlip: {
    type: Boolean,
    default: !0,
  },
  autoWidth: {
    type: Boolean,
    default: !1,
  },
  minWidth: {
    type: String,
  },
  fields: {
    type: Object,
    default: () => formItemType,
  },
  allowClear: {
    type: Boolean,
    default: !1,
  },
  isDisabled: {
    type: Boolean,
    default: !1,
  },
  showSearch: {
    type: Boolean,
    default: !1,
  },
  searchCaseSensitive: {
    type: Boolean,
    default: !0,
  },
  showArrow: {
    type: Boolean,
    default: !0,
  },
  mode: {
    type: String,
    default: 'single',
  },
  notFoundContent: {
    type: Boolean,
    default: !0,
  },
  suffixIcon: {
    type: Function,
  },
  arrowIcon: {
    type: String,
  },
  fillMode: {
    type: String,
    default: 'lead',
  },
  showStarSign: Boolean,
  required: Boolean,
  readonly: {
    type: Boolean,
    default: !1,
  },
  useReadonlyStyle: {
    type: Boolean,
    default: !0,
  },
  isSearchingTriggerValueChange: {
    type: Boolean,
    default: !1,
  },
  arrowPosition: {
    type: String,
    default: 'bottom',
  },
  noDataText: {
    type: String,
    default: 'Data not found',
  }
};

export type SelectProps = ExtractPropTypes<typeof selectProps>;

export type SelectProvide = {
  id: String;
  props: SelectProps;
  optionActiveClass: any;
  selectedValue: any;
  selectedIndex: any;
  handleClick: Function;
};

export const SELECT_KEY: InjectionKey<SelectProvide> = Symbol(name);

export default defineComponent({
  name,
  props: selectProps,
  emits: ['update:modelValue', 'change', 'search', 'selected', 'close'],
  setup(props, { emit, slots }) {
    function d$(e: any) {
      const t = computed(() => ({
        ...formItemType,
        ...e.fields,
      }));
      return {
        aliasProps: t,
        getLabel: (i: any) => get(i, t.value.label),
        getValue: (i: any) => get(i, t.value.value),
        getDisabled: (i: any) => get(i, t.value.disabled),
        getOptions: (i: any) => get(i, t.value.options),
        getIcon: (i: any) => get(i, t.value.icon),
      };
    }

    const { parent } = useParent<any>(FORM_KEY);

    const o = ref(!1),
      a = ref(),
      r = ref(),
      s = ref(''),
      i = ref(),
      l = ref(),
      //, {t: c} = _e() //i18n
      u = shallowRef<number | null>(null),
      d = ref<any[]>([]),
      f = ref(''),
      { children: h, linkChildren } = useChildren(SELECT_KEY),
      p = useId(),
      _ = ref(),
      //, {isRTL: b} = UL()
      //y = computed(() => props.placement),
      S = {
        start: 'end',
        end: 'start',
      };

    let C = !1;
    const A = () => _.value && !f.value,
      O = computed(() => {
        var z, ee;
        return (
          !!((ee =
            (z = parent == null ? void 0 : parent.required) == null ? void 0 : z.value) !=
          null
            ? ee
            : props.required) && props.showStarSign
        );
      });
    provide(Symbol('show-star-sign'), O);

    const k = (z: any) => {
        const ee = props.labelRender({
          label: z.label,
          value: z.value,
        });
        return props.showSearch
          ? typeof ee == 'string'
            ? ee
            : 'showSearch use input value attr , props.labelRender support return type string only!'
          : ee;
      },
      P = computed(() => props.mode === 'single'),
      { getLabel: R, getValue: T, getIcon: H } = d$(props);

    watchEffect(() => {
      props.fields
        ? (d.value = f$(props.options || [], props.fields))
        : (d.value = props.options || []);
    });

    const V = (z: any) => {
        const ee = z.findIndex(
            (ne: any) => (ne.props ? ne.props.value : ne.value) === r.value,
          ),
          ae = ee === -1 ? z[0] : z[ee];
        ae ? (s.value = ae.props ? ae.props.value : ae.value) : (s.value = '');
      },
      G = computed(() =>
        Xv(d.value, f.value, props.filterKey, V, props.searchCaseSensitive),
      ),
      modelValue = computed({
        get() {
          const { modelValue: z, mode: ee } = props,
            ae = ee === 'multiple',
            ne = ae ? [] : void 0;
          return Array.isArray(z) ? (ae ? z : ne) : ae ? ne : z;
        },
        set(z) {
          emit('update:modelValue', z);
        },
      });
    watch(
      () => modelValue.value,
      (z) => {
        updateValue(z);
      },
    );

    const updateValue = (z: any) => {
        parent?.onChildChange?.(z);
      },
      E = ref(),
      j = (z: any) => {
        r.value = isDef(z) ? z : null;
        const ee = h.find((re) => re.value === z),
          { label: ae, value: ne } = ee || {
            value: z,
            label: '',
          };
        E.value = isDef(ne)
          ? k({
              label: ae,
              value: ne,
            })
          : ne;
      };
    watch(
      () => modelValue.value,
      (z, ee) => {
        var ae;
        ((ae = parent == null ? void 0 : parent.onInitValue) == null || ae.call(parent, z),
          z !== ee && j(z));
      },
      {
        immediate: true,
        flush: 'post',
      },
    );

    const W = computed(() =>
        isNull(modelValue.value) ? -1 : h.findIndex((z) => z.value === modelValue.value),
      ),
      K = computed(() => ({
        width: addUnit(props.width),
        maxHeight: addUnit(props.maxHeight),
      })),
      ie = () => {
        ((modelValue.value = void 0), (E.value = void 0));
      },
      Y = computed(() => !!(props.allowClear && E.value && o.value));

    const fe = () => (
        <>
          <Icon v-show={Y.value} onClick={ie} class={bem('icon-clear')} name={"clear"}/>
          {slots.suffix ? slots.suffix() : (
            <i
              key={'icon-arrow'}
              class={[
                bem('icon', {
                  arrowBottom:
                    props.arrowPosition === 'bottom' ? !o.value : o.value,
                  arrowTop:
                    props.arrowPosition === 'bottom' ? o.value : !o.value,
                }),
                bem('icon-arrow'),
              ]}
              v-show={
                props.showArrow &&
                !(props.readonly && props.useReadonlyStyle) &&
                !Y.value
              }
              v-html={icons.iconArrow}
            />
          )}
        </>
    );

    const $ = () => {
      const z = (ke: any) => {
          _.value = ke;
        },
        ee = (ke: any) => {
          _.value = ke;
        },
        ae = (ke: any) => {
          var Ge;
          (props.isSearchingTriggerValueChange &&
            ((Ge = parent == null ? void 0 : parent.onChildChange) == null ||
              Ge.call(parent, ke)),
            emit('search', ke),
            props.showSearch && (f.value = ke));
        },
        ne = (ke: any) => {
          (ke.stopPropagation(), props.showSearch && (o.value = !0));
        },
        re = computed(() => h.find((ke) => ke.value === r.value)),
        oe = computed(() => {
          var ut, Yt;
          const ke = (ut = re.value) == null ? void 0 : ut.label,
            Ge = (Yt = re.value) == null ? void 0 : Yt.value;
          return isDef(Ge)
            ? k({
                label: ke,
                value: Ge,
              })
            : Ge;
        }),
        Ie = computed(() => (f.value ? E.value : oe.value)),
        Re = A();
      return (
        <div
          ref={a}
          class={[
            bem('reference', {
              [props.size]: props.size,
              round: props.round,
              border: o.value,
            }),
          ]}
        >
          {props.mode === 'single' && props.showSearch ? (
            <SelectInput
              placeholder={Re ? Ie.value : props.placeholder}
              value={Re ? '' : Ie.value}
              onUpdate:value={(ke) => {
                E.value = ke;
              }}
              allowClear={props.allowClear}
              showSearch={props.showSearch}
              onClick={ne}
              onInput={ae}
              onBlur={z}
              onFocus={ee}
              fillMode={props.fillMode}
              disabled={props.readonly}
              v-slots={{
                prefix: slots.prefix,
                suffix: fe,
              }}
            ></SelectInput>
          ) : (
            <SelectSingle
              placeholder={props.placeholder}
              readonly={props.readonly}
              useReadonlyStyle={props.useReadonlyStyle}
              fillMode={props.fillMode}
              v-slots={{
                prefix: slots.prefix,
                suffix: fe,
                content: () => Ie.value,
              }}
            ></SelectSingle>
          )}
        </div>
      );
    };

    const he = () => (slots.icon ? v('span', null, [slots.icon()]) : null),
      be = () =>
        props.mode !== 'multiple'
          ? null
          : v('span', null, [
              v(Icon, null, {
                default: () => [createTextVNode('多选')],
              }),
            ]),
      te = (z: any, ee: any) => {
        ((modelValue.value = ee.value),
          props.mode === 'single' && emit('selected', ee),
          P.value && Z(),
          r.value !== ee.value && emit('change', ee));
      };

    onMounted(() => {
      watch(
        o,
        (z) => {
          let ee;
          if (z) {
            const ae = Math.ceil(
              (ee = a.value) == null ? void 0 : ee.offsetWidth,
            );
            u.value !== ae && !Number.isNaN(ae) && (u.value = ae);
          } else emit('close');
        },
        {
          immediate: !0,
          flush: 'post',
        },
      );
    });

    const Z = (z = !1) => {
      if (z && props.showSearch) {
        const ee = (ne: any) => {
            o.value ||
              (ie(),
              nextTick(() => {
                ((modelValue.value = ne), j(ne));
              }));
          },
          ae = () => {
            isDef(r.value) && r.value !== '' && ee(r.value);
          };
        f.value && isDef(s.value) && s.value !== ''
          ? (ee(s.value), console.log('searchMatchedValue.value', s.value))
          : ae();
      }
      ((s.value = ''), (f.value = ''), (o.value = !1), (C = !0));
    };

    const ue = () => {
      o.value = !0;
    };
    (useClickAway([a, l], () => {
      C || Z(!0);
    }),
      watch(
        () => o.value,
        (z) => {
          z && (C = !1);
        },
      ),
      useExpose({
        close: Z,
        open: ue,
        showPopover: o,
      }),
      linkChildren({
        id: p,
        props,
        optionActiveClass: props.optionActiveClass,
        selectedValue: r,
        selectedIndex: W,
        handleClick: (z: any, ee: any) => te(z, ee),
      }));
    const Oe = (z: any) => {
        const {
          label: ee,
          icon: ae,
          value: ne,
        } = {
          label: R(z),
          icon: H(z),
          value: T(z),
        };
        return v(
          SelectOption,
          {
            value: ne,
            label: ee,
            icon: ae,
          },
          {
            icon: () => he(),
            rightIcon: () => be(),
            default: () => ee || ne,
          },
        );
      },
      le = () => {
        let z;
        if (props.options) return G.value.map((ee: any) => Oe(ee));
        if (slots.default && slots.default())
          if (props.showSearch) {
            const ee =
              (z = slots.default) == null ? void 0 : z.call(slots)[0].children;
            return Xv(
              ee,
              f.value,
              props.filterKey,
              V,
              props.searchCaseSensitive,
            );
          } else return slots.default();
        else return null;
      };
    return () => {
      const content = le();
      const Y = {
        width: props.autoWidth ? 'fit-content' : `${u.value}px`,
      };
      return (
        <Popover
          wrapperClass={props.wrapperClass}
          popoverClass={props.popoverClass}
          transition={'drop-down'}
          placement={props.placement}
          z-index={props.zIndex}
          showArrow={false}
          style={Y}
          v-model:show={o.value}
          offset={props.offset}
          autoFlip={props.autoFlip}
          readonly={props.readonly}
          v-slots={{
            reference: () => $(),
            default: () => (
              <div
                ref={l}
                class={[bem('options'), props.dropdownClassName]}
                style={K.value}
              >
                {content?.length ? (
                  <Scroller
                    ref={i}
                    scrollable={true}
                    draggable={false}
                    direction={'y'}
                    class={bem('scroll')}
                    forceSystemScrollbar={true}
                    v-slots={{
                      default: () =>
                        isNotVueObject(content) ? content : [content],
                    }}
                  ></Scroller>
                ) : slots.notData ? (
                  slots.notData()
                ) : (
                  <div class={bem('not-found')}>{props.noDataText}</div>
                )}
              </div>
            ),
          }}
        />
      );
    };
  },
});
