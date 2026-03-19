import {
  computed,
  mergeProps,
  defineComponent,
  onMounted,
  nextTick,
  inject,
  ref,
  watch,
  provide,
  onBeforeUnmount,
  toRaw,
  resolveDirective,
  withDirectives,
  h as createNode,
  type ExtractPropTypes,
} from 'vue';
import { createNamespace, getElement } from '../utils';
import PerfectScrollbar from 'perfect-scrollbar';
import merge from 'lodash-es/merge';
import {
  useScroll,
  useMutationObserver,
  useElementVisibility,
} from '@vueuse/core';
import { dragscroll } from 'vue-dragscroll';
import { browerUtil } from '../utils';
import { scroll } from './utils';
import { useExpose } from "../composables/use-expose";

const [name, bem] = createNamespace('scroll');

export const scrollProps = {
  bindRoute: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: String,
    default: 'div',
  },
  direction: {
    type: String,
    default: 'y',
  },
  scrollable: {
    type: Boolean,
    default: true,
  },
  isInit: {
    type: Boolean,
    default: false,
  },
  scrollbarTrigger: {
    type: String,
    default: 'always',
  },
  forceSystemScrollbar: {
    type: Boolean,
  },
  scrollbarOptions: {
    type: Object,
    default: () => ({}),
  },
  hideSystemScrollbarInTg: {
    type: Boolean,
    default: false,
  },
  forceObserve: {
    type: Boolean,
    default: false,
  },
};

export type ScrollProps = ExtractPropTypes<typeof scrollProps>;

