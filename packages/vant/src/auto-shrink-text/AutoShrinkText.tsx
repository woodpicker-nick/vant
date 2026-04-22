import { defineComponent, onMounted, computed, ref, reactive, watch, type PropType, type ExtractPropTypes } from "vue";

import { u } from "./ResizeFontSize";
import { createNamespace } from "../utils";

/**
 * text: i.gameCategoryName,
 * rowCount: 2,
 * minFontSize: "75%",
 * limitHeight: this.limitHeight
 */

const [name, bem] = createNamespace('auto-shrink-text');

export const autoShrinkTextProps = {
  text: {
    type: String,
    require: true,
  },
  lang: {
    type: String,
  },
  groupKey: {},
  fontSize: {
    type: String,
  },
  minFontSize: {
    type: String,
  },
  limitHeight: {
    type: String,
  },
  rowCount: {
    type: Number,
    default: 2,
  },
  width: {
    type: String,
    default: "100%",
  },
  maxWidth: {
    type: String,
    default: "auto",
  },
};

export type AutoShrinkTextProps = ExtractPropTypes<typeof autoShrinkTextProps>;

export default defineComponent({
  name,
  props: autoShrinkTextProps,
  setup(props) {
    const { width, text, minFontSize, limitHeight, rowCount, groupKey, fontSize, maxWidth } = props;
    const state = reactive({
      oriFontSize: 0,
      finalFontSize: 0,
    });
    const largeHeight = ref();
    const innerTextRef = ref<HTMLElement>();
    const autoShrinkTextRef = ref<HTMLElement>();
    const timerId = ref();
    const mainStore = computed(() => {
      return {
        language: null,
      };
    });
    const colorVarKey = computed(() => {
      if (groupKey) return `--auto-shrink-text-group-${groupKey}`;
      return "";
    });
    const showFontSize = computed(() => {
      if (colorVarKey.value) return `var(${colorVarKey.value})`;
      const e = state.finalFontSize;
      return e ? e + "px" : fontSize;
    });
    const bottomExhibiteSize = computed(() => {
      const e = state.finalFontSize;
      return !!props.lang && ["my_MM", "ta_LK", "vi_VN"].includes(props.lang) ? "0px" : e ? e / 8.5 + "px" : "3px";
    });
    const limitHeightNumber = computed(() => {
      return largeHeight.value > 0
        ? largeHeight.value
        : limitHeight
        ? unitPxRem2Number(limitHeight)
        : 0;
    });
    const localMinFontSize = computed(() => {
      if (minFontSize)
        return /^\d+(\.\d+)?%$/.test(minFontSize)
          ? Number(minFontSize.replace("%", "")) / 100
          : unitPxRem2Number(minFontSize);
    });
    const clearGlobalFontSize = () => {
      groupKey &&
        (document.body.style.removeProperty(colorVarKey.value),
        (timerId.value = setTimeout(() => {
          correctFontSize();
        }, 500)));
    };
    const watchText = () => {
      clearTimeout(timerId.value),
        setTimeout(() => {
          correctFontSize();
        }, 0);
    };
    const unitPxRem2Number = (e: string | number) => {
      e = String(e);
      let t = 0;
      return (
        /^\d+(\.\d+)?px$/.test(e)
          ? (t = parseInt(e))
          : /^\d+(\.\d+)?rem$/.test(e)
          ? (t =
              parseFloat(e) * //mainStore.rootFontSize ||
              parseFloat(
                window.getComputedStyle(document.documentElement).getPropertyValue("font-size")
              ))
          : /^\d+(\.\d+)?$/.test(e) && (t = Number(e)),
        t
      );
    };
    const correctFontSize = () => {
      let e;
      state.finalFontSize = 0;
      let t = 2;
      const i = () => {
        try {
          const t = innerTextRef.value?.clientWidth,
            i = innerTextRef.value?.clientHeight;
          if (0 === t && 0 === i)
            throw new Error(
              "WG notes: dom's width and height size are 0. dom exist, but it may be render problem!"
            );
          (e = u({
            contentBox: innerTextRef.value,
            outBox: autoShrinkTextRef.value,
            minFontSize: localMinFontSize.value,
            rowCount: rowCount,
            limitHeight: limitHeightNumber.value,
            colorVarKey: colorVarKey.value,
          })),
            (state.finalFontSize = e);
        } catch (n) {
          t--,
            t > 0 &&
              setTimeout(() => {
                i();
              }, 0);
        }
      };
      i();
    };

    watch(
      () => text,
      () => watchText(),
      { immediate: true }
    );

    onMounted(() => {
      correctFontSize();
    });

    return () => (
      <span
        class={bem()}
        style={{
          width: width,
          maxWidth: maxWidth,
          marginBottom: `-${bottomExhibiteSize.value}`,
          paddingBottom: bottomExhibiteSize.value,
          fontSize: fontSize,
        }}
        ref={autoShrinkTextRef}
      >
        <span
          style={{
            fontSize: showFontSize.value,
          }}
        >
          <span
            class={bem('text')}
            ref={innerTextRef}
            style={{
              "-webkit-line-clamp": rowCount,
            }}
          >
            {text}
          </span>
        </span>
      </span>
    );
  },
});
