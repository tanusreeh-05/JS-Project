(function () {
  const U = NP.Utils;
  const W = NP.Wallet;
  const T = NP.Transactions;
  const D = NP.Dashboard;
  const $ = U.$;

  W.init();

  const view = $('#view');

  const routes = {
    dashboard: D.dashboard,
    analytics: D.analytics,
    categories: D.categories,
    transactions: T.page,
    wallet: walletPage,
    profile: profilePage,
    settings: settingsPage
  };

  const route = () => {
    const r = location.hash.slice(1);
    return routes[r] ? r : 'dashboard';
  };

  const go = r => {
    if (location.hash === '#' + r) {
      render();
    } else {
      location.hash = r;
    }
  };

  function render() {
    const r = route();

    U.$$('[data-route]').forEach(a =>
      a.classList.toggle('active', a.dataset.route === r)
    );

    $('#avatar').textContent = W.user().name
      .split(' ')
      .map(s => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const ph = W.user().photo, av = $('#avatar');
    av.style.background = ph ? `url('${ph}') center/cover` : '';
    av.style.fontSize = ph ? '0' : '';

    routes[r](view);

    $('#sidebar').classList.remove('open');

    document.title = 'NovaPay – ' + r[0].toUpperCase() + r.slice(1);
  }

  function field(label, name, inner) {
    return `
      <div class="field">
        <label for="f_${name}">${label}</label>
        ${inner}
      </div>
    `;
  }

  const input = (name, attrs) => `
    <input
      id="f_${name}"
      name="${name}"
      ${attrs || ''}
    >
  `;

  const select = (name, opts) => `
    <select id="f_${name}" name="${name}">
      ${opts.map(o => `<option>${o}</option>`).join('')}
    </select>
  `;

  function modal(title, sub, body, label, submit) {

    const bg = document.createElement('div');
    bg.className = 'modal-bg';

    bg.innerHTML = `
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label="${title}"
      >
        <h3>${title}</h3>
        <p class="sub">${sub}</p>

        <div class="err" role="alert"></div>

        ${body}

        <div class="row">
          <button class="btn" data-x>Cancel</button>
          <button class="btn primary" data-ok>${label}</button>
        </div>
      </div>
    `;

    const close = () => bg.remove();

    const ok = () => {
      try {
        submit(
          Object.fromEntries(
            U.$$('input,select', bg).map(i => [i.name, i.value])
          )
        );

        close();
        render();

      } catch (e) {
        $('.err', bg).textContent = e.message;
      }
    };

    bg.onclick = e => {
      if (e.target === bg || e.target.hasAttribute('data-x')) {
        close();
      }
    };

    $('[data-ok]', bg).onclick = ok;

    bg.onkeydown = e => {
      if (e.key === 'Enter') ok();
      if (e.key === 'Escape') close();
    };

    document.body.append(bg);
    $('input', bg).focus();
  }

  function addTx(type) {

    const inc = type === 'income';
    const cats = Object.keys(U.CATS[type]);

    modal(
      inc ? 'Add income' : 'Add expense',

      inc
        ? 'Money coming into your wallet.'
        : 'Money going out of your wallet.',

      field(
        'Description',
        'title',
        input(
          'title',
          'placeholder="' +
          (inc ? 'e.g. Salary' : 'e.g. Groceries') +
          '" maxlength="40"'
        )
      ) +

      field(
        'Amount (₹)',
        'amount',
        input(
          'amount',
          'type="number" min="0.01" step="0.01" placeholder="0.00"'
        )
      ) +

      field(
        'Category',
        'category',
        select('category', cats)
      ),

      inc ? 'Add income' : 'Add expense',

      d => {
        inc ? W.addIncome(d) : W.addExpense(d);

        U.toast(
          (inc ? 'Income' : 'Expense') +
          ' added: ' + U.money(d.amount)
        );
      }
    );
  }

  function sendModal() {

    modal(
      'Send money',

      'Simulated transfer. No real money moves. Available: ' +
      U.money(W.balance()),

      field(
        'Send to',
        'to',
        input(
          'to',
          'placeholder="Name or email" maxlength="40"'
        )
      ) +

      field(
        'Amount (₹)',
        'amount',
        input(
          'amount',
          'type="number" min="0.01" step="0.01" placeholder="0.00"'
        )
      ),

      'Send money',

      d => {
        W.sendMoney(d);

        U.toast(
          'Sent ' + U.money(d.amount) +
          ' to ' + d.to.trim()
        );
      }
    );
  }

  function walletPage(el) {

    el.innerHTML = `
      <div class="page-head">
        <h1>Wallet</h1>
      </div>

      <div class="grid g2">

        <div>
          <div class="wallet-card">

            <div style="display:flex;justify-content:space-between">
              <b>NovaPay</b>
              <span>Demo card</span>
            </div>

            <div>
              <small>Available balance</small>
              <div class="bal">${U.money(W.balance())}</div>
            </div>

            <div style="display:flex;justify-content:space-between">
              <span>${U.esc(W.user().name)}</span>
              <span>•••• 4821</span>
            </div>

          </div>

          <div class="btns" style="margin-top:16px">

            <button class="btn primary" data-act="income">
              ${U.icon('plus-circle')}Add income
            </button>

            <button class="btn" data-act="expense">
              ${U.icon('minus-circle')}Add expense
            </button>

            <button class="btn" data-act="send">
              ${U.icon('send')}Send money
            </button>

          </div>
        </div>

        <div class="card">

          <div class="card-head">
            <h2>Latest activity</h2>
            <a class="link" href="#transactions">View all</a>
          </div>

          ${T.recent(6)}

        </div>

      </div>
    `;
  }

  function profilePage(el) {

    const all = W.all();

    el.innerHTML = `
      <div class="page-head">
        <h1>Profile</h1>
      </div>

      <div class="card" style="max-width:460px">

        <div class="stat" style="margin-bottom:18px">
          <button class="avatar" id="picBtn" title="Change photo" style="width:72px;height:72px;font-size:${W.user().photo ? 0 : 22}px;${W.user().photo ? `background:url('${W.user().photo}') center/cover` : ''}">${W.user().photo ? '' : $('#avatar').textContent}</button>
          <div>
          <b>${U.esc(W.user().name)}</b><br>
          <small>${all.length} transactions recorded</small><br>
          <small>Click the photo to change it</small>
         </div>
        </div>
<input type="file" id="picInput" accept="image/*" hidden>

        ${field(
      'Display name',
      'name',
      input(
        'name',
        'value="' + U.esc(W.user().name) + '" maxlength="30"'
      )
    )}

        <div class="err" id="pErr"></div>

        <button class="btn primary" id="saveName">
          Save changes
        </button>

      </div>
    `;

    $('#saveName').onclick = () => {

      try {
        W.setName($('#f_name').value);

        U.toast('Profile saved');
        render();

      } catch (e) {
        $('#pErr').textContent = e.message;
      }

    };

    $('#picBtn').onclick = () => $('#picInput').click();
    $('#picInput').onchange = e => {
      const file = e.target.files[0];
      e.target.value = ''; 
      if (!file) return;
      if (!file.type.startsWith('image/')) { 
        U.toast('Please choose an image file.', true); return 
      }
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = 200, c = document.createElement('canvas'); 
        c.width = c.height = s;
        const m = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
        URL.revokeObjectURL(url);
        W.setPhoto(c.toDataURL('image/jpeg', 0.85));
        U.toast('Profile photo updated'); render();
      };
      img.onerror = () => U.toast('Could not read that image.', true);
      img.src = url;
    };
  }

  function settingsPage(el) {

    el.innerHTML = `
      <div class="page-head">
        <h1>Settings</h1>
      </div>

      <div class="card" style="max-width:520px">

        <h2>Demo data</h2>

        <p style="color:var(--muted);margin:6px 0 16px">
          NovaPay stores everything in this browser only.
          Nothing is sent anywhere.
        </p>

        <div class="btns">

          <button class="btn" data-act="reset">
            Reset to demo data
          </button>

          <button class="btn danger" data-act="clear">
            Start with an empty wallet
          </button>

        </div>

      </div>
    `;
  }

  document.addEventListener('click', e => {

    const a = e.target.closest('[data-act]');

    if (a) {

      const k = a.dataset.act;

      if (k === 'income' || k === 'expense') {
        addTx(k);

      } else if (k === 'send') {
        sendModal();

      } else if (k === 'menu') {
        $('#sidebar').classList.toggle('open');

      } else if (k === 'logout') {
        document.body.classList.add('locked');

      } else if (k === 'login') {
        document.body.classList.remove('locked');

      } else if (k === 'bell') {

        const t = W.all()[0];

        U.toast(
          t
            ? 'Latest: ' + t.title + ' (' +
            (t.type === 'income' ? '+' : '-') +
            U.money(t.amount) + ')'
            : 'You are all caught up.'
        );

      } else if (k === 'reset') {

        if (confirm('Replace all data with the demo data?')) {
          W.reset();
          U.toast('Demo data restored');
          render();
        }

      } else if (k === 'clear') {

        if (confirm('Delete every transaction and start fresh?')) {
          W.reset(true);
          U.toast('Wallet cleared');
          render();
        }

      } else {
        go(k);
      }

      return;
    }

    const d = e.target.closest('[data-del]');

    if (d && confirm('Delete this transaction?')) {
      W.remove(d.dataset.del);
      U.toast('Transaction deleted');
      render();
      return;
    }

    const c = e.target.closest('[data-cat]');

    if (c) {
      T.f.type = 'expense';
      T.f.cat = c.dataset.cat;
      T.f.q = '';

      $('#q').value = '';

      go('transactions');
    }

  });

  $('#q').addEventListener('input', e => {

    T.f.q = e.target.value;

    if (route() === 'transactions') {
      T.page(view);
    } else {
      location.hash = 'transactions';
    }
  });

  window.addEventListener('hashchange', render);
  render();
})();