document.addEventListener('DOMContentLoaded', () => {
    // Get element buttons and form
    const go_to_dashboard = document.getElementById('to_dashboard');
    const go_to_update = document.getElementById('to_update');
    const go_to_delete = document.getElementById('to_delete');
    const go_to_view = document.getElementById('to_view');

    // Create redirection to the pages
    go_to_dashboard.addEventListener('click', () => {
        window.location.href = '/dashboard';
    });

    go_to_update.addEventListener('click', () => { 
        window.location.href = '/update_expenses';
    });

    go_to_delete.addEventListener('click', () => {
        window.location.href = '/delete_expenses';
    });

    go_to_view.addEventListener('click', () => {
        window.location.href = '/view_expenses';
    });


    //route to fetch expense_categories and display it
    const category_list = document.getElementById('category_list_display');

    async function fetchCategories() {
        try {
            const response = await fetch('/api/expenses/expense_categories');
            const expenses = await response.json();

            if(response.ok) {
                expenses.forEach(expense => {
                    const list = document.createElement('li');
                    list.textContent = expense.category;

                    category_list.appendChild(list);
                })
            }
        } catch (error) {
            const list = document.createElement('li');
            list.textContent = 'Error while trying to fetch categories';
            list.style.color = 'darkred';
            list.style.fontSize = 24 + 'px';

            category_list.appendChild(list, error);
        }
    }
    //calling the function
    fetchCategories();


    // Handling the add_expenses_form
    const form = document.getElementById('add_expenses_form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const form_data = new FormData(form);

        // Get form input
        const expense_category = form_data.get('expense_category');
        const expense_name = form_data.get('expense_name');
        const expense_amount = form_data.get('expense_amount');
        const expense_description = form_data.get('expense_description');
        const expense_date = form_data.get('expense_date');

        // Check for amount to be a number
        if (isNaN(expense_amount) || expense_amount <= 0) {
            alert('The amount should be a positive number without letters or special characters!');
            return;
        }

        // Submit data to the server
        try {
            // Define port number
            const port = 'http://localhost:3000/api/expenses/add_expenses';
            const response = await fetch(port, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    expense_category,
                    expense_name,
                    expense_amount,
                    expense_description,
                    expense_date
                })
            });

            const data = await response.json();

            // Alert user if adding expenses was successful or not
            if (!response.ok) {
                alert(data.message || 'Could not add expense');
            } else {
                alert('Expense added successfully');
                form.reset();
            }
        } catch (error) {
            alert(error.message || 'internal server error!');
        }
    });
});
