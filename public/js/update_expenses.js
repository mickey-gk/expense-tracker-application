document.addEventListener('DOMContentLoaded', () => {

       // Get element buttons and form
       const go_to_dashboard = document.getElementById('to_dashboard');
       const go_to_add = document.getElementById('to_add');
       const go_to_delete = document.getElementById('to_delete');
       const go_to_view = document.getElementById('to_view');
   
       // Create redirection to the pages
       go_to_dashboard.addEventListener('click', () => {
           window.location.href = '/dashboard';
       });
   
       go_to_add.addEventListener('click', () => { 
           window.location.href = '/add_expenses';
       });
   
       go_to_delete.addEventListener('click', () => {
           window.location.href = '/delete_expenses';
       });
   
       go_to_view.addEventListener('click', () => {
           window.location.href = '/view_expenses';
       });
    const tableBody = document.querySelector('#expenses-table tbody');
    

    // Fetch expenses from the server
    fetch('/api/expenses') // Adjust the URL to match your API endpoint
        .then(response => response.json())
        .then(expenses => {
            expenses.forEach(expense => {
                // Create a new row
                const row = document.createElement('tr');

                // Create and append cells
                row.innerHTML = `
                    <td>${expense.id}</td>
                    <td>${expense.description}</td>
                    <td>${expense.amount}</td>
                    <td>${expense.date}</td>
                    <td><button class="update-btn" data-id="${expense.id}">Update</button></td>
                `;

                // Append the row to the table body
                tableBody.appendChild(row);
            });

            // Add event listeners to all update buttons
            document.querySelectorAll('.update-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const expenseId = event.target.getAttribute('data-id');
                    
                    // Fetch the expense details for the selected ID
                    fetch(`/api/expenses/${expenseId}`)
                        .then(response => response.json())
                        .then(expense => {
                            // Prompt for new details
                            const description = prompt('Enter new description:', expense.description);
                            const amount = prompt('Enter new amount:', expense.amount);
                            const date = prompt('Enter new date (YYYY-MM-DD):', expense.date);

                            // Validate inputs
                            if (description && amount && date) {
                                // Send updated data to the server
                                fetch('/api/update_expense', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        id: expenseId,
                                        description: description,
                                        amount: parseFloat(amount),
                                        date: date
                                    })
                                })
                                .then(response => response.json())
                                .then(result => {
                                    // Update the table row with new data
                                    event.target.parentElement.previousElementSibling.textContent = description;
                                    event.target.parentElement.previousElementSibling.previousElementSibling.textContent = amount;
                                    event.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent = date;
                                })
                                .catch(error => console.error('Error updating expense:', error));
                            }
                        })
                        .catch(error => console.error('Error fetching expense details:', error));
                });
            });
        })
        .catch(error => console.error('Error fetching expenses:', error));
});
