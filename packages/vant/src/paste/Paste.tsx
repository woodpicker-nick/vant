import { defineComponent, type ExtractPropTypes, type PropType } from 'vue';
import { createNamespace } from '../utils';

const [name, bem] = createNamespace('paste');

export const pasteProps = {
  tag: {
    type: String as PropType<keyof HTMLElementTagNameMap>,
    default: 'div',
  },
  text: {
    type: String,
  },
};

export type PasteProps = ExtractPropTypes<typeof pasteProps>;

export default defineComponent({
  name,
  props: pasteProps,
  emits: ['paste'],
  setup(props, { attrs, emit, slots }) {
    const copy = async () => {
      try {
        if (
          navigator != null &&
          navigator.clipboard &&
          navigator.permissions
        ) {
          const d = await navigator.clipboard?.readText?.();
          emit('paste', d);
        } else byApp();
      } catch (d) {
        (console.error('MODERN PASTE ERROR', d), byApp());
      }
    };
    const byApp = () => {
      // ns('READ_CLIPBOARD_TEXT')
      //   .send()
      //   .then((l: any) => {
      //     var u, d;
      //     (u = l.payload) != null &&
      //       u.value &&
      //       emit('paste', (d = l.payload) == null ? void 0 : d.value);
      //   })
      //   .catch((l: any) => {
      //     console.error('FALLBACK PASTE ERROR', l);
      //   });
    };
    return () => <props.tag
      class={bem("text")}
      onClick={copy}
      {...attrs }>
      {() => [slots.default ? slots.default() : props.text]}
    </props.tag>
  },
});
