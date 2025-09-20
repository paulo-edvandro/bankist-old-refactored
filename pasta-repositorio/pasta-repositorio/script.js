"use strict";

const bankAccount1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300, 1220],
  interestRate: 1.2,
  pin: 1111,
  movementDates: [
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

const bankAccount2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementDates: [
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

const accounts = [bankAccount1, bankAccount2];

function addTransactionsToAccounts(accountsArray) {
  accountsArray.forEach(account => {
    account.transactions = [];
    account.movements.forEach((transactionValue, transactionIndex) => {
      account.transactions.push({
        type: "movement",
        value: transactionValue,
        date: account.movementDates[transactionIndex],
      });
    });
  });
}

addTransactionsToAccounts(accounts);

const msg = document.getElementById("mensagem");
const welcomeLabel = document.querySelector(".welcome");
const dateLabel = document.querySelector(".date");
const balanceLabel = document.querySelector(".balance__value");
const sumInLabel = document.querySelector(".summary__value--in");
const sumOutLabel = document.querySelector(".summary__value--out");
const sumInterestLabel = document.querySelector(".summary__value--interest");
const timerLabel = document.querySelector(".timer");
const appContainer = document.querySelector(".app");
const movementsContainer = document.querySelector(".movements");

const loanForm = document.querySelector(".form--loan");
const transferForm = document.querySelector(".form--transfer");
const loginButton = document.querySelector(".login__btn");
const transferButton = document.querySelector(".form__btn--transfer");
const loanButton = document.querySelector(".form__btn--loan");
const closeButton = document.querySelector(".form__btn--close");
const sortButton = document.querySelector(".btn--sort");

const closeForm = document.querySelector(".form--close");

const loginUsernameInput = document.querySelector(".login__input--user");
const loginPinInput = document.querySelector(".login__input--pin");
const transferToInput = document.querySelector(".form__input--to");
const transferAmountInput = document.querySelector(".form__input--amount");
const loanAmountInput = document.querySelector(".form__input--loan-amount");
const closeUsernameInput = document.querySelector(".form__input--user");
const closePinInput = document.querySelector(".form__input--pin");
const loginForm = document.querySelector(".login");

movementsContainer.innerHTML = "";

function formatDate(date, updateLabel = false) {
  const formatted = new Intl.DateTimeFormat(navigator.language, {
    hour: "2-digit",
    day: "2-digit",
    month: "long",
    weekday: "long",
    year: "numeric",
    minute: "2-digit",
  }).format(date);
  if (updateLabel) dateLabel.textContent = formatted;
  return formatted;
}

dateLabel.textContent = new Intl.DateTimeFormat(navigator.language, {
  hour: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  minute: "2-digit",
}).format(new Date());

function formatCurrency(value) {
  return new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: currentAccount.currency,
  }).format(value);
}

