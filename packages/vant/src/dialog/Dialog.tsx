import {
  ref,
  reactive,
  withKeys,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  noop,
  pick,
  extend,
  addUnit,
  truthProp,
  isFunction,
  BORDER_TOP,
  BORDER_LEFT,
  unknownProp,
  numericProp,
  makeStringProp,
  callInterceptor,
  createNamespace,
  type ComponentInstance,
} from '../utils';
import { popupSharedProps, popupSharedPropKeys } from '../popup/shared';

// Components
import { Popup } from '../popup';
import { Button } from '../button';
import { ActionBar } from '../action-bar';
import { ActionBarButton } from '../action-bar-button';

// Types
import type {
  DialogTheme,
  DialogAction,
  DialogMessage,
  DialogMessageAlign,
} from './types';

const [name, bem, t] = createNamespace('dialog');

export const dialogProps = extend({}, popupSharedProps, {
  title: String,
  theme: String as PropType<DialogTheme>,
  width: numericProp,
  message: [String, Function] as PropType<DialogMessage>,
  callback: Function as PropType<(action?: DialogAction) => void>,
  allowHtml: Boolean,
  className: unknownProp,
  transition: makeStringProp('van-dialog-bounce'),
  messageAlign: String as PropType<DialogMessageAlign>,
  closeOnPopstate: truthProp,
  showCancelButton: Boolean,
  cancelButtonText: String,
  cancelButtonColor: String,
  cancelButtonDisabled: Boolean,
  confirmButtonText: String,
  confirmButtonColor: String,
  confirmButtonDisabled: Boolean,
  showConfirmButton: truthProp,
  closeOnClickOverlay: Boolean,
  keyboardEnabled: truthProp,
  destroyOnClose: Boolean,
  showClose: truthProp,
  customClose1: Boolean,
  isShowFrostedGlassEffect: Boolean
});

export type DialogProps = ExtractPropTypes<typeof dialogProps>;

const popupInheritKeys = [
  ...popupSharedPropKeys,
  'isShowFrostedGlassEffect',
  'transition',
  'closeOnPopstate',
  'destroyOnClose',
] as const;

