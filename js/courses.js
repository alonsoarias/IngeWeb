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
        courseList.innerHTML = '<div class="alert alert-info">No estás matriculado en ningún curso.</div>';
    } else {
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'card mb-3';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Nombre del curso
            const courseName = document.createElement('h5');
            courseName.className = 'card-title';
            courseName.textContent = course.fullname;
            cardBody.appendChild(courseName);

            // Botón "Acceder"
            const accessButton = document.createElement('a');
            accessButton.href = `${MOODLE_URL}/course/view.php?id=${course.id}`;
            accessButton.target = "_blank";
            accessButton.className = 'btn btn-primary';
            accessButton.textContent = 'Acceder';
            cardBody.appendChild(accessButton);

            // Botón "Ver Contenido"
            const viewContentButton = document.createElement('a');
            viewContentButton.href = `courseContent.html?courseId=${course.id}`;
            viewContentButton.className = 'btn btn-secondary ml-3';
            viewContentButton.textContent = 'Ver Contenido';
            cardBody.appendChild(viewContentButton);

            card.appendChild(cardBody);
            courseList.appendChild(card);
        });
    }
}


// Función para manejar el cierre de sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
});

