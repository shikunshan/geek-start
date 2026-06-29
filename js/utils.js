const Utils = {
  escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  },

  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString('zh-CN');
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  debounce(fn, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  padLeft(str, len, char = ' ') {
    return String(str).padStart(len, char);
  },

  padRight(str, len, char = ' ') {
    return String(str).padEnd(len, char);
  },

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = '';

    if (ua.indexOf('Edg/') > -1) {
      browser = 'Edge';
      version = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
    } else if (ua.indexOf('Chrome/') > -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
    } else if (ua.indexOf('Firefox/') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
    } else if (ua.indexOf('Safari/') > -1) {
      browser = 'Safari';
      version = ua.match(/Version\/([\d.]+)/)?.[1] || '';
    }

    return { name: browser, version };
  },

  getOSInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown';

    if (ua.indexOf('Windows NT 10.0') > -1) {
      os = 'Windows 10/11';
    } else if (ua.indexOf('Windows') > -1) {
      os = 'Windows';
    } else if (ua.indexOf('Mac OS X') > -1) {
      os = 'macOS';
    } else if (ua.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
      os = 'Android';
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      os = 'iOS';
    }

    return os;
  },

  getResolution() {
    return `${window.screen.width}x${window.screen.height}`;
  }
};
