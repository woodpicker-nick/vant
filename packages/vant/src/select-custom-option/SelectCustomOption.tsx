import { defineComponent, type ExtractPropTypes } from 'vue';
import { createNamespace } from '../utils';

const [name, bem] = createNamespace('select-custom-option');

export const selectCustomOptionProps = {
  title: {
    type: String,
  },
  value: {
    type: Object,
  },
  options: {
    type: Array,
  },
};

export type SelectCustomOptionProps = ExtractPropTypes<
  typeof selectCustomOptionProps
>;

export default defineComponent({
  name,
  props: selectCustomOptionProps,
  emits: ['change', 'update:value'],
  setup(props, { emit, slots }) {
    const changeData = (o: any) => {
      emit('update:value', o.id);
      emit('change', o);
    };

    return () => (
      <div class={bem()}>
        {props.title && <span class={bem('default-info')}>{props.title}</span>}
        {props.options?.map((item: any, s) => (
          <div
            onClick={() => {
              changeData(item);
            }}
            key={item.id + s}
            class={[bem('nameItem'), item.id === props.value ? "_active" : null]}
          >
            {slots.icon?.(item)}
            <span class={"_item-content"}>
              {slots.content?.(item)}
            </span>
          </div>
        ))}
      </div>
    );
  },
});
