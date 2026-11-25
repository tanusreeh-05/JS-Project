window.NP = window.NP || {};

NP.Wallet = (function () {
  let state;

  const sum = (l, t) =>
    l.filter(x => x.type === t).reduce((s, x) => s + x.amount, 0);

  function init() {
    state = NP.Storage.load();

    if (!state) {
      state = NP.Demo.get();
      NP.Storage.save(state);
    }

    return state;
  }

  const user = () => state.user;

  const all = () =>
    state.transactions.slice().sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

  const balance = () =>
    sum(state.transactions, 'income') -
    sum(state.transactions, 'expense');

  function inMonth(offset) {
    const n = new Date(),
      m = new Date(n.getFullYear(), n.getMonth() - offset, 1);

    return state.transactions.filter(t => {
      const d = new Date(t.date);

      return d.getFullYear() === m.getFullYear() &&
        d.getMonth() === m.getMonth();
    });
  }

  function add(type, d) {
    const amount = Math.round(parseFloat(d.amount) * 100) / 100;

    if (!(amount > 0)) {
      throw new Error('Enter an amount greater than 0.');
    }

    if (type === 'expense' && amount > balance()) {
      throw new Error(
        'Not enough balance. Available: ' +
        NP.Utils.money(balance())
      );
    }

    const t = {
      id: NP.Utils.uid(),
      type,
      title: (d.title || '').trim() || d.category,
      category: d.category,
      amount,
      date: new Date().toISOString()
    };

    state.transactions.push(t);
    NP.Storage.save(state);

    return t;
  }

  const addIncome = d => add('income', d);
  const addExpense = d => add('expense', d);

  function sendMoney(d) {
    const to = (d.to || '').trim();

    if (!to) {
      throw new Error('Enter who you want to send money to.');
    }

    return add('expense', {
      title: 'Sent to ' + to,
      category: 'Transfer',
      amount: d.amount
    });
  }

  function remove(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    NP.Storage.save(state);
  }

  function setName(n) {
    if (!n.trim()) {
      throw new Error('Name cannot be empty.');
    }

    state.user.name = n.trim();
    NP.Storage.save(state);
  }

  function setPhoto(data) { 
    state.user.photo = data; 
    NP.Storage.save(state) 
  }

  function reset(blank) {
    state = NP.Storage.reset(blank);
  }

  function byCategory(list) {
    const m = {};

    list.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] || 0) + t.amount;
    });

    return m;
  }

  function monthly(n) {
    const out = [],
      now = new Date();

    for (let i = n - 1; i >= 0; i--) {
      const s = new Date(now.getFullYear(), now.getMonth() - i, 1),
        e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      let income = 0,
        expense = 0,
        bal = 0;

      state.transactions.forEach(t => {
        const d = new Date(t.date);

        if (d < e) {
          bal += t.type === 'income' ? t.amount : -t.amount;

          if (d >= s) {
            t.type === 'income'
              ? income += t.amount
              : expense += t.amount;
          }
        }
      });

      out.push({
        label: s.toLocaleString('en-US', { month: 'short' }),
        income,
        expense,
        balance: bal
      });
    }

    return out;
  }

  return {
    init,
    user,
    all,
    balance,
    inMonth,
    addIncome,
    addExpense,
    sendMoney,
    remove,
    setName,
    setPhoto,
    reset,
    byCategory,
    monthly,
    sum
  };
})();