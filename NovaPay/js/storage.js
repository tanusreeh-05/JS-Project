window.NP = window.NP || {};

NP.Storage = (function () {
  const KEY = 'novapay_v2';

  return {
    load() {
      try {
        const r = localStorage.getItem(KEY);
        return r ? JSON.parse(r) : null;
      } catch (e) {
        return null;
      }
    },

    save(state) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    },

    reset(blank) {
      const s = NP.Demo.get();

      if (blank) {
        s.transactions = [];
      }

      this.save(s);
      return s;
    }
  };
})();