// Function to create the bar chart
export function createBarChart(labels, data) {
    const bar_chart = document.getElementById('bar_chart');
    return new Chart(bar_chart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: [
                    'rgba(10, 225, 60, .6)',
                    'rgba(20, 100, 50, .6',
                    'rgba(100, 20, 200, 0.6',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)'

                ],
                data: data
            }]
        },
        options: {
            responsive: true, // Makes the chart responsive
            maintainAspectRatio: false, // Allows the chart to fill the container
            title: {
                display: true,
                text: 'Expenses by Category'
            }
        }
    });
}

// Function to create the pie chart
export function createPieChart(labels, data) {
    const pie_chart = document.getElementById('pie_chart');
    return new Chart(pie_chart, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ]
            }]
        },
        options: {
            responsive: true, // Makes the chart responsive
            maintainAspectRatio: false, // Allows the chart to fill the container
            title: {
                display: true,
                text: 'Expenses Distribution'
            }
        }
    });
}
