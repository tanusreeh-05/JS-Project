window.NP = window.NP || {};

NP.Utils = (function () {
  const CATS = {
    expense: {
      Food: { c: '#6366f1', i: 'cart' },
      Travel: { c: '#f87171', i: 'send' },
      Shopping: { c: '#fb923c', i: 'bag' },
      Bills: { c: '#34d399', i: 'list' },
      Entertainment: { c: '#a78bfa', i: 'gift' },
      Transfer: { c: '#38bdf8', i: 'send' },
      Others: { c: '#fbbf24', i: 'grid' }
    },
    income: {
      Salary: { c: '#10b981', i: 'arrow-down' },
      Freelance: { c: '#10b981', i: 'arrow-down' },
      Gift: { c: '#10b981', i: 'gift' },
      Other: { c: '#10b981', i: 'plus-circle' }
    }
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const icon = n => `<svg class="ic"><use href="#${n}"/></svg>`;

  const money = n => '₹' + Number(n).toLocaleString('en-IN',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 
      
    });

  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const esc = s =>
    String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const catInfo = t =>
    (CATS[t.type] && CATS[t.type][t.category]) ||
    { c: '#6366f1', i: 'wallet' };

  function when(iso) {
    const d = new Date(iso),
      t = new Date(),
      day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate());

    const diff = Math.round((day(t) - day(d)) / 864e5);

    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    if (diff === 0) return 'Today, ' + time;
    if (diff === 1) return 'Yesterday, ' + time;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function toast(msg, bad) {
    $$('.toast').forEach(t => t.remove());

    const t = document.createElement('div');

    t.className = 'toast' + (bad ? ' bad' : '');
    t.setAttribute('role', 'status');
    t.textContent = msg;

    document.body.append(t);

    setTimeout(() => t.remove(), 2600);
  }

  return {
    CATS,
    $,
    $$,
    icon,
    money,
    uid,
    esc,
    catInfo,
    when,
    toast
  };
})();