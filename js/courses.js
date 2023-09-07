document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        alert('Por favor, inicie sesión primero.');
        window.location.href = 'index.html';
        return;
    }

    const offlineCourses = localStorage.getItem('courses');
    if (!navigator.onLine && offlineCourses) {
        const courses = JSON.parse(offlineCourses);
        displayCourses(courses, token);
        return;
    }

    try {
        const serverurl = `${MOODLE_URL}/webservice/rest/server.php`;
        const params = new URLSearchParams({
            'wstoken': token,
            'wsfunction': 'core_enrol_get_users_courses',
            'moodlewsrestformat': 'json',
            'userid': userId
        });

        const response = await fetch(serverurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        const courses = await response.json();

        if (courses.errorcode) {
            throw new Error(courses.message);
        }

        localStorage.setItem('courses', JSON.stringify(courses));
        displayCourses(courses, token);

    } catch (error) {
        console.error('Error al obtener los cursos:', error);
        alert('Error al obtener los cursos: ' + error.message);
    }
});

function displayCourses(courses, token) {
    const courseList = document.getElementById('courseList');
    if (courses.length === 0) {
        courseList.innerHTML = '<li class="list-group-item">No estás matriculado en ningún curso.</li>';
    } else {
        courses.forEach(course => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            // Nombre del curso
            const courseName = document.createElement('span');
            courseName.textContent = course.fullname;
            li.appendChild(courseName);

            // Botón "Acceder"
            const accessButton = document.createElement('a');
            accessButton.href = `${MOODLE_URL}/course/view.php?id=${course.id}`;
            accessButton.target = "_blank"; // Esto hará que se abra en una nueva pestaña
            accessButton.className = 'btn btn-primary ml-3';
            accessButton.textContent = 'Acceder';
            li.appendChild(accessButton);

            // Botón "Ver Contenido"
            const viewContentButton = document.createElement('a');
            viewContentButton.href = `courseContent.html?courseId=${course.id}`;
            viewContentButton.className = 'btn btn-secondary ml-3';
            viewContentButton.textContent = 'Ver Contenido';
            li.appendChild(viewContentButton);

            courseList.appendChild(li);
        });
    }
}

// Función para manejar el cierre de sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
});

