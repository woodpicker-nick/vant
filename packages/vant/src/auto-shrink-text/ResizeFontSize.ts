import { browerUtil } from "../utils/brower";

class ResizeFontSize {
  private static instance: ResizeFontSize;
  private lang: string = "";

  constructor() {

  }

  static getInstance() {
    return (this.instance || (this.instance = new ResizeFontSize()), this.instance);
  }

  run(e: any) {
    const { colorVarKey: t } = e,
      i = this.getOriginFontsize(e),
      n = this.getMinFontSizePx(e, i),
      o = this.getBoxLimitHeight(e, i),
      a = this.narrowFontSize(e, o, i, n);
    return (t && document.body.style.setProperty(t, `${a}px`), a);
  }

  getOriginFontsize(e: { colorVarKey: any; outBox?: any }) {
    const { colorVarKey: t, outBox: i } = e;
    const n = window.getComputedStyle(i).fontSize.replace("px", "");
    let o = Number(n);
    if (t) {
      const e = Number(document.body.style.getPropertyValue(t)?.replace("px", ""));
      e && e < o && (o = e);
    }
    return o;
  }

  getBoxLimitHeight(e: { colorVarKey?: any; limitHeight?: any; rowCount?: any }, t: number) {
    const { limitHeight: i, rowCount: n } = e;
    const langFactors: { [key: string]: number } = {
      my_MM: 1.5,
      ta_LK: 1.5,
      vi_VN: 1.4,
    };
    const o = langFactors[this.lang] || 1.2;
    return i || t * n * o + 1;
  }

  getMinFontSizePx(e: { colorVarKey?: any; minFontSize?: any }, t: number) {
    const { minFontSize: i } = e;
    return i ? (i <= 1 ? t * i : i) : browerUtil.isMobile ? 8 : 12;
  }

  narrowFontSize(
    e: {
      colorVarKey?: any;
      contentBox?: any;
      outBox?: any;
    },
    t: number,
    i: any,
    n: number
  ) {
    let o: any, a: any, r: number, s: () => any;
    ({ contentBox: o, outBox: a } = e);
    r = a.clientWidth;
    s = () => {
      if (o.scrollWidth <= r && o.scrollHeight <= t) return i;
      const e = i > 12 ? 1 : 0.5;
      return i - e < n ? n : ((i -= e), (o.style.fontSize = i + "px"), s());
    };
    o.style.fontSize = i + "px";
    const l = s();
    return ((o.style.fontSize = ""), l);
  }
}

export const c = new ResizeFontSize(),
  u = c.run.bind(c);
export default {
  run: u,
};
