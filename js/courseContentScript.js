document.addEventListener('DOMContentLoaded', async function() {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    const token = localStorage.getItem('userToken');

    if (!token || !courseId) {
        alert('Por favor, inicie sesión o seleccione un curso.');
        window.location.href = 'courses.html';
        return;
    }

    try {
        const courseContents = await getCourseContents(courseId, token);
        displayCourseContents(courseContents, token, courseId);
    } catch (error) {
        console.error('Error al obtener el contenido del curso:', error);
        alert('Error al obtener el contenido del curso: ' + error.message);
    }
});

async function getCourseContents(courseId, token) {
    const serverurl = `${MOODLE_URL}/webservice/rest/server.php`;
    const params = new URLSearchParams({
        'wstoken': token,
        'wsfunction': 'core_course_get_contents',
        'moodlewsrestformat': 'json',
        'courseid': courseId
    });

    const response = await fetch(serverurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    });

    const data = await response.json();
    if (data.errorcode) {
        throw new Error(data.message);
    }

    return data;
}

async function getUrlActivity(courseId, token) {
    const serverurl = `${MOODLE_URL}/webservice/rest/server.php`;
    const params = new URLSearchParams({
        'wstoken': token,
        'wsfunction': 'mod_url_get_urls_by_courses',
        'moodlewsrestformat': 'json'
    });
    params.append('courseids[]', courseId);

    const response = await fetch(serverurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    });

    const data = await response.json();
    if (data.errorcode) {
        throw new Error(data.message);
    }

    return data.urls;
}

function displayCourseContents(contents, token, courseId) {
    const contentDiv = document.getElementById('courseContent');
    contents.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mb-4';

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = section.name;
        sectionDiv.appendChild(sectionTitle);

        const activitiesList = document.createElement('ul');
        section.modules.forEach(async module => {
            const activityItem = document.createElement('li');
            activityItem.textContent = module.name;

            if (module.modname === 'url') {
                const externalUrls = await getUrlActivity(courseId, token);
                const moduleUrl = externalUrls.find(url => url.id === module.instance);
                if (moduleUrl) {
                    const collapseButton = document.createElement('button');
                    collapseButton.textContent = "Ver contenido";
                    collapseButton.className = "btn btn-link btn-sm";
                    collapseButton.setAttribute("data-bs-toggle", "collapse");
                    collapseButton.setAttribute("data-bs-target", `#collapse${module.id}`);
                    activityItem.appendChild(collapseButton);

                    const iframeDiv = document.createElement('div');
                    iframeDiv.className = "collapse";
                    iframeDiv.id = `collapse${module.id}`;
                    const iframe = document.createElement('iframe');
                    iframe.src = moduleUrl.externalurl;
                    iframe.width = "100%";
                    iframe.height = "600px";
                    iframeDiv.appendChild(iframe);
                    activityItem.appendChild(iframeDiv);
                }
            }

            activitiesList.appendChild(activityItem);
        });

        sectionDiv.appendChild(activitiesList);
        contentDiv.appendChild(sectionDiv);
    });
}
