document.addEventListener('DOMContentLoaded', (event) => {

    const register_button = document.getElementById('register_button');
    const login_button = document.getElementById('logIn_button');

    register_button.addEventListener('click', () => {
        window.location.href = '/register';
    });

    login_button.addEventListener('click', () => {
        window.location.href = '/login';
    });

});
