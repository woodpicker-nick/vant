import {
  watch,
  defineComponent,
  type PropType,
  type InjectionKey,
  type ExtractPropTypes, computed,
} from "vue";
import { unknownProp, numericProp, createNamespace, FORM_KEY } from "../utils";
import { useChildren, useCustomFieldValue, useParent } from "@vant/use";

import type { RadioShape } from '../radio';
import type { CheckerDirection } from '../checkbox/Checker';

const [name, bem] = createNamespace('radio-group');

export type RadioGroupDirection = CheckerDirection;

export const radioGroupProps = {
  shape: String as PropType<RadioShape>,
  disabled: Boolean,
  iconSize: numericProp,
  direction: String as PropType<RadioGroupDirection>,
  modelValue: unknownProp,
  checkedColor: String
};

export type RadioGroupProps = ExtractPropTypes<typeof radioGroupProps>;

export type RadioGroupProvide = {
  props: RadioGroupProps;
  updateValue: (value: unknown) => void;
};

export const RADIO_KEY: InjectionKey<RadioGroupProvide> = Symbol(name);

export default defineComponent({
  name,

  props: radioGroupProps,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const { parent } = useParent<any>(FORM_KEY);
    const { linkChildren } = useChildren(RADIO_KEY);

    const updateValue = (value: unknown) => {
      emit('update:modelValue', value);
      parent?.onChildChange?.(value);
    }

    watch(
      () => props.modelValue,
      (value) => emit('change', value),
    );

    linkChildren({
      props,
      updateValue,
    });

    useCustomFieldValue(() => props.modelValue);

    return () => (
      <div class={bem([props.direction])} role="radiogroup">
        {slots.default?.()}
      </div>
    );
  },
});
