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
});
