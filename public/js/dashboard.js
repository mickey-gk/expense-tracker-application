import { createBarChart, createPieChart } from '/js/charts.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the logout button element
    const log_out_button = document.getElementById('log_out_button');
    
    // Add click event listener to the logout button
    log_out_button.addEventListener('click', async () => {
        // Ask for confirmation before logging out
        const confirmation = confirm("ARE YOU SURE YOU WANT TO LOG OUT?");
        
        if (confirmation) {
            // Redirect to the login page if confirmed
            window.location.replace('/login');
        }
    });

    // Fetch expense data for charts
    fetch('/api/expenses/sum-by-category')
        .then(response => response.json())
        .then(data => {
            const { categories, amounts } = data;
            // Create the bar chart using the fetched data
            createBarChart(categories, amounts);
            // Create the pie chart using the fetched data
            createPieChart(categories, amounts);
        })
        .catch(error => console.error('Error fetching chart data:', error));

    // Fetch and display the username
    fetch('/api/username_details')
    .then(response => response.json())
    .then(data => {
        const usernameElement = document.getElementById('this_caption');
        if (data.username) {
            usernameElement.textContent = `Welcome, ${data.username}`;
        } else {
            usernameElement.textContent = 'Error loading username';
        }
    })
    .catch(error => {
        console.error('Error fetching username:', error);
        document.getElementById('this_caption').textContent = 'Error loading username';
    });

   // Route to delete account
    const delete_account = document.getElementById('delete_account');
    delete_account.addEventListener('click', async () => {
        const confirm_del = confirm('Are you sure you want to delete your account!');
        if(confirm_del) {
            try {
                const response = await fetch('/api/user/delete_account', {
                    method: 'DELETE'
                });
    
                if (response.ok) {
                    // Account deletion was successful
                    alert('Account deleted successfully.');
                    // Redirect to the homepage or another page
                    window.location.href = '/';
                } else {
                    // Handle server errors
                    const errorMessage = await response.text();
                    alert(`Error: ${errorMessage}`);
                }
            } catch (error) {
                // Handle network errors
                alert(`Network Error: ${error.message}`);
            }
        }

    });

});
