import {
  defineComponent,
  type ExtractPropTypes,
  ref
} from 'vue';
import { createNamespace } from '../utils';
import { useParent } from "@vant/use";
import Icon from "../icon";
import { SELECT_KEY } from "../select/Select";

const [name, bem] = createNamespace('select-options');

export const selectOptionsProps = {
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
  option: {
    type: Object,
  },
  value: [Number, String, Boolean],
  label: String,
  icon: String,
  disabled: Boolean,
  data: Object as Record<string, any>,
  mode: {
    type: String,
    default: 'single',
  },
};

export type SelectOptionsProps = ExtractPropTypes<typeof selectOptionsProps>;

export default defineComponent({
  name,
  props: selectOptionsProps,
  emits: ["optionClick"],
  setup(props, { slots }) {
    const {parent: n, index: o} = useParent(SELECT_KEY)
      , a = ref(!1);
    if (!n) {
      console.error("<Option> must be a child component of <Select>.");
      return
    }
    const r = ref();
    // Kn({
    //   optionRef: r
    // });
    const s = (u: any) => {
        props.disabled || n.handleClick(u, {
          value: props.value,
          label: props.label,
          icon: props.icon,
          disabled: props.disabled,
          data: props.data
        })
      }
      , c = (u: any) => {
        a.value && (setTimeout( () => s(u)),
          a.value = !1),
          u.preventDefault();
      }
    ;
    return () => <div
      ref={r}
      onTouchstart={() => a.value = true }
      onTouchmove={() => a.value = false }
      onTouchend={c}
      class={[bem("option", {
        active: n.selectedIndex.value === o.value
      }), n.selectedIndex.value === o.value ? n.optionActiveClass : ""]}
    >
      { slots.icon?.() }
      { props.icon && <Icon name={props.icon} class={bem("icon")}></Icon>}
      <span class={bem("option-content")}>
        { slots.default?.() }
      </span>
      { slots.rightIcon?.()}
    </div>;
  },
});
