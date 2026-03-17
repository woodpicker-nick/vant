import {
  ref,
  defineComponent,
  Teleport,
  Transition,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
  type TeleportProps,
} from 'vue';

// Utils
import {
  isDef,
  extend,
  truthProp,
  numericProp,
  unknownProp,
  preventDefault,
  createNamespace,
  getZIndexStyle,
} from '../utils';

// Composables
import { useEventListener } from '@vant/use';
import { useLazyRender } from '../composables/use-lazy-render';

const [name, bem] = createNamespace('overlay');

export const overlayProps = {
  show: Boolean,
  zIndex: numericProp,
  duration: numericProp,
  className: unknownProp,
  lockScroll: truthProp,
  lazyRender: truthProp,
  customStyle: Object as PropType<CSSProperties>,
  teleport: [String, Object] as PropType<TeleportProps['to']>,
  isShowFrostedGlassEffect: Boolean,
  hiddenWrap: Boolean,
  destroyOnClose: Boolean
};

export type OverlayProps = ExtractPropTypes<typeof overlayProps>;

export default defineComponent({
  name,

  inheritAttrs: false,

  props: overlayProps,

  setup(props, { attrs, slots }) {
    const root = ref<HTMLElement>();
    const lazyRender = useLazyRender(() => props.show || !props.lazyRender);

    const onTouchMove = (event: TouchEvent) => {
      if (props.lockScroll) {
        preventDefault(event, true);
      }
    };

    const renderOverlay = lazyRender(() => {
      const style: CSSProperties = extend(
        getZIndexStyle(props.zIndex),
        props.customStyle,
      );

      if (isDef(props.duration)) {
        style.animationDuration = `${props.duration}s`;
      }

      return (
        <div
          v-show={props.show}
          ref={root}
          style={style}
          class={[bem(), props.className, props.isShowFrostedGlassEffect ? "isShowFrostedGlassEffect" : ""]}
          {...attrs}
          data-hidden={props.hiddenWrap ? "1" : "0"}
        >
          {slots.default?.()}
        </div>
      );
    });

    // useEventListener will set passive to `false` to eliminate the warning of Chrome
    useEventListener('touchmove', onTouchMove, {
      target: root,
    });

    return () => {
      if (!props.show && props.destroyOnClose) {
        return;
      }

      const Content = (
        <Transition
          v-slots={{ default: renderOverlay }}
          name="van-fade"
          appear
        />
      );

      if (props.teleport) {
        return <Teleport to={props.teleport}>{Content}</Teleport>;
      }

      return Content;
    };
  },
});
