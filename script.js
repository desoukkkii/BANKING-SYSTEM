let currentBalance = 1247.89;
let transactions = [];

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function updateBalanceUI() {
    const balanceElement = document.getElementById('balanceDisplay');
    balanceElement.textContent = formatCurrency(currentBalance);
}

function addTransaction(type, amount, recipient = null) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString();
    let description = '';
    let detailText = '';

    if (type === 'deposit') {
        description = `Deposit`;
        detailText = `+ ${formatCurrency(amount)} · ${dateString} ${timeString}`;
    } else if (type === 'withdraw') {
        description = `Withdrawal`;
        detailText = `- ${formatCurrency(amount)} · ${dateString} ${timeString}`;
    } else if (type === 'transfer') {
        description = `Transfer to ${recipient || 'external account'}`;
        detailText = `Sent ${formatCurrency(amount)} · ${dateString} ${timeString} → ${recipient || 'saved contact'}`;
    }

    const transaction = {
        id: Date.now() + Math.random(),
        type: type,
        amount: amount,
        description: description,
        detail: detailText,
        timestamp: now,
        recipient: recipient
    };
    transactions.unshift(transaction);
    if (transactions.length > 12) transactions.pop();
    renderTransactions();
}

function renderTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-transaction">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
                <span>Use the actions above</span>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    transactions.forEach(tx => {
        const txDiv = document.createElement('div');
        let amountClass = 'amount-positive';
        let sign = '+';
        let borderType = 'transaction-deposit';

        if (tx.type === 'withdraw') {
            amountClass = 'amount-negative';
            sign = '-';
            borderType = 'transaction-withdraw';
        } else if (tx.type === 'transfer') {
            amountClass = 'amount-negative';
            sign = '-';
            borderType = 'transaction-transfer';
        } else {
            borderType = 'transaction-deposit';
        }

        txDiv.className = `transaction-item ${borderType}`;
        txDiv.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-type">${tx.description}</div>
                <div class="transaction-detail">${tx.detail}</div>
            </div>
            <div class="transaction-amount ${amountClass}">${sign}${formatCurrency(tx.amount)}</div>
        `;
        container.appendChild(txDiv);
    });
}

function deposit(amount) {
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount.');
        return false;
    }
    currentBalance += amount;
    updateBalanceUI();
    addTransaction('deposit', amount);
    return true;
}

function withdraw(amount) {
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount.');
        return false;
    }
    if (amount > currentBalance) {
        alert(`Insufficient funds. Your current balance is ${formatCurrency(currentBalance)}`);
        return false;
    }
    currentBalance -= amount;
    updateBalanceUI();
    addTransaction('withdraw', amount);
    return true;
}

function transfer(amount, recipient) {
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount.');
        return false;
    }
    if (!recipient || recipient.trim() === '') {
        alert('Please specify a recipient account or email.');
        return false;
    }
    if (amount > currentBalance) {
        alert(`Transfer failed. Insufficient balance. Available: ${formatCurrency(currentBalance)}`);
        return false;
    }
    currentBalance -= amount;
    updateBalanceUI();
    addTransaction('transfer', amount, recipient.trim());
    return true;
}

function resetSystem() {
    const confirmReset = confirm('Reset all transactions and restore default balance? This action cannot be undone.');
    if (confirmReset) {
        currentBalance = 1247.89;
        transactions = [];
        updateBalanceUI();
        renderTransactions();
        alert('Account has been reset to default state (Balance: $1,247.89)');
    }
}

let activeAction = null;
const modal = document.getElementById('actionModal');
const modalTitle = document.getElementById('modalTitle');
const transferField = document.getElementById('transferField');
const amountInput = document.getElementById('amountInput');
const recipientInput = document.getElementById('recipientInput');
const transactionForm = document.getElementById('transactionForm');

function openModal(action) {
    activeAction = action;
    amountInput.value = '';
    recipientInput.value = '';
    if (action === 'transfer') {
        modalTitle.innerText = 'Send Money';
        transferField.classList.remove('hidden');
        recipientInput.required = true;
    } else if (action === 'deposit') {
        modalTitle.innerText = 'Add Funds';
        transferField.classList.add('hidden');
        recipientInput.required = false;
    } else if (action === 'withdraw') {
        modalTitle.innerText = 'Cash Withdrawal';
        transferField.classList.add('hidden');
        recipientInput.required = false;
    }
    modal.style.display = 'flex';
    amountInput.focus();
}

function closeModal() {
    modal.style.display = 'none';
    activeAction = null;
    transactionForm.reset();
    transferField.classList.add('hidden');
}

function handleConfirm() {
    let rawAmount = amountInput.value;
    let amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than zero.');
        return;
    }

    if (activeAction === 'deposit') {
        deposit(amount);
        closeModal();
    } else if (activeAction === 'withdraw') {
        withdraw(amount);
        closeModal();
    } else if (activeAction === 'transfer') {
        let recipient = recipientInput.value.trim();
        transfer(amount, recipient);
        closeModal();
    }
}

document.getElementById('depositBtn').addEventListener('click', () => openModal('deposit'));
document.getElementById('withdrawBtn').addEventListener('click', () => openModal('withdraw'));
document.getElementById('transferBtn').addEventListener('click', () => openModal('transfer'));
document.getElementById('resetBtn').addEventListener('click', resetSystem);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleConfirm();
});

updateBalanceUI();
if (transactions.length === 0) {
    const starterTransactions = [
        { type: 'deposit', amount: 1250.00, description: 'Direct Deposit', detail: '+ $1,250.00 · Payroll' },
        { type: 'withdraw', amount: 52.11, description: 'Withdrawal', detail: '- $52.11 · Groceries' }
    ];
    if (starterTransactions.length > 0) {
        currentBalance = 1247.89;
        transactions = [];
        transactions.push({
            id: Date.now() + 1,
            type: 'deposit',
            amount: 1250.00,
            description: 'Direct Deposit · Payroll',
            detail: '+ $1,250.00 · Payroll · just now',
            timestamp: new Date()
        });
        transactions.push({
            id: Date.now() + 2,
            type: 'withdraw',
            amount: 52.11,
            description: 'Grocery Store',
            detail: '- $52.11 · Card transaction',
            timestamp: new Date()
        });
        currentBalance = 1247.89;
        updateBalanceUI();
        renderTransactions();
    }
}