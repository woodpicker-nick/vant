import {
  defineComponent,
  type ExtractPropTypes,
  ref,
  computed,
  inject,
  type Ref,
  h as v,
} from 'vue';
import { createNamespace, addUnit, getTextWidthScore } from '../utils';

const [name, bem] = createNamespace('select-single');

export const selectSingleProps = {
  placeholder: String,
  labelRender: {
    type: Function,
    default: (e: any) => e.label,
  },
  fillMode: {
    type: String,
    default: 'lead',
  },
  readonly: {
    type: Boolean,
    default: !1,
  },
  useReadonlyStyle: {
    type: Boolean,
    default: !0,
  },
};

export type SelectSingleProps = ExtractPropTypes<typeof selectSingleProps>;

export default defineComponent({
  name,
  props: selectSingleProps,
  setup(props, { emit, slots }) {
    const n = inject<Ref<any>>(Symbol('show-star-sign')),
      r = computed(() => {
        var i;
        return (i = slots.content) == null ? void 0 : i.call(slots)[0].children;
      });
    return () => (
      <div
        class={bem('', {
          hasPrefix: !!slots.prefix,
          hasSuffix: !!slots.suffix,
          isReadOnly: props.readonly && props.useReadonlyStyle,
        })}
      >
        {slots.prefix ? (
          <span class={bem('prefix')}>{slots.prefix?.()}</span>
        ) : null}
        <div
          class={bem('content', {
            'has-content': !!r.value,
          })}
        >
          {n?.value && <span class={bem('star-sign')}>*</span>}
          {r.value
            ? slots.content
              ? slots.content()
              : null
            : props.placeholder}
        </div>
        {slots.suffix ? (
          <span class={bem('suffix')}>{slots.suffix?.()}</span>
        ) : null}
      </div>
    );
  },
});
