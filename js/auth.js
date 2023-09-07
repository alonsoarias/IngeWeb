// Función para obtener información del sitio y del usuario
async function getUserInfo(token) {
    try {
        const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
            method: 'POST',
            body: new URLSearchParams({
                'wstoken': token,
                'wsfunction': 'core_webservice_get_site_info',
                'moodlewsrestformat': 'json'
            })
        });

        const data = await response.json();
        return data.userid; // Retornar el ID del usuario
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
    }
}

// Función para iniciar sesión
async function login(username, password) {
    const data = {
        username: username,
        password: password,
        service: 'moodle_mobile_app' // Este es un servicio comúnmente usado en Moodle para la autenticación móvil
    };

    try {
        const response = await fetch(`${MOODLE_URL}/login/token.php`, {
            method: 'POST',
            body: new URLSearchParams(data)
        });

        const result = await response.json();
        
        if (result.token) {
            // Almacenar el token de forma segura
            localStorage.setItem('userToken', result.token);

            // Obtener y almacenar el ID del usuario
            const userId = await getUserInfo(result.token);
            if (userId) {
                localStorage.setItem('userId', userId);
            }

            return true; // Inicio de sesión exitoso
        } else {
            console.error('No se pudo obtener el token del usuario:', result.error);
            return false; // Fallo en el inicio de sesión
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return false; // Fallo en el inicio de sesión
    }
}

// Evento para manejar el formulario de inicio de sesión
document.querySelector('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    const loggedIn = await login(username, password);

    if (loggedIn) {
        // Redirigir a la página de cursos
        window.location.href = 'courses.html';
    } else {
        alert('Error al iniciar sesión. Por favor, inténtelo otra vez.');
    }
});
