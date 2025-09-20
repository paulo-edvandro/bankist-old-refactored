"use strict";

// Data //
// 1 200, 450, -400, 3000, -650, -130, 70, 1300
// 2 5000, 3400, -150, -790, -3210, -1000, 8500, -30
// 3 200, -200, 340, -300, -20, 50, 400, -460
// 4 430, 1000, 700, 50, 90

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300, 1220],
  interestRate: 1.2,
  pin: 1111,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2025-04-15T10:17:24.185Z",
    "2025-04-13T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
    "2025-04-17T21:50:50.040Z",
  ],
  currency: "EUR",
  locale: "pt-PT",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2025-04-17T21:50:50.040Z",
    "2025-04-14T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

function addTransactions(array) {
  array.forEach(function (acc) {
    acc.transactions = [];
    acc.movements.forEach(function (mv, idx) {
      acc.transactions.push({
        type: "movement",
        value: mv,
        date: acc.movementsDates[idx],
      });
    });
  });
}

addTransactions(accounts);
console.log(account1);

const msg = document.getElementById("mensagem");
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");
const generator = document.querySelector(".movements__type--deposit");
const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const formLoan = document.querySelector(".form--loan");
const formTransfer = document.querySelector(".form--transfer");
const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const formClose = document.querySelector(".form--close");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
const formLogin = document.querySelector(".login");

containerMovements.innerHTML = "";

function formatDate(showLabel = true, date) {
  const re = new Intl.DateTimeFormat(navigator.language, {
    hour: "2-digit",
    day: "2-digit",
    month: "long",
    weekday: "long",
    year: "numeric",
    minute: "2-digit",
  }).format(date);
  return showLabel ? (labelDate.textContent = re) : re;
}

labelDate.textContent = new Intl.DateTimeFormat(navigator.language, {
  hour: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  minute: "2-digit",
}).format(new Date());

function formatCurrency(x) {
  return new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: foundAccount.currency,
  }).format(x);
}

const renderMovements = function (array) {
  containerMovements.innerHTML = "";

  array.forEach(function (tr, i) {
    if (tr.type === "loan") {
      const labelType = "LOAN";
      const html = `<div class="movements__row">
                <div class="movements__type movements__type--deposit">${i + 1} ${labelType}</div> 
                <div class="movements__date">${formatDate(false, new Date(tr.date))}</div>
                <div class="movements__value">${formatCurrency(tr.value)}</div>
              </div>`;
      containerMovements.insertAdjacentHTML("afterbegin", html);
    } else {
      const labelType = tr.value < 0 ? "withdrawal" : "deposit";
      const html = `<div class="movements__row">
                <div class="movements__type movements__type--${labelType}">${i + 1} ${labelType}</div>
                <div class="movements__date">${formatDate(false, new Date(tr.date))}</div>
                <div class="movements__value">${formatCurrency(tr.value)}</div>
              </div>`;
      containerMovements.insertAdjacentHTML("afterbegin", html);
    }
  });
};

let timeOut;

const startTimer = function () {
  let seconds = 60;
  function tick() {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const seg = String(seconds % 60).padStart(2, "0");
    if (seconds === -1) {
      clearInterval(timeOut);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = "0";
    } else {
      labelTimer.textContent = `${minutes}:${seg}`;
      seconds--;
    }
  }

  tick();
  timeOut = setInterval(tick, 1000);
};

const createUsername = function (user) {
  const username = user
    .toLowerCase()
    .split(" ")
    .map((a) => a[0])
    .join("");
  return username;
};

const addUser = function (ac) {
  ac.forEach((v) => {
    v.user = createUsername(v.owner);
  });
};

addUser(accounts);

const updateBalance = function (account) {
  const n = account.transactions.reduce(function (c, v) {
    return c + v.value;
  }, 0);
  return (labelBalance.textContent = formatCurrency(n));
};

const updateSummary = function (account) {
  const a = account.transactions
    .filter((v) => v.value > 0)
    .reduce((cn, v) => cn + v.value, 0);
  const b = Math.abs(
    account.transactions
      .filter((v) => v.value < 0)
      .reduce((cn, v) => cn + v.value, 0)
  );
  const c = account.transactions
    .filter(function (v) {
      return v.type !== "loan" && v.value > 0;
    })
    .map((v) => (v.value * account.interestRate) / 100)
    .filter((v) => v >= 1)
    .reduce((cn, v) => cn + v, 0)
    .toFixed(2);

  labelSumIn.textContent = formatCurrency(a);
  labelSumOut.textContent = formatCurrency(b);
  labelSumInterest.textContent = formatCurrency(c);

  return account.transactions.reduce((cn, v) => {
    cn + v.value;
  }, 0);
};