const renderMovements = function (transactions) {
  movementsContainer.innerHTML = "";
  transactions.forEach((t, i) => {
    const typeLabel = t.type === "loan" ? "LOAN" : t.value < 0 ? "withdrawal" : "deposit";
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${typeLabel}">${i + 1} ${typeLabel}</div>
        <div class="movements__date">${formatDate(new Date(t.date))}</div>
        <div class="movements__value">${formatCurrency(t.value)}</div>
      </div>`;
    movementsContainer.insertAdjacentHTML("afterbegin", html);
  });
};

let timeOut;

const startLogOutTimer = function () {
  const LOGOUT_TIME = 60;
  let seconds = LOGOUT_TIME;
  function tick() {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    if (seconds === -1) {
      clearInterval(timeOut);
      welcomeLabel.textContent = `Log in to get started`;
      appContainer.style.opacity = "0";
    } else {
      timerLabel.textContent = `${minutes}:${sec}`;
      seconds--;
    }
  }
  tick();
  timeOut = setInterval(tick, 1000);
};

const createUsername = user =>
  user.toLowerCase().split(" ").map(a => a[0]).join("");

const addUser = accounts =>
  accounts.forEach(acc => (acc.user = createUsername(acc.owner)));

addUser(accounts);

const calcBalance = function (account) {
  const balance = account.transactions.reduce((sum, t) => sum + t.value, 0);
  balanceLabel.textContent = formatCurrency(balance);
  return balance;
};

const calcSummary = function (account) {
  const incomes = account.transactions.filter(t => t.value > 0).reduce((sum, t) => sum + t.value, 0);
  const out = Math.abs(account.transactions.filter(t => t.value < 0).reduce((sum, t) => sum + t.value, 0));
  const interest = account.transactions
    .filter(t => t.type !== "loan" && t.value > 0)
    .map(t => (t.value * account.interestRate) / 100)
    .filter(i => i >= 1)
    .reduce((sum, i) => sum + i, 0)
    .toFixed(2);
  sumInLabel.textContent = formatCurrency(incomes);
  sumOutLabel.textContent = formatCurrency(out);
  sumInterestLabel.textContent = formatCurrency(interest);
};

const getBalance = account => account.transactions.reduce((sum, t) => sum + t.value, 0);

let currentAccount;
let foundAccount;
let transferUser;

function findAccount(userInput, pinInput) {
  foundAccount = accounts.find(acc => userInput.value === acc.user && acc.pin === +pinInput.value);
  return foundAccount;
}

function findUser(userInput) {
  transferUser = accounts.find(acc => userInput.value === acc.user);
  return transferUser;
}

function clearInputs(...inputs) {
  inputs.forEach(input => (input.value = ""));
  inputs[inputs.length - 1].blur();
}

function updateUI(account) {
  renderMovements(account.transactions);
  calcBalance(account);
  calcSummary(account);
}

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  findAccount(loginUsernameInput, loginPinInput);
  if (foundAccount) {
    welcomeLabel.textContent = `Welcome back ${foundAccount.owner.split(" ")[0]}`;
    clearInputs(loginPinInput, loginUsernameInput, loginPinInput);
    updateUI(foundAccount);
    currentAccount = foundAccount;
    if (timeOut) clearInterval(timeOut);
    appContainer.style.opacity = "1";
    startLogOutTimer();
  } else {
    loginPinInput.value = "";
    loginPinInput.blur();
  }
});

transferForm.addEventListener("submit", function (e) {
  e.preventDefault();
  findUser(transferToInput);
  const balance = getBalance(foundAccount);
  let amount = Number(transferAmountInput.value);
  if (transferUser && transferUser !== foundAccount && amount > 0 && amount <= balance) {
    if (timeOut) clearInterval(timeOut);
    startLogOutTimer();
    clearInputs(transferToInput, transferAmountInput, transferAmountInput);
    transferUser.transactions.push({ type: "transfer", value: amount, date: new Date() });
    foundAccount.transactions.push({ type: "transfer", value: -amount, date: new Date() });
    updateUI(foundAccount);
  } else {
    clearInputs(transferToInput, transferAmountInput, transferAmountInput);
    if (timeOut) clearInterval(timeOut);
    startLogOutTimer();
  }
});

let processingLoan = false;

loanForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const loanValue = Math.floor(loanAmountInput.value);
  const eligible = foundAccount.transactions.some(t => t.value >= 0.1 * loanValue && t.type !== "loan");
  if (eligible && loanValue > 0) {
    processingLoan = true;
    setTimeout(() => {
      foundAccount.transactions.push({ type: "loan", value: loanValue, date: new Date() });
      updateUI(foundAccount);
      processingLoan = false;
    }, 3000);
    loanAmountInput.value = "";
    loanAmountInput.blur();
    if (timeOut) clearInterval(timeOut);
    startLogOutTimer();
  } else {
    loanAmountInput.value = "";
    loanAmountInput.blur();
    if (timeOut) clearInterval(timeOut);
    startLogOutTimer();
  }
});

closeForm.addEventListener("submit", function (e) {
  e.preventDefault();
  findAccount(closeUsernameInput, closePinInput);
  if (foundAccount === currentAccount) {
    const index = accounts.findIndex(acc => acc.user === currentAccount.user && acc.pin === currentAccount.pin);
    accounts.splice(index, 1);
    welcomeLabel.textContent = `Log in to get started`;
    appContainer.style.opacity = "0";
  }
});

let sorted = true;

sortButton.addEventListener("click", function () {
  sortButton.blur();
  sorted
    ? renderMovements(foundAccount.transactions.slice().sort((a, b) => a.value - b.value))
    : renderMovements(foundAccount.transactions);
  sorted = !sorted;
});
