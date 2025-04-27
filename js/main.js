// Google Sheets configuration
const scriptURL = 'https://script.google.com/macros/s/AKfycby8Uqlbrsi5nIBxLAGLmbja-_ddJYr8-wm8Gqp_M6jc-lyyJs4E5cC0oa4dLE_VcKkZ/exec'; // Replace with your deployed Apps Script URL
const spreadsheetId = '1QPK38xxTQ3sR9qYwvcFaqbxx0bN07CpRGIjSMniPHrk'; // Replace with your Google Sheet ID

// Common functions for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Load data based on current page
    const path = window.location.pathname.split('/').pop();
    if (path === 'index.html' || path === '') {
        loadDashboardData();
    }
});

// Function to fetch data from Google Sheets
async function fetchSheetData(sheetName) {
    try {
        const response = await fetch(`${scriptURL}?action=getData&sheetName=${sheetName}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return null;
    }
}

// Function to post data to Google Sheets
async function postSheetData(sheetName, data) {
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'postData',
                sheetName: sheetName,
                data: data
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error posting to sheet:', error);
        return null;
    }
}

// Load dashboard data
async function loadDashboardData() {
    // Fetch student data
    const students = await fetchSheetData('Students');
    if (students) {
        document.getElementById('total-students').textContent = students.length;
        
        // Calculate distribution
        const juniorCount = students.filter(s => s.course === 'junior').length;
        const seniorCount = students.filter(s => s.course === 'senior').length;
        const advancedCount = students.filter(s => s.course === 'advanced').length;
        
        // Update chart
        updateStudentChart(juniorCount, seniorCount, advancedCount);
    }
    
    // Fetch instructor data
    const instructors = await fetchSheetData('Instructors');
    if (instructors) {
        // Calculate total salaries
        let totalSalaries = 0;
        instructors.forEach(instructor => {
            totalSalaries += parseFloat(instructor.totalSalary) || 0;
        });
        document.getElementById('total-salaries').textContent = `$${totalSalaries.toFixed(2)}`;
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}