export default defineComponent({
  name,

  props: dialogProps,

  emits: ['confirm', 'cancel', 'close', 'keydown', 'update:show'],

  setup(props, { emit, slots }) {
    const root = ref<ComponentInstance>();
    const loading = reactive({
      confirm: false,
      cancel: false,
      close: false
    });

    const updateShow = (value: boolean) => emit('update:show', value);

    const close = (action: DialogAction) => {
      updateShow(false);
      props.callback?.(action);
    };

    const getActionHandler = (action: DialogAction) => () => {
      // should not trigger close event when hidden
      if (!props.show) {
        return;
      }

      emit(action);

      if (props.beforeClose) {
        loading[action] = true;
        callInterceptor(props.beforeClose, {
          args: [action],
          done() {
            close(action);
            loading[action] = false;
          },
          canceled() {
            loading[action] = false;
          },
        });
      } else {
        close(action);
      }
    };

    const onClose = getActionHandler('close');

    const onCancel = getActionHandler('cancel');
    const onConfirm = getActionHandler('confirm');
    const onKeydown = withKeys(
      (event: KeyboardEvent) => {
        if (!props.keyboardEnabled) {
          return;
        }
        // skip keyboard events of child elements
        if (event.target !== root.value?.popupRef?.value) {
          return;
        }

        const onEventType: Record<string, () => void> = {
          Enter: props.showConfirmButton ? onConfirm : noop,
          Escape: props.showCancelButton ? onCancel : noop,
        };

        onEventType[event.key]();
        emit('keydown', event);
      },
      ['enter', 'esc'],
    );

    const renderTitle = () => {
      const title = slots.title ? slots.title() : props.title;
      if (title) {
        return (
          <div
            class={(props.customClose1 || slots.close ) ? bem('main', 'header', true) : bem('header', {
              isolated: !props.message && !slots.default,
            })}
          >
            {title}
          </div>
        );
      }
    };

    const renderMessage = (hasTitle: boolean) => {
      const { message, allowHtml, messageAlign } = props;
      const classNames = bem('message', {
        'has-title': hasTitle,
        [messageAlign as string]: messageAlign,
      });

      const content = isFunction(message) ? message() : message;

      if (allowHtml && typeof content === 'string') {
        return <div class={classNames} innerHTML={content} />;
      }

      return <div class={classNames}>{content}</div>;
    };

    const renderContent = () => {
      if (slots.default) {
        return <div class={(props.customClose1 || slots.close ) ? bem('main', 'content', true) : bem('content')}>{slots.default()}</div>;
      }

      const { title, message, allowHtml } = props;
      if (message) {
        const hasTitle = !!(title || slots.title);
        return (
          <div
            // add key to force re-render
            // see: https://github.com/vant-ui/vant/issues/7963
            key={allowHtml ? 1 : 0}
            class={(props.customClose1 || slots.close ) ? bem('main', 'content', true) : bem('content', { isolated: !hasTitle })}
          >
            {renderMessage(hasTitle)}
          </div>
        );
      }
    };

    const renderButtons = () => (
      <div class={[BORDER_TOP, bem('footer')]}>
        {props.showCancelButton && (
          <Button
            size="large"
            text={props.cancelButtonText || t('cancel')}
            class={bem('cancel')}
            style={{ color: props.cancelButtonColor }}
            loading={loading.cancel}
            disabled={props.cancelButtonDisabled}
            onClick={onCancel}
          />
        )}
        {props.showConfirmButton && (
          <Button
            size="large"
            text={props.confirmButtonText || t('confirm')}
            class={[bem('confirm'), { [BORDER_LEFT]: props.showCancelButton }]}
            style={{ color: props.confirmButtonColor }}
            loading={loading.confirm}
            disabled={props.confirmButtonDisabled}
            onClick={onConfirm}
          />
        )}
      </div>
    );

    const renderRoundButtons = () => (
      <ActionBar class={bem('footer')}>
        {props.showCancelButton && (
          <ActionBarButton
            type="warning"
            text={props.cancelButtonText || t('cancel')}
            class={bem('cancel')}
            color={props.cancelButtonColor}
            loading={loading.cancel}
            disabled={props.cancelButtonDisabled}
            onClick={onCancel}
          />
        )}
        {props.showConfirmButton && (
          <ActionBarButton
            type="danger"
            text={props.confirmButtonText || t('confirm')}
            class={bem('confirm')}
            color={props.confirmButtonColor}
            loading={loading.confirm}
            disabled={props.confirmButtonDisabled}
            onClick={onConfirm}
          />
        )}
      </ActionBar>
    );

    const renderFooter = () => {
      if (slots.footer) {
        return <div class={bem('footer')}>{slots.footer()}</div>;
      }
      return props.theme === 'round-button'
        ? renderRoundButtons()
        : renderButtons();
    };

    const renderCustomCloseBox = () => {
      if (props.customClose1) {
        return (
          <div class={bem('close-box', 'occupy-space')}>
            <div>
              <i
                class={bem("close-box-icon")}
                style="display: inline-flex; justify-content: center; align-items: center;"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 82 82"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                >
                  <path d="M0,41A41,41,0,1,1,41,82,41,41,0,0,1,0,41Zm6,0A35,35,0,1,0,41,6,35.039,35.039,0,0,0,6,41ZM51.879,56.121,41,45.243,30.121,56.121a3,3,0,1,1-4.243-4.243L36.757,41,25.879,30.121a3,3,0,1,1,4.243-4.243L41,36.757,51.879,25.879a3,3,0,1,1,4.243,4.243L45.243,41,56.121,51.879a3,3,0,0,1-4.243,4.243Z"></path>
                </svg>
              </i>
            </div>
          </div>
        );
      } else {
        if (slots.close) {
          return slots.close();
        }
      }
    };

    return () => {
      const { width, title, theme, message, className, customClose1, showClose } = props;
      return (
        <Popup
          ref={root}
          role="dialog"
          class={[bem([theme]), className]}
          style={{ width: addUnit(width) }}
          tabindex={0}
          aria-labelledby={title || message}
          onKeydown={onKeydown}
          onUpdate:show={updateShow}
          {...pick(props, popupInheritKeys)}
        >
          {(customClose1 || slots.close) ? (
            <>
              <div class={bem('main')}>
                {renderTitle()}
                {renderContent()}
              </div>
              {showClose && renderCustomCloseBox()}
            </>
          ) : (
            <>
              {renderTitle()}
              {renderContent()}
              {showClose &&  renderFooter()}
            </>
          )}
        </Popup>
      );
    };
  },
});