export default defineComponent({
  name,
  props: scrollProps,
  emits: ['init', 'scroll', 'resize'],
  setup(e, { attrs: t, slots: n, emit: o }) {
    const yN = Symbol('discount_common');
    const FO = Symbol('current_scroll_parent_key');
    const a = ref(null),
      r = ref<any>(null),
      s = useScroll(a);
    let i = 0,
      l = 0;
    const { x: c, y: u, arrivedState: d, directions: f, measure: h } = s;
    provide(FO, a);
    const g = inject<any>(yN, ref({})),
      m = computed(() => browerUtil.isDesktop),
      p = computed(() => browerUtil.isFireFox),
      _ = true,
      b = true,
      y = computed(() =>
        e.scrollbarTrigger === 'none' || w.value || b
          ? null
          : merge(
              {
                handlers: ['drag-thumb', 'click-rail'],
                swipeEasing: !1,
                suppressScrollX: e.direction === 'y',
                suppressScrollY: e.direction === 'x',
                scrollXMarginOffset: 1,
                scrollYMarginOffset: 1,
              },
              e.scrollbarOptions,
            ),
      ),
      S = computed(
        () => document.documentElement.getAttribute('dir') === 'rtl',
      ),
      w = computed(
        () =>
          e.scrollbarTrigger !== 'none' &&
          (!m.value || e.forceSystemScrollbar || b || S.value),
      );
    watch(
      () => m.value,
      () => {
        m.value ? C() : A();
      },
    );

    async function C() {
      var W;
      if (!y.value) return;
      await nextTick();
      const j = getElement(a.value);
      if (!j) {
        console.warn(
          '[Scroll] createScrollbarInstance: target element not ready or not an HTMLElement',
          a.value,
        );
        return;
      }
      if (!r.value)
        try {
          ((r.value = new PerfectScrollbar(j, y.value)), R());
        } catch (K) {
          console.error('Failed to load PerfectScrollbar:', K);
        }
    }

    function A() {
      var j;
      if (r.value)
        try {
          (R(!1),
            typeof r.value.destroy == 'function'
              ? r.value.destroy()
              : (j = r.value) != null &&
                j.destroyInstance &&
                r.value.destroyInstance());
        } catch (W) {
          console.warn('[Scroll] destroyScrollbarInstance error:', W);
        } finally {
          r.value = null;
        }
    }

    const O = P('scroll'),
      k = {
        scroll: O,
      };

    function P(j: any) {
      return function (W: any) {
        var K, ie, Y, fe;
        if ((K = g.value) != null && K.preventIosBounce) {
          const $ = (ie = W.target) == null ? void 0 : ie.scrollTop,
            he = (Y = W.target) == null ? void 0 : Y.scrollHeight,
            be = (fe = W.target) == null ? void 0 : fe.clientHeight;
          a.value &&
            ($ < 0
              ? (scroll(a.value, { y: 0 }, { duration: 0.1 }),
                W.preventDefault())
              : $ > he - be + 1 &&
                (scroll(a.value, { y: he - be }, { duration: 0.1 }),
                W.preventDefault()));
        }
        o(j, {
          x: c.value,
          y: u.value,
          arrivedState: d,
          directions: f,
          event: W,
        });
      };
    }

    function R(j = !0) {
      var W;
      (W = r.value) != null &&
        W.element &&
        (j
          ? (window.addEventListener('animationend', T),
            window.addEventListener('transitionend', T))
          : (window.removeEventListener('animationend', T),
            window.removeEventListener('transitionend', T)),
        Object.entries(k).forEach(([K, ie]) => {
          var Y, fe;
          j
            ? (Y = r.value) == null || Y.element.addEventListener(K, ie)
            : (fe = r.value) == null || fe.element.removeEventListener(K, ie);
        }));
    }

    const T = () => {
        H();
      },
      H = () => {
        y.value && r.value && r.value.update();
      };
    (watch(
      () => [e.scrollbarOptions],
      () => {
        H();
      },
      {
        deep: !0,
      },
    ),
      onMounted(() => {
        a.value && C();
      }),
      onBeforeUnmount(() => {
        A();
      }),
      onBeforeUnmount(() => {
        //Kc.remove(toRaw(a.value));
      }));
    const V = resolveDirective('dragscroll'),
      G = () => {
        const { scrollWidth: j = 0, scrollHeight: W = 0 } = a.value || {};
        ((l !== W || i !== j) && (a.value && o('resize', a.value), H()),
          (i = j),
          (l = W));
      };
    ((y.value || e.forceObserve) &&
      useMutationObserver(
        a,
        () => {
          G();
        },
        {
          childList: !0,
          attributes: !0,
          characterData: !0,
          subtree: !0,
        },
      ),
      onMounted(() => {
        o('init', {
          x: c.value,
          y: u.value,
          arrivedState: d,
          directions: f,
        });
      }));
    //const q = WO();
    useExpose({
      scrollEl: a,
      scroller: s,
      scrollTo: (j: any, W = {}) => {
        a.value && scroll(a.value, j, W);
      },
      scrollbar: r,
      updateScrollbar: H,
    });
    const E = useElementVisibility(a);

    watch(
      () => E.value,
      (j) => {
        if (j && (h(), e.isInit))
          switch (e.direction) {
            case 'y':
              u.value = 0;
              break;
            case 'x':
              c.value = 0;
              break;
            default:
              ((c.value = 0), (u.value = 0));
          }
      },
    );

    return () => {
      const j = {
        ...t,
      };
      return withDirectives(
        createNode(
          e.tag,
          mergeProps(
            {
              //'data-route-for-scroll': e.bindRoute ? String(q.value) : void 0,
              ref: a,
              onScroll: y.value ? void 0 : O,
              class: [
                bem(
                  'lobby-scroll',
                  e.scrollable
                    ? [
                        mergeProps({
                          all: e.direction === 'all',
                          x: e.direction === 'x',
                          y: e.direction === 'y',
                          'system-scrollbar': w.value,
                          'is-desktop': m.value,
                          'is-firefox': p.value,
                          // "is-tg": bn.isActivated,
                          'hide-in-tg': e.hideSystemScrollbarInTg,
                        }),
                      ]
                    : [],
                ),
                y.value ? ['ps', `ps-scrollbar-${e.scrollbarTrigger}`] : '',
              ],
            },
            j,
          ),
          {
            default: () => {
              var W;
              return [(W = n.default) == null ? void 0 : W.call(n)];
            },
          },
        ),
        _
          ? []
          : [
              [
                V,
                e.scrollable && e.draggable,
                '',
                e.direction === 'all'
                  ? {}
                  : {
                      x: e.direction === 'x',
                      y: e.direction === 'y',
                    },
              ],
            ],
      );
    };
  },
  directives: dragscroll,
});
