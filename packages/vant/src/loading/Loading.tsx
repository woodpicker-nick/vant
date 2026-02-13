import { computed, defineComponent, type ExtractPropTypes } from 'vue';
import {
  extend,
  addUnit,
  numericProp,
  getSizeStyle,
  makeStringProp,
  createNamespace,
} from '../utils';

const [name, bem] = createNamespace('loading');

export type LoadingType = 'circular' | 'spinner';

export const loadingProps = {
  size: numericProp,
  type: makeStringProp<LoadingType>('circular'),
  color: String,
  vertical: Boolean,
  textSize: numericProp,
  textColor: String,
};

export type LoadingProps = ExtractPropTypes<typeof loadingProps>;

export default defineComponent({
  name,
  props: loadingProps,
  setup(props, { slots }) {
    const spinnerStyle = computed(() =>
      extend({ color: props.color }, getSizeStyle(props.size)),
    );

    const getIcon = () => {
      return props.type === 'spinner' ? (
        Array(12)
          .fill(null)
          .map((_, index) => <i class={bem('line', String(index + 1))} />)
      ) : (
        <svg class={bem('circular')} viewBox="25 25 50 50">
          <circle cx="50" cy="50" r="20" fill="none" />
        </svg>
      );
    };

    return () => {
      const { type, vertical } = props;
      return (
        <div class={bem([type, { vertical }])}>
          <span class={bem('spinner', props.type)} style={spinnerStyle.value}>
            {slots.icon ? slots.icon() : getIcon()}
          </span>
          {slots.default ? (
            <span
              class={bem('text')}
              style={{
                fontSize: addUnit(props.textSize),
                color: props.textColor ?? props.color,
              }}
            >
              {slots.default()}
            </span>
          ) : null}
        </div>
      );
    };
  },
});
