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

})