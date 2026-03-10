// Load students when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
});

// Register new student
function registerStudent() {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    
    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            form.reset();
            loadStudents();
        }
    })
    .catch(error => {
        showMessage('Error: ' + error.message, 'error');
    });
}

// Load all students
function loadStudents() {
    fetch('/students')
    .then(response => response.json())
    .then(students => {
        const tbody = document.getElementById('studentsList');
        tbody.innerHTML = '';
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.first_name} ${student.last_name}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>${student.course}</td>
                <td>${student.semester}</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewStudent(${student.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        showMessage('Error loading students: ' + error.message, 'error');
    });
}

// View student details
function viewStudent(id) {
    fetch(`/student/${id}`)
    .then(response => response.json())
    .then(student => {
        const details = `
            Student Details:
            Name: ${student.first_name} ${student.last_name}
            Email: ${student.email}
            Phone: ${student.phone}
            Date of Birth: ${student.date_of_birth}
            Gender: ${student.gender}
            Course: ${student.course}
            Semester: ${student.semester}
            Address: ${student.address}, ${student.city}, ${student.state} ${student.zip_code}, ${student.country}
        `;
        alert(details);
    })
    .catch(error => {
        showMessage('Error viewing student: ' + error.message, 'error');
    });
}

// Edit student
function editStudent(id) {
    fetch(`/student/${id}`)
    .then(response => response.json())
    .then(student => {
        // Populate form with student data
        document.getElementById('first_name').value = student.first_name;
        document.getElementById('last_name').value = student.last_name;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        document.getElementById('date_of_birth').value = student.date_of_birth;
        document.getElementById('gender').value = student.gender;
        document.getElementById('address').value = student.address;
        document.getElementById('city').value = student.city;
        document.getElementById('state').value = student.state;
        document.getElementById('zip_code').value = student.zip_code;
        document.getElementById('country').value = student.country;
        document.getElementById('course').value = student.course;
        document.getElementById('semester').value = student.semester;
        
        // Change form submission to update
        const form = document.getElementById('studentForm');
        form.onsubmit = function(e) {
            e.preventDefault();
            updateStudent(id);
        };
        
        // Change submit button text
        document.querySelector('.btn-submit').innerHTML = '<i class="fas fa-save"></i> Update Student';
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
        showMessage('Error loading student for edit: ' + error.message, 'error');
    });
}

// Update student
function updateStudent(id) {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    
    fetch(`/student/${id}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            // Reset form to registration mode
            resetForm();
            loadStudents();
        }
    })
    .catch(error => {
        showMessage('Error: ' + error.message, 'error');
    });
}

// Delete student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        fetch(`/student/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            showMessage(data.message, data.success ? 'success' : 'error');
            if (data.success) {
                loadStudents();
            }
        })
        .catch(error => {
            showMessage('Error: ' + error.message, 'error');
        });
    }
}

// Reset form to registration mode
function resetForm() {
    const form = document.getElementById('studentForm');
    form.reset();
    form.onsubmit = function(e) {
        e.preventDefault();
        registerStudent();
    };
    document.querySelector('.btn-submit').innerHTML = '<i class="fas fa-paper-plane"></i> Register Student';
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Add reset button handler
document.querySelector('.btn-reset').addEventListener('click', function() {
    resetForm();
});