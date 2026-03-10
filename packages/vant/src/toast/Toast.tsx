import {
  watch,
  onMounted,
  onUnmounted,
  defineComponent,
  type PropType,
  type TeleportProps,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  pick,
  isDef,
  unknownProp,
  numericProp,
  makeStringProp,
  makeNumberProp,
  createNamespace,
} from '../utils';
import { lockClick } from './lock-click';

// Components
import { Icon } from '../icon';
import { Popup } from '../popup';
import { Loading, LoadingType } from '../loading';

// Types
import type { ToastType, ToastPosition, ToastWordBreak } from './types';

const [name, bem] = createNamespace('toast');

const popupInheritProps = [
  'show',
  'overlay',
  'teleport',
  'transition',
  'overlayClass',
  'overlayStyle',
  'closeOnClickOverlay',
  'zIndex',
] as const;

export const toastProps = {
  show: Boolean,
  type: makeStringProp<ToastType>('info'),
  overlay: Boolean,
  iconSize: numericProp,
  duration: makeNumberProp(2000),
  position: makeStringProp<ToastPosition>('middle'),
  teleport: [String, Element, Boolean] as PropType<TeleportProps['to']>,
  wordBreak: String as PropType<ToastWordBreak>,
  className: unknownProp,
  iconPrefix: String,
  transition: makeStringProp('animate-zoom'), //van-fade
  loadingType: String as PropType<LoadingType>,
  forbidClick: Boolean,
  overlayClass: unknownProp,
  overlayStyle: Object as PropType<CSSProperties>,
  closeOnClick: Boolean,
  closeOnClickOverlay: Boolean,
  zIndex: numericProp,
  icon: {
    type: [Object, Function],
  },
  loadingColor: {
    type: String,
    required: false,
  },
  message: {
    type: [String, Object, Function],
    default: '',
  },
};

export type ToastProps = ExtractPropTypes<typeof toastProps>;

export default defineComponent({
  name,

  props: toastProps,

  emits: ['update:show'],

  setup(props, { emit, slots }) {
    let timer: ReturnType<typeof setTimeout>;
    let clickable = false;

    const toggleClickable = () => {
      const newValue = props.show && props.overlay;
      if (clickable !== newValue) {
        clickable = newValue;
        lockClick(clickable);
      }
    };

    const updateShow = (show: boolean) => emit('update:show', show);

    // const onClick = () => {
    //   if (props.closeOnClick) {
    //     updateShow(false);
    //   }
    // };

    const clearTimer = () => clearTimeout(timer);

    const renderIcon = () => {
      const { type, icon, iconSize, iconPrefix, loadingType } = props;
      let iconName = undefined;
      if (!!icon) {
        if (typeof icon == 'function') {
          return icon();
        } else {
          iconName = String(icon);
        }
      } else {
        if(type === 'info' ||
          type === 'warning' ||
          type === 'success' ||
          type === 'error') {
          iconName = type === 'error' ? 'clear' : type;
        }
      }

      if (!!iconName) {
        return (
          <div class={[bem('icon'), bem(undefined, iconName, true)]}>
            <Icon
              name={iconName}
              size={iconSize}
              classPrefix={iconPrefix}
            />
          </div>
        );
      }

      if (type === 'loading') {
        return (
          <div class={[bem('icon'), bem(undefined, 'loading', true)]}>
            <Loading size={iconSize} type={loadingType} />
          </div>
        );
      }
      // if (!!icon)
      //   return typeof icon == "function" ? (icon as Function)() : icon;
      // if (u === 'success' || u === 'info' || u === 'warn' || u === 'error')
      // return <Icon
      //   name={u}
      //   class={[bem('icon'), bem(u)]}
      //   //classPrefix={iconPrefix}
      // />;
      // if (u === 'loading')
      //   return <Loading class={bem('loading')} type={loadingType} />;
      // return v("div", {
      //   class: [cs("toast--icon"), cs("toast--loading")]
      // }, [v(aO, {
      //   color: props.loadingColor
      // }, null)])
    };

    const renderMessage = () => {
      const { type, message } = props;

      if (slots.message) {
        return <div class={bem('message')}>{slots.message()}</div>;
      }

      if (isDef(message) && message !== '') {
        return type === 'html' ? (
          <div key={0} class={bem('message')} innerHTML={String(message)} />
        ) : (
          <div class={bem('message')}>{message}</div>
        );
      }
    };

    watch(() => [props.show, props.overlay], toggleClickable);

    watch(
      () => [props.show, props.type, props.message, props.duration],
      () => {
        clearTimer();
        if (props.show && props.duration > 0) {
          timer = setTimeout(() => {
            updateShow(false);
          }, props.duration);
        }
      },
    );

    onMounted(toggleClickable);
    onUnmounted(toggleClickable);

    return () => (
      <Popup
        class={[
          bem([
            props.position,
            props.wordBreak === 'normal' ? 'break-normal' : props.wordBreak,
            { [props.type]: !props.icon },
          ]),
          props.className,
        ]}
        lockScroll={false}
        // onClick={onClick}
        onClosed={clearTimer}
        onUpdate:show={updateShow}
        {...pick(props, popupInheritProps)}
      >
        <div class={bem(['instance'])}>
          {renderIcon()}
          {renderMessage()}
        </div>
      </Popup>
    );
  },
});
