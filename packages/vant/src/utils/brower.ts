class BrowerUtil {
  protected userAgent;

  constructor() {
    this.userAgent = navigator.userAgent.toLowerCase();
  }

  includes(e: any, t: string) {
    return e.indexOf(t) !== -1;
  }

  find(e: string) {
    return this.includes(this.userAgent, e);
  }

  get isMacos() {
    return this.find('mac os');
  }

  get isWindows() {
    return this.find('windows');
  }

  get isFindMobile() {
    return this.find('mobile');
  }

  get isFindTablet() {
    return this.find('tablet');
  }

  get isFindDesktop() {
    return this.find('desktop');
  }

  get isFacebook() {
    return this.find('fban') || this.find('fbav');
  }

  get isTikTok() {
    return this.find('tiktok');
  }

  get isInstagram() {
    return this.find('instagram');
  }

  get isKwai() {
    return this.find('kwai');
  }

  get isIos() {
    return this.isIphone || this.isIpod || this.isIpad;
  }

  get isIphone() {
    return !this.isWindows && this.find('iphone');
  }

  get isIpod() {
    return this.find('ipod');
  }

  get isIpad() {
    const e = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1,
      t =
        /macintosh|mac os x/i.test(navigator.userAgent) &&
        window.screen.height > window.screen.width &&
        !navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/);
    return navigator.userAgent.includes('ipad') || e || t;
  }

  get isHarmonyOS() {
    return this.find('harmonyos');
  }

  get isHuawei() {
    return this.find('huawei');
  }

  get isSamsung() {
    return this.find('samsung');
  }

  get isEdge() {
    return (
      this.find('edga') ||
      this.find('edgios') ||
      this.find('edgA') ||
      this.find('edg')
    );
  }

  get isFireFox() {
    return this.find('firefox');
  }

  get isDuckDuckGo() {
    return this.find('duckduckgo');
  }

  get isHibrowser() {
    return this.find('hibrowser');
  }


  get isAndroid() {
    return !this.isWindows && this.find('android');
  }

  get isAndroidPhone() {
    return this.isAndroid && this.isFindMobile;
  }

  get isAndroidTablet() {
    return this.isAndroid && !this.isFindMobile;
  }

  get isBlackberry() {
    return (
      this.userAgent.includes('blackberry') || this.userAgent.includes('bb10')
    );
  }

  get isBlackberryPhone() {
    return this.isBlackberry && !this.isFindTablet;
  }

  get isBlackberryTablet() {
    return this.isBlackberry && this.isFindTablet;
  }

  get isWindowsPhone() {
    return this.isWindows && this.find('phone');
  }

  get isWindowsTablet() {
    return this.isWindows && this.find('touch') && !this.isWindowsPhone;
  }

  get isFxos() {
    return (this.isFindMobile || this.isFindTablet) && this.find(' rv:');
  }

  get isFxosPhone() {
    return this.isFindMobile && this.find(' rv:');
  }

  get isFxosTablet() {
    return this.isFindTablet && this.find(' rv:');
  }

  get isMeego() {
    return this.find('meego');
  }

  get isMobile() {
    return (
      this.isAndroidPhone ||
      this.isIphone ||
      this.isIpod ||
      this.isWindowsPhone ||
      this.isBlackberryPhone ||
      this.isFxosPhone ||
      this.isMeego
    );
  }

  get isTablet() {
    return (
      this.isIpad ||
      this.isAndroidTablet ||
      this.isBlackberryTablet ||
      this.isWindowsTablet ||
      this.isFxosTablet
    );
  }

  get isDesktop() {
    return !this.isMobile && !this.isTablet;
  }
};


export const browerUtil = new BrowerUtil();