import {
  defineComponent,
  type ExtractPropTypes,
  ref,
  computed,
  inject,
  type Ref,
  h as v,
} from 'vue';
import {
  createNamespace,
  addUnit,
  getTextWidthScore,
} from '../utils';

const [name, bem] = createNamespace('select-input');

export const selectInputProps = {
  placeholder: String,
  inputClass: String,
  value: [Number, String],
  disabled: Boolean,
  allowClear: Boolean,
  showSearch: Boolean,
  mode: {
    type: String,
    default: 'single',
  },
  fillMode: {
    type: String,
    default: 'lead',
  },
};

export type SelectInputProps = ExtractPropTypes<typeof selectInputProps>;

export default defineComponent({
  name,
  props: selectInputProps,
  emits: ['focus', 'blur', 'input', 'update:value', 'enterEvent', 'click'],
  setup(props, { emit, slots }) {
    const o = ref(),
      a = inject<Ref<any>>(Symbol('show-star-sign')),
      r = ref(!1),
      s = (m: any) => {
        const p = m.target.value;
        ((c.value = p), emit('input', p));
      },
      i = () => {
        ((r.value = !1), emit('blur', r.value));
      },
      l = () => {
        ((r.value = !0), emit('focus', r.value));
      },
      c = computed({
        get() {
          return props.value;
        },
        set(m) {
          emit('update:value', m);
        },
      }),
      u = () => {
        var m;
        return slots.prefix
          ? v(
              'span',
              {
                class: bem('prefix'),
              },
              [(m = slots.prefix) == null ? void 0 : m.call(slots)],
            )
          : null;
      },
      d = () => {
        var m;
        return slots.suffix
          ? v(
              'span',
              {
                class: bem('suffix'),
              },
              [(m = slots.suffix) == null ? void 0 : m.call(slots)],
            )
          : null;
      },
      f = computed(() => ({
        width: addUnit(getTextWidthScore(c.value) * 0.2 + 0.4 + 'rem'),
        color: `var(--skin__${props.fillMode || 'lead'}, var(--skin__lead))`,
      })),
      h = (m: any) => {
        var p;
        if (
          (m.target !== o.value && m.preventDefault(),
          ['Enter'].includes(m.key))
        ) {
          const _ = m.target.value;
          ((p = o.value) == null || p.blur(), emit('enterEvent', _));
        }
      },
      g = (m: any) => {
        emit('click', m);
      };
    return () => (
      <div
        class={bem('', {
          hasPrefix: !!slots.prefix,
          hasSuffix: !!slots.suffix,
          isReadOnly: props.disabled,
        })}
      >
        {slots.prefix ? (
          <span class={bem('prefix')}>{slots.prefix?.()}</span>
        ) : null}
        {a?.value && <span class={bem('star-sign')}>*</span>}
        <input
          type={'search'}
          style={f.value}
          ref={o}
          spellcheck={'false'}
          size={1}
          placeholder={props.placeholder}
          value={c.value}
          onInput={s}
          disabled={props.disabled}
          onBlur={i}
          onFocus={l}
          onKeydown={h}
          onClick={g}
          readonly={!props.showSearch}
          class={[
            bem('input', {
              hiddenCursor: !props.showSearch,
            }),
            props.inputClass,
          ]}
        />
        {slots.suffix ? (
          <span class={bem('suffix')}>{slots.suffix?.()}</span>
        ) : null}
      </div>
    );
  },
});
