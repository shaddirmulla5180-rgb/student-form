// Load students when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
});

// Register new student
function registerStudent() {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    const submitBtn = document.querySelector('.btn-submit');
    
    // Disable button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    
    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(handleResponse)
    .then(data => {
        showMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            form.reset();
            loadStudents();
        }
    })
    .catch(error => {
        showMessage('Error: ' + error.message, 'error');
        console.error('Registration error:', error);
    })
    .finally(() => {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Register Student';
    });
}

// Handle fetch response
function handleResponse(response) {
    return response.text().then(text => {
        try {
            // Try to parse as JSON
            const data = JSON.parse(text);
            return data;
        } catch (err) {
            // If not JSON, throw error with response text
            console.error('Response is not JSON:', text);
            throw new Error('Server returned invalid response. Please check the console for details.');
        }
    });
}

// Load all students
function loadStudents() {
    const tbody = document.getElementById('studentsList');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading students...</td></tr>';
    
    fetch('/students')
    .then(handleResponse)
    .then(students => {
        tbody.innerHTML = '';
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No students registered yet.</td></tr>';
            return;
        }
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id || 'N/A'}</td>
                <td>${escapeHtml(student.first_name || '')} ${escapeHtml(student.last_name || '')}</td>
                <td>${escapeHtml(student.email || '')}</td>
                <td>${escapeHtml(student.phone || '')}</td>
                <td>${escapeHtml(student.course || '')}</td>
                <td>${escapeHtml(student.semester || '')}</td>
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error loading students.</td></tr>';
        console.error('Load students error:', error);
    });
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// View student details
function viewStudent(id) {
    if (!id) return;
    
    fetch(`/student/${id}`)
    .then(handleResponse)
    .then(student => {
        const details = `
            👤 Student Details:
            
            Name: ${student.first_name || ''} ${student.last_name || ''}
            📧 Email: ${student.email || ''}
            📞 Phone: ${student.phone || ''}
            🎂 Date of Birth: ${student.date_of_birth || ''}
            ⚥ Gender: ${student.gender || ''}
            
            📚 Academic Information:
            Course: ${student.course || ''}
            Semester: ${student.semester || ''}
            
            📍 Address:
            ${student.address || ''}, ${student.city || ''}
            ${student.state || ''} ${student.zip_code || ''}
            ${student.country || ''}
            
            📅 Enrolled: ${student.enrollment_date || ''}
        `;
        alert(details);
    })
    .catch(error => {
        showMessage('Error viewing student: ' + error.message, 'error');
        console.error('View student error:', error);
    });
}

// Edit student
function editStudent(id) {
    if (!id) return;
    
    fetch(`/student/${id}`)
    .then(handleResponse)
    .then(student => {
        // Populate form with student data
        document.getElementById('first_name').value = student.first_name || '';
        document.getElementById('last_name').value = student.last_name || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('phone').value = student.phone || '';
        document.getElementById('date_of_birth').value = student.date_of_birth || '';
        document.getElementById('gender').value = student.gender || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('city').value = student.city || '';
        document.getElementById('state').value = student.state || '';
        document.getElementById('zip_code').value = student.zip_code || '';
        document.getElementById('country').value = student.country || '';
        document.getElementById('course').value = student.course || '';
        document.getElementById('semester').value = student.semester || '';
        
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
        console.error('Edit student error:', error);
    });
}

// Update student
function updateStudent(id) {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    const submitBtn = document.querySelector('.btn-submit');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    fetch(`/student/${id}`, {
        method: 'PUT',
        body: formData
    })
    .then(handleResponse)
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
        console.error('Update error:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
    });
}

// Delete student
function deleteStudent(id) {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        fetch(`/student/${id}`, {
            method: 'DELETE'
        })
        .then(handleResponse)
        .then(data => {
            showMessage(data.message, data.success ? 'success' : 'error');
            if (data.success) {
                loadStudents();
            }
        })
        .catch(error => {
            showMessage('Error: ' + error.message, 'error');
            console.error('Delete error:', error);
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
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.style.opacity = '1';
        }, 300);
    }, 5000);
}

// Add reset button handler
document.querySelector('.btn-reset').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Reset form? All entered data will be lost.')) {
        resetForm();
    }
});

// Add form validation
document.getElementById('studentForm').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('date_of_birth').value;
    
    // Basic email validation
    if (email && !email.includes('@')) {
        e.preventDefault();
        showMessage('Please enter a valid email address', 'error');
        return false;
    }
    
    // Basic phone validation (at least 10 digits)
    if (phone && phone.replace(/\D/g, '').length < 10) {
        e.preventDefault();
        showMessage('Please enter a valid phone number with at least 10 digits', 'error');
        return false;
    }
    
    // Age validation (must be at least 16 years old)
    if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (age < 16 || (age === 16 && monthDiff < 0)) {
            e.preventDefault();
            showMessage('Student must be at least 16 years old', 'error');
            return false;
        }
    }
});