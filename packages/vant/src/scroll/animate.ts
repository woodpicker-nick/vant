const Eo =
  typeof window < 'u' &&
  window &&
  typeof window.requestAnimationFrame == 'function' &&
  typeof window.cancelAnimationFrame == 'function';

function M4(e=60) {
  if (Eo) {
    let t = 0;
    const r = 1e3 / e;
    return (n: any) => {
      const i = (o: any) => {
          o >= t + r ? (t = o,
            n(o)) : window.requestAnimationFrame(i)
        }
      ;
      return window.requestAnimationFrame(i)
    }
  } else
    return (t: any) => setTimeout(t, 1e3 / e)
}

const U4 = {
  quadratic: {
    fn: (e: number) => e * (2 - e),
  },
  circular: {
    fn: (e: number) => Math.sqrt(1 - --e * e),
  },
  back: {
    fn: (e: number) => ((e -= 1), e * e * (5 * e + 4) + 1),
  },
  bounce: {
    fn: (e: number) =>
      e < 1 / 2.75
        ? 7.5625 * e * e
        : e < 2 / 2.75
          ? ((e -= 1.5 / 2.75), 7.5625 * e * e + 0.75)
          : e < 2.5 / 2.75
            ? ((e -= 2.25 / 2.75), 7.5625 * e * e + 0.9375)
            : ((e -= 2.625 / 2.75), 7.5625 * e * e + 0.984375),
  },
  elastic: {
    fn: (e: number) =>
      e === 0
        ? 0
        : e === 1
          ? 1
          : 0.4 *
              2 ** (-10 * e) *
              Math.sin(((e - 0.22 / 4) * (2 * Math.PI)) / 0.22) +
            1,
  },
  none: {
    fn: (e: any) => e,
  },
};

export class Animate {
  private raf;
  private isAnimating;
  private target;

  constructor(t: any, r: any = {}) {
    this.isAnimating = false;
    this.raf = r.raf || window.requestAnimationFrame;
    this.target = t;
  }

  getNow() {
    return +new Date();
  }

  setTarget(t: any, r: any, { onComplete: n, onUpdate: i }: any = {}) {
    for (const d in this.target)
      Object.prototype.hasOwnProperty.call(this.target, d) &&
        (this.target[d] = t(d));
    const o = {
      target: this.target,
      progress: r,
    };
    r === 1 ? (i(o), n == null || n(o)) : i(o);
  }

  to(
    t: any,
    {
      duration: r,
      ease: n = 'none',
      onComplete: i,
      onUpdate: o,
      onEndNextRaf: d,
    }: any = {},
  ) {
    if (this.isAnimating) return this;
    const s = this.raf,
      c = this.getNow(),
      a = c + r,
      f = JSON.parse(JSON.stringify(this.target)),
      E = () => {
        const v = this.getNow();
        if (v < a) {
          const y = (v - c) / r,
            h = U4[n as keyof typeof U4].fn(y);
          (this.setTarget((x: any) => (t[x] - f[x]) * h + f[x], h, {
            onUpdate: o,
            onComplete: i,
          }),
            this.isAnimating && s(E));
        } else
          ((this.isAnimating = !1),
            this.setTarget((y: any) => t[y], 1, {
              onUpdate: o,
              onComplete: i,
            }),
            d &&
              s(() => {
                d();
              }));
      };
    return ((this.isAnimating = !0), E(), this);
  }

  kill() {
    return ((this.isAnimating = !1), this);
  }
}