const getBalance = function (account) {
  return account.transactions.reduce((cn, v) => {
    return cn + v.value;
  }, 0);
};

let foundAccount;
let transferUser;
let currentAccount;

function findAccount(x, y) {
  foundAccount = accounts.find(function (v) {
    return x.value === v.user && v.pin === +y.value;
  });
  return foundAccount;
}

function findUser(x) {
  transferUser = accounts.find(function (v) {
    return x.value === v.user;
  });
  return transferUser;
}

function clearInputsBlur(x, y, z) {
  x.value = "";
  y.value = "";
  z.blur();
}

function updateAll(account) {
  renderMovements(account.transactions);
  updateBalance(account);
  updateSummary(account);
}

formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  findAccount(inputLoginUsername, inputLoginPin);
  if (foundAccount) {
    labelWelcome.textContent = `Welcome back ${foundAccount.owner.split(" ")[0]}`;
    clearInputsBlur(inputLoginPin, inputLoginUsername, inputLoginPin);
    updateAll(foundAccount);
    currentAccount = foundAccount;
    console.log(document.querySelectorAll(".movements__type"));
    if (timeOut) clearInterval(timeOut);
    containerApp.style.opacity = "1";
    startTimer();
  } else {
    inputLoginPin.value = "";
    inputLoginPin.blur();
  }
});

formTransfer.addEventListener("submit", function (e) {
  e.preventDefault();
  findUser(inputTransferTo);
  const re = getBalance(foundAccount);
  let quantia = Number(inputTransferAmount.value);
  if (
    transferUser &&
    transferUser !== foundAccount &&
    quantia > 0 &&
    quantia <= re
  ) {
    if (timeOut) clearInterval(timeOut);
    startTimer();
    clearInputsBlur(
      inputTransferTo,
      inputTransferAmount,
      inputTransferAmount
    );
    transferUser.transactions.push({
      type: "transfer",
      value: quantia,
      date: new Date(),
    });
    foundAccount.transactions.push({
      type: "transfer",
      value: -quantia,
      date: new Date(),
    });
    updateAll(foundAccount);
  } else {
    clearInputsBlur(
      inputTransferTo,
      inputTransferAmount,
      inputTransferAmount
    );
    if (timeOut) clearInterval(timeOut);
    startTimer();
  }
});

let jk = false;

formLoan.addEventListener("submit", function (e) {
  e.preventDefault();
  const loanValue = Math.floor(inputLoanAmount.value);
  const va = foundAccount.transactions.some(function (v) {
    return v.value >= 0.1 * loanValue && v.type !== "loan";
  });
  if (va === true && loanValue > 0) {
    jk = true;

    setTimeout(() => {
      foundAccount.transactions.push({
        type: "loan",
        value: loanValue,
        date: new Date(),
      });
      updateAll(foundAccount);
      jk = !jk;
    }, 3000);

    inputLoanAmount.value = "";
    inputLoanAmount.blur();
    if (timeOut) clearInterval(timeOut);
    startTimer();
  } else {
    inputLoanAmount.value = "";
    inputLoanAmount.blur();
    if (timeOut) clearInterval(timeOut);
    startTimer();
  }
});

formClose.addEventListener("submit", function (e) {
  e.preventDefault();
  findAccount(inputCloseUsername, inputClosePin);
  if (foundAccount === currentAccount) {
    const index = accounts.findIndex(
      (v) => v.user === currentAccount.user && v.pin === currentAccount.pin
    );
    accounts.splice(index, 1);
    labelWelcome.textContent = `Log in to get started`;
    containerApp.style.opacity = "0";
  }
});

let sorted = true;

btnSort.addEventListener("click", function () {
  btnSort.blur();
  sorted
    ? renderMovements(
        foundAccount.transactions.slice().sort(function (a, b) {
          return a.value - b.value;
        })
      )
    : renderMovements(foundAccount.transactions);
  sorted = !sorted;
});

