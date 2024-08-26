document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const form_data = new FormData(form);
        const authMsg = document.getElementById('authMsg');

        // Get input data from form
        const email = form_data.get('email');
        const username = form_data.get('username');
        const password = form_data.get('password');
        const confirm_password = form_data.get('confirm_password');

        //chech for password match
        if (password !== confirm_password) {
            alert("PASSWORD DO NOT MUCH!")
            return;
        }

        // Submit data to backend
        const route_name = 'http://localhost:3000/api/register';
        try {
            const response = await fetch(route_name, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username, password })
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                authMsg.textContent = `Error: ${data.message || 'User exists, please log in'}`;
                authMsg.style.color = 'red';
            } else {
                authMsg.textContent = `${data.message ||  'Registration successful! Redirecting...'}`;
                authMsg.style.color = 'green';
                form.reset();  // Reset the form

                //redirect to log in page.
                setTimeout(() => {
                    window.location.replace("/login");
                }, 2000);
            }
        } catch (error) {
            authMsg.textContent = `Error: ${error.message}`;
            authMsg.style.color = 'red';
        }
    });
});
