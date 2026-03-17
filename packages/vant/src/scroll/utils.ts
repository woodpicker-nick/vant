import { Animate } from './animate';

const PF = (): any => {
    const e = 100;
    return e >= 90 && e <= 100
      ? '90-100'
      : e >= 75 && e <= 89
        ? '75-89'
        : e >= 60 && e <= 74
          ? '60-74'
          : e >= 40 && e <= 59
            ? '40-59'
            : '0-39';
  },
  ch = (e: any[] = []) => e.includes(PF()),
  jc = {
    stopScrollAnimation: () => ch(['40-59', '0-39']),
  };

function N$(e: any, t: any, n: any) {
  var h;
  const {
      onComplete: o,
      onEndNextRaf: a,
      nativeCompleteDetect: r = !1,
      nativeCompleteTimeoutBufferMs: s = 150,
    } = n,
    i = jc.stopScrollAnimation()
      ? 0
      : ((h = n.duration) != null ? h : 0.3) * 1e3;
  let l: any,
    c: any,
    u = !1;
  const d = () => {
    if (!u) {
      if (((u = !0), c)) {
        try {
          e.removeEventListener('scroll', c);
        } catch (g) {}
        c = void 0;
      }
      typeof l != 'undefined' && (clearTimeout(l), (l = void 0));
    }
  };
  if (o && r) {
    const m = () => {
      const p = e.scrollLeft,
        _ = e.scrollTop;
      if (Math.abs(p - t.x) <= 1 && Math.abs(_ - t.y) <= 1) {
        d();
        try {
          (o(), a && requestAnimationFrame(a));
        } catch (b) {}
      }
    };
    ((c = () => {
      m();
    }),
      e.addEventListener('scroll', c, {
        passive: !0,
      }),
      (l = window.setTimeout(
        () => {
          d();
          try {
            (o(), a && requestAnimationFrame(a));
          } catch (p) {}
        },
        Math.max(0, i) + s,
      )));
  } else
    o &&
      (l = window.setTimeout(
        () => {
          try {
            (o(), a && requestAnimationFrame(a));
          } catch (g) {}
        },
        Math.max(0, i) + 120,
      ));
  try {
    e.scrollTo({
      left: Math.round(t.x),
      top: Math.round(t.y),
      behavior: 'smooth',
    });
  } catch (g) {}
  return () => {
    d();
    try {
      const g = e.scrollLeft,
        m = e.scrollTop;
      e.scrollTo({
        left: Math.round(g),
        top: Math.round(m),
        behavior: 'auto',
      });
    } catch (g) {}
  };
}

function M$(e: any) {
  try {
    return !e || typeof e.scrollTo != 'function'
      ? !1
      : typeof CSS == 'undefined' || typeof CSS.supports != 'function'
        ? !0
        : CSS.supports('scroll-behavior', 'smooth');
  } catch (t) {
    return !1;
  }
}

function B$(e: any, t: any, n: any, o: any) {
  var s;
  const a = new Animate(t).to(n, {
    duration: jc.stopScrollAnimation()
      ? 0
      : ((s = o.duration) != null ? s : 0.3) * 1e3,
    onUpdate({ target: { x: i, y: l } }: { target: { x: number; y: number } }) {
      var c;
      (typeof l != 'undefined' && e.scrollTop !== l && (e.scrollTop = l),
        typeof i != 'undefined' && e.scrollLeft !== i && (e.scrollLeft = i),
        (c = o.onUpdate) == null || c.call(o));
    },
    onComplete: () => {
      var i;
      try {
        (typeof n.y == 'number' && (e.scrollTop = n.y),
          typeof n.x == 'number' && (e.scrollLeft = n.x));
      } catch (l) {}
      (i = o.onComplete) == null || i.call(o);
    },
    onEndNextRaf: o.onEndNextRaf,
  });
  return () => {
    try {
      a.kill();
    } catch (i) {}
  };
}

export function scroll(e: any, t: any, n: any = {}) {
  var l, c, u;
  if (!e) return () => {};
  const o = e,
    a = {
      x: (l = o.scrollLeft) != null ? l : 0,
      y: (c = o.scrollTop) != null ? c : 0,
    },
    r = {
      x: typeof t.x == 'number' ? t.x : a.x,
      y: typeof t.y == 'number' ? t.y : a.y,
    },
    s = (u = n.useNative) != null ? u : !1,
    i = M$(o);
  if (s && i)
    try {
      return N$(o, r, n);
    } catch (d) {}
  return B$(o, a, r, n);
}
