document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async(event) => {
        event.preventDefault();

        const form_data = new FormData(form);
        const authMsg = document.getElementById('authMsg');

        //get form input
        const email = form_data.get('email');
        const password = form_data.get('password');

        //submit the data to localhost:3000
        const route_name = 'http://localhost:3000/api/login';
        try {
            const response = await fetch(route_name, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, password})
            });

            //check if all went well
            const data = await response.json();
            console.log(data);

            if(!response.ok) {
                authMsg.textContent = `Error: ${data.message || 'invalid username or password'}`;
                authMsg.style.color = 'red';
            } else {
                authMsg.textContent = `${data.message || 'logged in successful, Redirecting...'}`;
                authMsg.style.color = 'green';
                form.reset();

                   // Redirect after a short delay
                   setTimeout(() => {
                    window.location.replace('/dashboard') // Redirect to the dashboard
                }, 2000); 
            }

        } catch (error) {
            authMsg.textContent = `Error: ${error.message}`;
            authMsg.style.color = 'red';
        }
    })
})