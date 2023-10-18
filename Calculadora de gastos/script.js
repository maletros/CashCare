document.addEventListener("DOMContentLoaded", function () {
    const expenseInput = document.getElementById("expense-input");
    const amountInput = document.getElementById("amount-input");
    const categoryInput = document.getElementById("category-input");
    const addExpenseButton = document.getElementById("add-expense");
    const expenseList = document.getElementById("expense-list");
    const totalExpenses = document.getElementById("total-expenses");
    const initialMoneyInput = document.getElementById("initial-money");
    const updateButton = document.getElementById("update-money");
    const totalMoney = document.getElementById("total-money");
    const expenseChart = document.getElementById("expense-chart").getContext("2d");
    const filterCategory = document.getElementById("filter-category");
    const filterSorting = document.getElementById("filter-sorting");

    // Adicione uma estrutura de dados para rastrear as despesas por categoria
    const expenseCategoryData = {};

    let expenses = [];
    let money = 0;
    let expenseLabels = [];
    let expenseData = [];

    const chart = new Chart(expenseChart, {
        type: "bar",
        data: {
            labels: expenseLabels,
            datasets: [
                {
                    label: "Despesas",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    data: expenseData,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    // Adicione uma variável para o gráfico de pizza
    const pieChart = new Chart(document.getElementById("pie-chart").getContext("2d"), {
        type: "pie",
        data: {
            labels: [], // Adicione rótulos das categorias aqui
            datasets: [
                {
                    data: [], // Adicione dados das categorias aqui
                    backgroundColor: [], // Adicione cores das categorias aqui
                },
            ],
        },
    });

    updateButton.addEventListener("click", function () {
        const initialMoney = parseFloat(initialMoneyInput.value);
        if (!isNaN(initialMoney)) {
            money = initialMoney;
            totalMoney.innerText = `Saldo: R$ ${money.toFixed(2)}`;
        }
    });

    addExpenseButton.addEventListener("click", function () {
        const expenseName = expenseInput.value;
        const expenseAmount = parseFloat(amountInput.value);
        const expenseCategory = categoryInput.value;

        if (expenseName && !isNaN(expenseAmount)) {
            const expense = {
                name: expenseName,
                amount: expenseAmount,
                category: expenseCategory,
            };

            // Atualize a estrutura de dados da categoria de despesas
            if (expenseCategory in expenseCategoryData) {
                expenseCategoryData[expenseCategory] += expenseAmount;
            } else {
                expenseCategoryData[expenseCategory] = expenseAmount;
            }

            expenses.push(expense);
            expenseLabels.push(expense.name);
            expenseData.push(expense.amount);
            updateExpenses();
            updatePieChart(); // Atualize o gráfico de pizza
            clearInputs();
            money -= expenseAmount;
            totalMoney.innerText = `Saldo: R$ ${money.toFixed(2)}`;
        }
    });

    // Adicione uma função para atualizar o gráfico de pizza
    function updatePieChart() {
        const categoryLabels = Object.keys(expenseCategoryData);
        const categoryData = Object.values(expenseCategoryData);
        const backgroundColors = generateRandomColors(categoryLabels.length);

        pieChart.data.labels = categoryLabels;
        pieChart.data.datasets[0].data = categoryData;
        pieChart.data.datasets[0].backgroundColor = backgroundColors;
        pieChart.update();
    }

    // Adicione uma função para gerar cores aleatórias para as categorias
    function generateRandomColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(getRandomColor());
        }
        return colors;
    }

    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function updateExpenses() {
        expenseList.innerHTML = "";
        total = 0;

        // Aplicar filtros
        const selectedCategory = filterCategory.value;
        const sortingOption = filterSorting.value;

        let filteredExpenses = expenses;

        if (selectedCategory !== "Todas") {
            filteredExpenses = expenses.filter(expense => expense.category === selectedCategory);
        }

        if (sortingOption === "Valor Crescente") {
            filteredExpenses.sort((a, b) => a.amount - b.amount);
        } else if (sortingOption === "Valor Decrescente") {
            filteredExpenses.sort((a, b) => b.amount - a.amount);
        }

        filteredExpenses.forEach((expense, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span>${expense.name} (Categoria: ${expense.category})</span>
                <span>R$ ${expense.amount.toFixed(2)}</span>
                <button onclick="deleteExpense(${index})">Excluir</button>
            `;
            expenseList.appendChild(listItem);

            total += expense.amount;
        });

        totalExpenses.innerText = `Total Despesas: R$ ${total.toFixed(2)}`;
        chart.update();
    }

    function clearInputs() {
        expenseInput.value = "";
        amountInput.value = "";
        categoryInput.value = "Alimentação";
    }

    window.deleteExpense = function (index) {
        if (index >= 0 && index < expenses.length) {
            // Atualize a estrutura de dados da categoria de despesas ao excluir uma despesa
            const deletedExpense = expenses[index];
            if (deletedExpense.category in expenseCategoryData) {
                expenseCategoryData[deletedExpense.category] -= deletedExpense.amount;
            }
            expenses.splice(index, 1);
            expenseLabels.splice(index, 1);
            expenseData.splice(index, 1);
            updateExpenses();
            updatePieChart(); // Atualize o gráfico de pizza
            totalMoney.innerText = `Saldo: R$ ${money.toFixed(2)}`;
        }
    };
});