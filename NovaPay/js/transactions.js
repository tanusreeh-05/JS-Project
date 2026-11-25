window.NP = window.NP || {};

NP.Transactions = (function () {
  const U = NP.Utils,
    W = NP.Wallet,
    f = { q: '', type: 'all', cat: 'all' };

  function row(t, del, showCat) {
    const ci = U.catInfo(t),
      inc = t.type === 'income';

    return `<div class="tx">
            <div class="ti" style="background:${ci.c}22;color:${ci.c}">
                ${U.icon(ci.i)}
            </div>
            <div class="tt">
                <b>${U.esc(t.title)}</b>
                <small>${showCat ? t.category + ' · ' : ''}${U.when(t.date)}</small>
            </div>
            <span class="amt ${inc ? 'up' : 'down'}">
                ${inc ? '+' : '-'} ${U.money(t.amount)}
            </span>
            ${del ? `<button class="del" data-del="${t.id}" aria-label="Delete transaction">${U.icon('trash')}</button>` : ''}
        </div>`;
  }

  const recent = n =>
    W.all().slice(0, n).map(t => row(t)).join('') ||
    '<div class="empty">No transactions yet. Add income to get started.</div>';

  function filtered() {
    const q = f.q.trim().toLowerCase();

    return W.all().filter(t =>
      (f.type === 'all' || t.type === f.type) &&
      (f.cat === 'all' || t.category === f.cat) &&
      (!q || (t.title + ' ' + t.category).toLowerCase().includes(q))
    );
  }

  function refresh() {
    const box = U.$('#txList');

    if (!box) return;

    const l = filtered();

    box.innerHTML = l.map(t => row(t, true, true)).join('') ||
      '<div class="empty">No transactions match your search or filters.</div>';

    U.$('#txCount').textContent =
      l.length + ' transaction' + (l.length === 1 ? '' : 's');
  }

  function page(el) {
    const cats = [...new Set(W.all().map(t => t.category))].sort();

    el.innerHTML = `<div class="page-head">
            <h1>Transactions</h1>
            <span id="txCount" class="chip"></span>
        </div>
        <div class="card">
            <div class="filters">
                <select id="fType" aria-label="Type">
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expenses</option>
                </select>
                <select id="fCat" aria-label="Category">
                    <option value="all">All categories</option>
                    ${cats.map(c => `<option>${c}</option>`).join('')}
                </select>
                ${f.q ? `<span class="chip">Search: ${U.esc(f.q)}</span>` : ''}
            </div>
            <div id="txList"></div>
        </div>`;

    const t = U.$('#fType'),
      c = U.$('#fCat');

    t.value = f.type;
    c.value = f.cat;

    t.onchange = () => {
      f.type = t.value;
      refresh();
    };

    c.onchange = () => {
      f.cat = c.value;
      refresh();
    };

    refresh();
  }

  return {
    f,
    row,
    recent,
    page,
    refresh
  };
})();