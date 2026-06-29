const Storage = {
  PREFIX: 'geekstart_',

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      return false;
    }
  }
};
