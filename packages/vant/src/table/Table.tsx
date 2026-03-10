import {
  computed,
  defineComponent,
  ExtractPropTypes,
  onMounted,
  ref,
  watch,
  nextTick,
} from 'vue';
import {
  createNamespace,
  makeRequiredProp,
  makeStringProp,
  convertToPx,
  truthProp,
} from "../utils";

const [name, bem] = createNamespace('table');

export const tableProps = {
  uniqueKey: makeStringProp('id'),
  columns: makeRequiredProp(Array),
  data: makeRequiredProp(Array),
  list: {
    type: Object,
    default: () => ({}),
  },
  reverse: Boolean,
  rowClassName: {
    type: Function,
    default: () => {},
  },
  popoverPlacement: makeStringProp('top'),
  popoverOffset: {
    type: Array,
    default: () => [0, 6],
  },
  showHeader: truthProp,
};

export type TableProps = ExtractPropTypes<typeof tableProps>;

export default defineComponent({
  name,
  props: tableProps,
  emits: ['clickTooltip', 'load', 'retry'],
  setup(props, { emit }) {
    const l = ref();
    //const a = ref(false);
    const s = ref(convertToPx(750));
    const n = async () => await nextTick(() => {
      l.value && (s.value = l.value.clientWidth)
    });
    window.addEventListener('resize', n);
    onMounted(() => {
      n().then();
    });
    // a && Se(a, m => {
    //     m && n()
    //   }
    // )

    watch(
      () => props.data,
      () => {
        n().then();
      },
    );

    const i = computed(
      () => !Array.isArray(props.data) || !Array.isArray(props.columns),
    );
    const c = computed(() => {
      var f, h;
      const m =
        (h =
          (f = props.columns) == null
            ? void 0
            : f.reduce(
                (p, y: any) => p + ((y == null ? void 0 : y.width) || 0),
                0,
              )) != null
          ? h
          : 0;
      return convertToPx(m);
    });
    const r = computed(() => {
      var h, p;
      const m = s.value - c.value,
        f =
          (p =
            (h = props.columns) == null
              ? void 0
              : h.filter((y: any) => !y.width).length) != null
            ? p
            : 0;
      return f > 0 ? m / f : 0;
    });

    const u = (m: any) => emit('clickTooltip', m);

    const d = (m: any) =>
      typeof m.tooltip == 'string' ? (
        <van-popover
          showArrow={true}
          placement={props.popoverPlacement}
          offset={props.popoverOffset}
          overlayStyle={{
            zIndex: 2,
          }}
          overlayClass={'tooltip-popover'}
          v-slots={{
            default: () => (
              <div
                class={'tooltip-content'}
                onClick={() => u(m)}
                innerHTML={m.tooltip}
              ></div>
            ),
            reference: () => (
              <span class={'tooltip'} onClick={() => u(m)}>
                ?
              </span>
            ),
            arrow: () => <span class={'toltip-arrow'}></span>,
          }}
        ></van-popover>
      ) : (
        <span class={'tooltip'} onClick={() => u(m)}>
          ?
        </span>
      );

    const b = (m: any) => {
      const f = m.width ? `${convertToPx(m.width)}px` : `${r.value}px`;
      return (
        <div
          key={m.key}
          class={bem('thead-item')}
          style={{
            width: f,
          }}
        >
          <span
            class={[bem('thead-cell'), m.tooltip && bem('thead-cell-tooltip')]}
          >
            {typeof m.title == 'function' ? m.title(m) : m.title}
          </span>
          {m.tooltip && d(m)}
        </div>
      );
    };

    const v = () => {
      var m;
      return (m = props.data) == null
        ? void 0
        : m.map((f: any, h) => {
            var p, y;
            return (
              <div
                class={[
                  bem('cell'),
                  (p = props == null ? void 0 : props.rowClassName) == null
                    ? void 0
                    : p.call(props, f, h),
                ]}
                key={f[props.uniqueKey]}
              >
                {[
                  (y = props.columns) == null
                    ? void 0
                    : y.map((_: any) => {
                        const x = _.width
                          ? `${convertToPx(_.width)}px`
                          : `${r.value}px`;
                        return (
                          <span
                            key={_.key}
                            class={bem('cell-item')}
                            style={{
                              width: x,
                            }}
                          >
                            {_.customRender
                              ? _.customRender({ value: f[_.key], record: f })
                              : f[_.key]}
                          </span>
                        );
                      }),
                ]}
              </div>
            );
          });
    };

    return () => (
      <div ref={l} class={[name, props.reverse && bem('table-reverse')]}>
        { props.showHeader && <div class={bem('thead')}>
          {Array.isArray(props.columns) && props.columns.map(b)}
        </div> }
        <van-list
          class={bem('tbody')}
          onLoad={() => emit('load')}
          v-slots={{
            default: () => !i.value && v(),
          }}
        ></van-list>
      </div>
    );
  },
});
