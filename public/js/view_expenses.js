document.addEventListener('DOMContentLoaded', () => {
    // Get element buttons and form
    const go_to_dashboard = document.getElementById('to_dashboard');
    const go_to_add = document.getElementById('to_add');
    const go_to_manage = document.getElementById('to_manage');

    // Create redirection to the pages
    go_to_dashboard.addEventListener('click', () => {
        window.location.href = '/dashboard';
    });

    go_to_add.addEventListener('click', () => { 
        window.location.href = '/add_expenses';
    });

    go_to_manage.addEventListener('click', () => {
        window.location.href = '/manage_expenses';
    });

    // Fetch and display expenses
    const expensesTable = document.getElementById('expenses-table-body');

    async function fetchExpenses() {
        try {
            const response = await fetch('/api/expenses/view_expenses');
            const expenses = await response.json();

            if (response.ok) {
                expenses.forEach(expense => {
                    const row = document.createElement('tr');

                    const categoryCell = document.createElement('td');
                    categoryCell.textContent = expense.category;
                    row.appendChild(categoryCell);

                    const nameCell = document.createElement('td');
                    nameCell.textContent = expense.name;
                    row.appendChild(nameCell);

                    const amountCell = document.createElement('td');
                    amountCell.textContent = `$${expense.amount}`;
                    row.appendChild(amountCell);

                    const dateCell = document.createElement('td');
                    dateCell.textContent = expense.date;
                    row.appendChild(dateCell);

                    const descriptionCell = document.createElement('td');
                    descriptionCell.textContent = expense.description || 'No description';
                    row.appendChild(descriptionCell);

                    expensesTable.appendChild(row);
                });
            } else {
                console.error('Failed to fetch expenses:', expenses.error);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    }

    // Call the function to fetch and display expenses
    fetchExpenses();
});
