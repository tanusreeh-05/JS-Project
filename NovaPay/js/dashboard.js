window.NP = window.NP || {};
NP.Dashboard = (function () {
  const U = NP.Utils;
  const W = NP.Wallet;
  const T = NP.Transactions;
  const C = 2 * Math.PI * 70;

  const k = v => v >= 1000
    ? +(v / 1000).toFixed(1) + 'k'
    : Math.round(v);

  const nice = m => {
    const p = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / p) * p;
  };

  const pct = (a, b) =>
    b ? Math.round((a - b) / b * 100) : 0;

  const colorOf = n =>
    U.CATS.expense[n] ? U.CATS.expense[n].c : '#94a3b8';

  function spark(v, c) {
    const w = 110, h = 50,
      mx = Math.max(...v), mn = Math.min(...v),
      r = (mx - mn) || 1;
    const p = v.map((x, i) => [3 + i * (w - 6) / (v.length - 1 || 1),
    h - 5 - ((x - mn) / r) * (h - 10)]);
    const d = p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true">
            <path d="${d}L${w - 3} ${h}L3 ${h}Z" fill="${c}" opacity=".12"/>
            <path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
            </svg>`;
  }

  function donut(data, label) {
    const t = data.reduce((s, d) => s + d[1], 0);
    let acc = 0;

    const segs = t
      ? data.map(d => {
        const len = d[1] / t * C;

        const s = `
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="${d[2]}"
              stroke-width="26"
              stroke-dasharray="${len} ${C - len}"
              stroke-dashoffset="${-acc}"
            >
              <title>${d[0]}: ${U.money(d[1])}</title>
            </circle>
          `;

        acc += len;
        return s;
      }).join('')
      : `
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke="#e8eaf6"
          stroke-width="26"
        />
      `;

    return `
      <div class="donut">
        <svg viewBox="0 0 180 180">
          ${segs}
        </svg>

        <div class="mid">
          <b>${U.money(t)}</b>
          <small>${label}</small>
        </div>
      </div>
    `;
  }

  const spendData = l =>
    Object.entries(W.byCategory(l))
      .sort((a, b) => b[1] - a[1])
      .map(([n, v]) => [n, v, colorOf(n)]);

  function legend(d) {
    const t = d.reduce((s, x) => s + x[1], 0) || 1;

    return `
      <div class="legend">
        ${d.map(x => `
            <div>
              <i style="background:${x[2]}"></i>
              <span>${x[0]}</span>
              <span>${Math.round(x[1] / t * 100)}%</span>
            </div>
          `).join('') ||
      '<div class="empty">No expenses yet</div>'
      }
      </div>
    `;
  }

  function axes(max, w, h, L, R, T, B) {
    let g = '';

    for (let i = 0; i <= 4; i++) {
      const y = T + (h - T - B) * i / 4;

      g += `
        <line
          x1="${L}"
          x2="${w - R}"
          y1="${y}"
          y2="${y}"
          stroke="#e8eaf6"
        />

        <text
          x="${L - 8}"
          y="${y + 4}"
          text-anchor="end"
        >
          ${k(max * (4 - i) / 4)}
        </text>
      `;
    }

    return g;
  }

  function line(series, labels) {
    const w = 600;
    const h = 210;
    const L = 40;
    const R = 10;
    const T = 12;
    const B = 26;

    const pw = w - L - R;
    const ph = h - T - B;

    const max = nice(Math.max(1, ...series.flatMap(s => s.v)));

    const X = i =>
      L + (labels.length > 1
        ? i * pw / (labels.length - 1)
        : pw / 2);

    const Y = v =>
      T + ph - v / max * ph;

    let g = axes(max, w, h, L, R, T, B);

    g += labels.map((l, i) => `
      <text
        x="${X(i)}"
        y="${h - 6}"
        text-anchor="middle"
      >
        ${l}
      </text>
    `).join('');

    const paths = series.map(s => {
      let d = `M${X(0)} ${Y(s.v[0])}`;

      for (let i = 1; i < s.v.length; i++) {
        const m = (X(i - 1) + X(i)) / 2;

        d += `
          C${m} ${Y(s.v[i - 1])}
          ${m} ${Y(s.v[i])}
          ${X(i)} ${Y(s.v[i])}
        `;
      }

      return `
        <path
          d="${d}"
          fill="none"
          stroke="${s.c}"
          stroke-width="2.5"
        />
      ` + s.v.map((v, i) => `
        <circle
          cx="${X(i)}"
          cy="${Y(v)}"
          r="4"
          fill="#fff"
          stroke="${s.c}"
          stroke-width="2"
        >
          <title>
            ${s.n} ${labels[i]}: ${U.money(v)}
          </title>
        </circle>
      `).join('');
    }).join('');

    return `
      <svg
        class="chart"
        viewBox="0 0 ${w} ${h}"
        role="img"
        aria-label="Monthly activity chart"
      >
        ${g}
        ${paths}
      </svg>
    `;
  }

  function bars(m) {
    const w = 600;
    const h = 230;
    const L = 40;
    const R = 10;
    const T = 12;
    const B = 26;

    const pw = w - L - R;
    const ph = h - T - B;
    const gw = pw / m.length;

    const max = nice(
      Math.max(1, ...m.flatMap(x => [x.income, x.expense]))
    );

    let s = axes(max, w, h, L, R, T, B);

    m.forEach((x, i) => {
      const cx = L + gw * i + gw / 2;
      const bw = Math.min(22, gw / 3);

      [
        [x.income, '#10b981', 'Income', -bw],
        [x.expense, '#6366f1', 'Expenses', 0]
      ].forEach(b => {
        const bh = b[0] / max * ph;

        s += `
          <rect
            x="${cx + b[3]}"
            y="${T + ph - bh}"
            width="${bw - 2}"
            height="${bh}"
            rx="4"
            fill="${b[1]}"
          >
            <title>
              ${b[2]} ${x.label}: ${U.money(b[0])}
            </title>
          </rect>
        `;
      });

      s += `
        <text
          x="${cx}"
          y="${h - 6}"
          text-anchor="middle"
        >
          ${x.label}
        </text>
      `;
    });

    return `
      <svg
        class="chart"
        viewBox="0 0 ${w} ${h}"
        role="img"
        aria-label="Income versus expenses"
      >
        ${s}
      </svg>
    `;
  }

  const periodList = p =>
    p === 'all'
      ? W.all()
      : W.inMonth(p === 'last' ? 1 : 0);

  const periodSel = id => `
    <select class="pill" id="${id}" aria-label="Period">
      <option value="this">This Month</option>
      <option value="last">Last Month</option>
      <option value="all">All Time</option>
    </select>
  `;

  function stat(label, val, chg, c, bg, ic, v) {
    return `
      <div class="card stat">
        <div
          class="badge"
          style="background:${bg};color:${c}"
        >
          ${U.icon(ic)}
        </div>

        <div>
          <small>${label}</small>
          <span class="v">
            ${U.money(val)}${chg}
          </span>
        </div>

        ${spark(v, c)}
      </div>
    `;
  }

  const chg = (a, b, goodUp) => {
    const p = pct(a, b);
    const up = p >= 0;

    return `
      <span class="chg ${up === goodUp ? 'up' : 'down'}">
        ${up ? '↑' : '↓'} ${Math.abs(p)}%
      </span>
    `;
  };

  function dashboard(el) {
    const m = W.monthly(6);
    const cur = m[5];
    const prev = m[4];
    const first = W.user().name.split(' ')[0];

    el.innerHTML = `
      <section class="hero">
        <h1>Welcome back, ${U.esc(first)}! 👋</h1>
        <p>Manage your money smarter with NovaPay</p>

        <svg class="art" viewBox="0 0 260 150" aria-hidden="true">
          <rect x="82" y="22" width="100" height="40" rx="8"
            fill="#4ade80" transform="rotate(-12 82 22)"/>

          <rect x="96" y="26" width="100" height="40" rx="8"
            fill="#fb923c" transform="rotate(-4 96 26)"/>

          <rect x="70" y="55" width="130" height="90" rx="18"
            fill="#2a2fa0"/>

          <rect x="165" y="85" width="42" height="30" rx="14"
            fill="#4b4fe0"/>

          <circle cx="182" cy="100" r="5" fill="#c7c9ff"/>
          <circle cx="225" cy="35" r="14" fill="#fbbf24"/>
          <circle cx="40" cy="95" r="12" fill="#fbbf24"/>
          <circle cx="215" cy="125" r="10" fill="#fbbf24"/>
        </svg>
      </section>

      <div class="grid g3">
        ${stat('Total Balance', W.balance(), chg(cur.balance, prev.balance, true), '#4f46e5', '#e0e3ff', 'wallet', m.map(x => x.balance))}

        ${stat('Income (this month)', cur.income, chg(cur.income, prev.income, true), '#10b981', '#d1fae5', 'arrow-down', m.map(x => x.income))}

        ${stat('Expenses (this month)', cur.expense, chg(cur.expense, prev.expense, false), '#ef4444', '#fee2e2', 'arrow-up', m.map(x => x.expense))}
      </div>

      <div class="grid g-mid">
        <div class="card">
          <div class="card-head">
            <h2>Spending Overview</h2>
            ${periodSel('spendSel')}
          </div>

          <div class="donut-wrap" id="spend"></div>
        </div>

        <div class="card">
          <div class="card-head">
            <h2>Recent Transactions</h2>

            <a class="link" href="#transactions">
              View All
              ${U.icon('arrow-up').replace(
      '<svg class="ic"',
      '<svg class="ic" style="width:14px;transform:rotate(45deg)"'
    )}
            </a>
          </div>

          ${T.recent(5)}
        </div>

        <div class="card">
          <div class="card-head">
            <h2>Quick Actions</h2>
          </div>

          <div class="qa">
            <button data-act="income">
              ${U.icon('plus-circle')}Add Income
            </button>

            <button data-act="expense">
              ${U.icon('minus-circle')}Add Expense
            </button>

            <button data-act="send">
              ${U.icon('send')}Send Money
            </button>

            <button data-act="transactions">
              ${U.icon('list')}View Transactions
            </button>
          </div>
        </div>
      </div>

      <div class="grid g-bot">
        <div class="card">
          <div class="card-head">
            <h2>Monthly Activity</h2>

            <select class="pill" id="monthSel" aria-label="Range">
              <option value="3">3 Months</option>
              <option value="6" selected>6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>

          <div id="activity"></div>

          <div class="legend" style="display:flex;gap:18px;margin-top:8px">
            <div>
              <i style="background:#10b981"></i>Income
            </div>

            <div>
              <i style="background:#6366f1"></i>Expenses
            </div>
          </div>
        </div>

        <div class="promo">
          <h2>Spend Smart. Save More.</h2>
          <p>Let NovaPay help you achieve your financial goals!</p>
          <button class="btn" data-act="analytics">
            Learn More
          </button>
        </div>
      </div>
    `;

    const drawSpend = () => {
      const l = periodList(U.$('#spendSel').value);
      const d = spendData(l);

      U.$('#spend').innerHTML =
        donut(d, 'Total Expenses') + legend(d);
    };

    const drawAct = () => {
      const mm = W.monthly(+U.$('#monthSel').value);

      U.$('#activity').innerHTML = line(
        [
          {
            n: 'Income',
            v: mm.map(x => x.income),
            c: '#10b981'
          },
          {
            n: 'Expenses',
            v: mm.map(x => x.expense),
            c: '#6366f1'
          }
        ],
        mm.map(x => x.label)
      );
    };

    U.$('#spendSel').onchange = drawSpend;
    U.$('#monthSel').onchange = drawAct;

    drawSpend();
    drawAct();
  }

  function analytics(el) {
    const m = W.monthly(6);
    const cur = m[5];
    const all = W.all();
    const exp = all.filter(t => t.type === 'expense');

    const rate = cur.income
      ? Math.round((cur.income - cur.expense) / cur.income * 100)
      : 0;

    const avg = m.reduce((s, x) => s + x.expense, 0) / 6;
    const big = exp.sort((a, b) => b.amount - a.amount)[0];
    const d = spendData(all);

    el.innerHTML = `
      <div class="page-head">
        <h1>Analytics</h1>
      </div>

      <div class="kpis">
        <div class="card">
          <small>Income this month</small>
          <b class="up">${U.money(cur.income)}</b>
        </div>

        <div class="card">
          <small>Spent this month</small>
          <b class="down">${U.money(cur.expense)}</b>
        </div>

        <div class="card">
          <small>Savings rate</small>
          <b>${rate}%</b>
        </div>

        <div class="card">
          <small>Avg. monthly spending</small>
          <b>${U.money(avg)}</b>
        </div>

        <div class="card">
          <small>Largest expense</small>
          <b>${big ? U.money(big.amount) : '—'}</b>
        </div>
      </div>

      <div class="grid g2">
        <div class="card">
          <div class="card-head">
            <h2>Income vs Expenses</h2>
          </div>

          ${bars(m)}

          <div class="legend" style="display:flex;gap:18px;margin-top:8px">
            <div>
              <i style="background:#10b981"></i>Income
            </div>

            <div>
              <i style="background:#6366f1"></i>Expenses
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <h2>Where your money goes</h2>
          </div>

          <div class="donut-wrap">
            ${donut(d, 'All-time spending')}
            ${legend(d)}
          </div>
        </div>
      </div>
    `;
  }

  function categories(el) {
    const all = W.byCategory(W.all());
    const mon = W.byCategory(W.inMonth(0));

    const tot = Object.values(all)
      .reduce((s, v) => s + v, 0) || 1;

    const names = Object.keys(U.CATS.expense)
      .sort((a, b) => (all[b] || 0) - (all[a] || 0));

    el.innerHTML = `
      <div class="page-head">
        <h1>Categories</h1>
      </div>

      <div class="grid g3">
        ${names.map(n => {
      const c = U.CATS.expense[n];
      const v = all[n] || 0;

      const count = W.all().filter(
        t => t.type === 'expense' && t.category === n
      ).length;

      return `
            <button class="card cat-card" data-cat="${n}">
              <div class="stat">
                <div
                  class="badge"
                  style="background:${c.c}22;color:${c.c}"
                >
                  ${U.icon(c.i)}
                </div>

                <div>
                  <b>${n}</b><br>

                  <small>
                    ${count} transaction${count === 1 ? '' : 's'}
                  </small>
                </div>
              </div>

              <div>
                <span
                  class="v"
                  style="font-size:22px;font-weight:700"
                >
                  ${U.money(v)}
                </span>

                <small style="color:var(--muted)">
                  all time · ${U.money(mon[n] || 0)} this month
                </small>
              </div>

              <div class="bar">
                <i
                  style="width:${Math.round(v / tot * 100)}%;background:${c.c}"
                ></i>
              </div>
            </button>
          `;
    }).join('')}
      </div>
    `;
  }
  return {
    dashboard,
    analytics,
    categories
  };
})();