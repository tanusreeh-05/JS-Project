window.NP = window.NP || {};
NP.Demo = (function () {
  const rows = [
    [0, 9, 30, 'income', 'Salary Deposit', 'Salary', 50000],
    [0, 7, 15, 'expense', 'Grocery Shopping', 'Food', 3000],

    [1, 18, 20, 'expense', 'Flight Booking', 'Travel', 3500],
    [1, 16, 10, 'income', 'Gift Received', 'Gift', 1000],

    [2, 20, 0, 'expense', 'Restaurant Dinner', 'Food', 800],
    [3, 14, 0, 'expense', 'New Sneakers', 'Shopping', 3500],
    [4, 21, 0, 'expense', 'Movie Night', 'Entertainment', 1000],
    [5, 10, 0, 'expense', 'Electricity Bill', 'Bills', 1200],

    [32, 9, 0, 'income', 'Salary Deposit', 'Salary', 50000],
    [34, 12, 0, 'expense', 'Groceries', 'Food', 3100],
    [38, 19, 0, 'expense', 'Hotel Stay', 'Travel', 4200],
    [45, 15, 0, 'expense', 'Online Order', 'Shopping', 1100],

    [62, 9, 0, 'income', 'Salary Deposit', 'Salary', 50000],
    [65, 12, 0, 'expense', 'Groceries', 'Food', 3000],
    [70, 20, 0, 'expense', 'Concert Tickets', 'Entertainment', 1400],
    [75, 11, 0, 'expense', 'Phone Bill', 'Bills', 1100],

    [93, 9, 0, 'income', 'Salary Deposit', 'Salary', 50000],
    [96, 12, 0, 'expense', 'Groceries', 'Food', 3200],
    [100, 16, 0, 'expense', 'Winter Jacket', 'Shopping', 2600],

    [124, 9, 0, 'income', 'Salary Deposit', 'Salary', 50000],
    [128, 10, 0, 'expense', 'Weekend Trip', 'Travel', 5000],
    [131, 12, 0, 'expense', 'Groceries', 'Food', 3700],

    [155, 9, 0, 'income', 'Salary Deposit', 'Salary', 50000],
    [158, 12, 0, 'expense', 'Groceries', 'Food', 3500],
    [160, 15, 0, 'expense', 'Headphones', 'Shopping', 1200]
  ];

  function get() {

    return {
      user: {
        name: 'Lisa'
      },

      transactions: rows.map(r => {

        const d = new Date();

        d.setDate(d.getDate() - r[0]);
        d.setHours(r[1], r[2], 0, 0);

        return{
          id:NP.Utils.uid()+r[0],
          type:r[3],title:r[4],
          category:r[5],
          amount:r[6],
          date:d.toISOString()
        };

      })
    };

  }

  return {
    get
  };

})();