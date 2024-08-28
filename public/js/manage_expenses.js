document.addEventListener('DOMContentLoaded', () => {
    // Get element buttons and form
    const go_to_dashboard = document.getElementById('to_dashboard');
    const go_to_add = document.getElementById('to_add');
    const go_to_view = document.getElementById('to_view');

    // Create redirection to the pages
    go_to_dashboard.addEventListener('click', () => {
        window.location.href = '/dashboard';
    });

    go_to_add.addEventListener('click', () => {
        window.location.href = '/add_expenses';
    });

    go_to_view.addEventListener('click', () => {
        window.location.href = '/view_expenses';
    });

    const tableBody = document.querySelector('#expenses-table tbody');

    // Fetch expenses from the server
    fetch('/api/expenses/view_expenses')
        .then(response => response.json())
        .then(expenses => {
            expenses.forEach(expense => {
                // Create a new row
                const row = document.createElement('tr');

                // Create and append cells
                row.innerHTML = `
                    <td>${expense.category}</td>
                    <td>${expense.name}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.date}</td>
                    <td>
                        <button class="update-btn" data-id="${expense.id}">Update</button>
                        <button class="delete-btn" data-id="${expense.id}">Delete</button>
                    </td>
                `;

                // Append the row to the table body
                tableBody.appendChild(row);
            });

            // Add event listeners to all update buttons
            document.querySelectorAll('.update-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const expenseId = event.target.getAttribute('data-id');

                    // Fetch the expense details for the selected ID
                    fetch(`/api/expenses/view_expenses`)
                        .then(response => response.json())
                        .then(expense => {
                            // Prompt for new details
                            let category, name, amount, date;

                            // Prompt for new category
                            category = prompt('Enter new category:', expense.category);
                            if (category === null) {
                                return; // Exit if canceled
                            }
                            
                            // Prompt for new name
                            name = prompt('Enter new name:', expense.name);
                            if (name === null) {
                                return; // Exit if canceled
                            }
                            
                            // Prompt for new amount
                            amount = prompt('Enter new amount:', expense.amount);
                            if (amount === null || isNaN(amount)) {
                                alert('Invalid amount. Please enter a numeric value.');
                                return; // Exit if canceled or invalid
                            }
                            
                            // Prompt for new date
                            date = prompt('Enter new date (YYYY-MM-DD):', expense.date);
                            if (date === null) {
                                return; // Exit if canceled
                            }

                            // Date validator function
                            function isValidDate(dateString) {
                                const regex = /^\d{4}-\d{2}-\d{2}$/;
                                if (!dateString.match(regex)) {
                                    return false; // Format is incorrect
                                }
                                const date = new Date(dateString);
                                return date instanceof Date && !isNaN(date.getTime());
                            }

                            if (!isValidDate(date)) {
                                alert('Invalid date format. Please enter a date in YYYY-MM-DD format.');
                                return; // Exit if date is invalid
                            }

                            // Send updated data to the server
                            fetch(`/api/expenses/update_expenses/${expenseId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    category: category,
                                    name: name,
                                    amount: parseFloat(amount),
                                    date: date
                                })
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (result.message === 'Expense updated successfully') {
                                    alert('Expense updated successfully!');
                                    // Refresh the page to show updated data
                                    location.reload();
                                } else {
                                    alert('Failed to update the expense');
                                }
                            })
                            .catch(error => console.error('Error updating expense:', error));
                        })
                        .catch(error => console.error('Error fetching expense details:', error));
                });
            });

            // Add event listeners to all delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const expenseId = event.target.getAttribute('data-id');

                    if (confirm('Are you sure you want to delete this expense?')) {
                        // Send delete request to the server
                        fetch(`/api/expenses/delete_expenses/${expenseId}`, {
                            method: 'DELETE'
                        })
                        .then(response => {
                            if (response.ok) {
                                alert('Expense deleted successfully!');
                                // Remove the row from the table
                                event.target.closest('tr').remove();
                            } else {
                                alert('Failed to delete the expense');
                            }
                        })
                        .catch(error => console.error('Error deleting expense:', error));
                    }
                });
            });
        })
        .catch(error => console.error('Error fetching expenses:', error));
});
