document.addEventListener('DOMContentLoaded', function() {
    const addStudentBtn = document.getElementById('add-student');
    const studentModal = document.getElementById('student-modal');
    const studentForm = document.getElementById('student-form');
    const courseFilter = document.getElementById('course-filter');
    const locationFilter = document.getElementById('location-filter');
    
    // Open modal for adding new student
    addStudentBtn.addEventListener('click', () => {
        studentForm.reset();
        document.getElementById('student-id').value = '';
        studentModal.style.display = 'block';
    });
    
    // Form submission
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const studentData = {
            id: document.getElementById('student-id').value || Date.now().toString(),
            name: document.getElementById('student-name').value,
            age: document.getElementById('student-age').value,
            course: document.getElementById('student-course').value,
            location: document.getElementById('student-location').value,
            phone: document.getElementById('student-phone').value,
            email: document.getElementById('student-email').value,
            joinDate: new Date().toISOString().split('T')[0]
        };
        
        const result = await postSheetData('Students', studentData);
        if (result && result.success) {
            alert('Student saved successfully!');
            studentModal.style.display = 'none';
            loadStudents();
        } else {
            alert('Error saving student. Please try again.');
        }
    });
    
    // Load students on page load and when filters change
    courseFilter.addEventListener('change', loadStudents);
    locationFilter.addEventListener('change', loadStudents);
    loadStudents();
});

// Load and display students
async function loadStudents() {
    const courseFilter = document.getElementById('course-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    
    const students = await fetchSheetData('Students');
    if (!students) return;
    
    // Filter students
    let filteredStudents = students;
    if (courseFilter !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.course === courseFilter);
    }
    if (locationFilter !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.location === locationFilter);
    }
    
    // Display students
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${getCourseName(student.course)}</td>
            <td>${getLocationName(student.location)}</td>
            <td>${formatDate(student.joinDate)}</td>
            <td>
                <button class="btn btn-primary edit-student" data-id="${student.id}">Edit</button>
                <button class="btn btn-danger delete-student" data-id="${student.id}">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-student').forEach(btn => {
        btn.addEventListener('click', async () => {
            const studentId = btn.getAttribute('data-id');
            await editStudent(studentId);
        });
    });
    
    document.querySelectorAll('.delete-student').forEach(btn => {
        btn.addEventListener('click', async () => {
            const studentId = btn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this student?')) {
                const result = await deleteStudent(studentId);
                if (result && result.success) {
                    loadStudents();
                }
            }
        });
    });
}

// Helper functions
function getCourseName(courseKey) {
    const courses = {
        junior: 'Junior (6-8)',
        senior: 'Senior (8-11)',
        advanced: 'Advanced (12-18)'
    };
    return courses[courseKey] || courseKey;
}

function getLocationName(locationKey) {
    const locations = {
        online: 'Online',
        office_1: 'Office 1',
        office_2: 'Office 2'
    };
    return locations[locationKey] || locationKey;
}

async function editStudent(studentId) {
    const students = await fetchSheetData('Students');
    const student = students.find(s => s.id === studentId);
    
    if (student) {
        document.getElementById('student-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-age').value = student.age;
        document.getElementById('student-course').value = student.course;
        document.getElementById('student-location').value = student.location;
        document.getElementById('student-phone').value = student.phone || '';
        document.getElementById('student-email').value = student.email || '';
        
        document.getElementById('student-modal').style.display = 'block';
    }
}

async function deleteStudent(studentId) {
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteData',
                sheetName: 'Students',
                id: studentId
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting student:', error);
        return null;
    }
}