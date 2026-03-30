import {
  inject,
  computed,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';
import {
  addUnit,
  numericProp,
  makeStringProp,
  createNamespace,
} from '../utils';
import { Badge, type BadgeProps } from '../badge';
import { CONFIG_PROVIDER_KEY } from '../config-provider/ConfigProvider';

const [name, bem] = createNamespace('icon');

const isImage = (name?: string) => name?.includes('/');

const isSvg = (name?: string) => name?.startsWith('<svg');

export const iconProps = {
  dot: Boolean,
  tag: makeStringProp<keyof HTMLElementTagNameMap>('i'),
  name: String,
  size: numericProp,
  badge: numericProp,
  color: String,
  badgeProps: Object as PropType<Partial<BadgeProps>>,
  classPrefix: String,
};

export type IconProps = ExtractPropTypes<typeof iconProps>;

export default defineComponent({
  name,

  props: iconProps,

  setup(props, { slots }) {
    const config = inject(CONFIG_PROVIDER_KEY, null);

    const classPrefix = computed(
      () => props.classPrefix || config?.iconPrefix || bem(),
    );

    return () => {
      const { tag, dot, name, size, badge, color } = props;
      const isSvgIcon = isSvg(name);
      const isImageIcon = isImage(name);

      return (
        <Badge
          dot={dot}
          tag={tag}
          class={[
            classPrefix.value,
            isImageIcon || isSvgIcon ? '' : `${classPrefix.value}-${name}`,
            isSvgIcon ? bem('svg') : ''
          ]}
          style={{
            color,
            fontSize: addUnit(size),
          }}
          content={badge}
          {...props.badgeProps}
          html={isSvgIcon ? name : undefined}
        >
          {slots.default?.()}
          {(!isSvgIcon && isImageIcon) && <img class={bem('image')} src={name} />}
        </Badge>
      );
    };
  },
});
