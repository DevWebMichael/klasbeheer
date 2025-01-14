// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, push, onValue, remove, set, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAM1tSOHVaorTbCH1iiADdbZBuIxtqJCbk",
  authDomain: "klasbeheer.firebaseapp.com",
  databaseURL: "https://klasbeheer-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "klasbeheer",
  storageBucket: "klasbeheer.firebasestorage.app",
  messagingSenderId: "573161343925",
  appId: "1:573161343925:web:5eb7f6408e9441276fa7fc",
  measurementId: "G-1340LLBD63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
window.database = getDatabase(app);
console.log('Firebase initialized:', window.database);

// Get a reference to the database
console.log('Database reference created');

// Login Form Functionality
if (document.getElementById('loginForm')) {
    console.log('Login form found');
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const classNumber = document.getElementById('classNumber').value;
        console.log('Class number submitted:', classNumber);

        try {
            // Check if class exists and has students
            const studentsRef = ref(window.database, 'klassen/' + classNumber + '/students');
            console.log('Fetching students from:', studentsRef.toString()); // Debugging log
            const snapshot = await get(studentsRef);

            if (snapshot.exists() && Object.keys(snapshot.val()).length > 0) {
                // Class exists and has students, redirect to class page
                console.log('Class has existing students, redirecting to class page');
                window.location.href = 'class_page.html?class=' + classNumber;
            } else {
                // Class doesn't exist or has no students, redirect to add students page
                console.log('Class has no students, redirecting to add students page');
                window.location.href = 'add_students.html?class=' + classNumber;
            }
        } catch (error) {
            console.error('Error checking class:', error);
            alert('Error checking class. Please try again.');
        }
    });
}

// Add Students Page Functionality
if (document.getElementById('addStudentForm')) {
    console.log('Add student form found');
    
    // Add students form handler
    document.getElementById('addStudentForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const studentNamesInput = document.getElementById('studentName').value;
        const classNumber = new URLSearchParams(window.location.search).get('class');
        
        // Split the input by semicolons and remove any whitespace
        const studentNames = studentNamesInput.split(';').map(name => name.trim()).filter(name => name.length > 0);
        
        console.log('Attempting to add students:', studentNames, 'to class:', classNumber);
        
        try {
            const studentsRef = ref(window.database, 'klassen/' + classNumber + '/students');
            console.log('Adding students to:', studentsRef.toString()); // Debugging log
            
            // Add each student to the database
            for (const studentName of studentNames) {
                await push(studentsRef, {
                    name: studentName
                });
                console.log('Added student:', studentName);
            }
            
            console.log('All students added successfully!');
            document.getElementById('studentName').value = '';
            alert(`Successfully added ${studentNames.length} students!`);
        } catch (error) {
            console.error('Error adding students:', error);
            alert('Error adding students. Please try again.');
        }
    });

    // View Students button handler
    document.getElementById('viewStudentsButton').addEventListener('click', function() {
        const classNumber = new URLSearchParams(window.location.search).get('class');
        window.location.href = 'view_students.html?class=' + classNumber;
    });

    // Go to Class Page button handler
    document.getElementById('submitStudents').addEventListener('click', function() {
        const classNumber = new URLSearchParams(window.location.search).get('class');
        window.location.href = 'class_page.html?class=' + classNumber;
    });
}

// View Students Page Functionality
if (document.getElementById('studentsList')) {
    console.log('Students list found');
    const classNumber = new URLSearchParams(window.location.search).get('class');
    const studentsList = document.getElementById('studentsList');

    // Fetch and display students
    const studentsRef = ref(window.database, 'klassen/' + classNumber + '/students');
    console.log('Fetching students from:', studentsRef.toString()); // Debugging log
    onValue(studentsRef, (snapshot) => {
        console.log('Database response:', snapshot.val());
        studentsList.innerHTML = ''; // Clear existing students
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const studentId = childSnapshot.key;
                const student = childSnapshot.val();
                const div = document.createElement('div');
                div.className = 'student-card';
                
                // Get first letter of student name for avatar
                const firstLetter = student.name.charAt(0).toUpperCase();
                
                div.innerHTML = `
                    <div class="student-info">
                        <div class="student-avatar">${firstLetter}</div>
                        <span class="student-name">${student.name}</span>
                    </div>
                    <div class="student-actions">
                        <button class="delete-button" onclick="deleteStudent('${studentId}')">
                            Delete
                        </button>
                    </div>
                `;
                if (div instanceof HTMLElement) {
                    studentsList.appendChild(div);
                    console.log('Appended student card:', div); // Debugging log
                } else {
                    console.error('Invalid node:', div); // Debugging log
                }
            });
        } else {
            studentsList.innerHTML = '<div class="empty-state">Nog geen leerlingen toegevoegd.</div>';
        }
    });

    // Delete student function
    window.deleteStudent = async function(studentId) {
        try {
            const studentRef = ref(window.database, `klassen/${classNumber}/students/${studentId}`);
            console.log('Deleting student from:', studentRef.toString()); // Debugging log
            await remove(studentRef);
            console.log('Student deleted successfully');
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student. Please try again.');
        }
    };

    // Back button handler
    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = 'add_students.html?class=' + classNumber;
    });

    // Class Page button handler
    document.getElementById('classPageButton').addEventListener('click', function() {
        window.location.href = 'class_page.html?class=' + classNumber;
    });
}

// Class Page Functionality
if (document.getElementById('studentsTable')) {
    console.log('Students table found');
    const classNumber = new URLSearchParams(window.location.search).get('class');
    const studentsRef = ref(window.database, `klassen/${classNumber}/students`);

    // Function to create table headers
    async function createTableHeaders() {
        const headerRow = document.querySelector('#studentsTable thead tr');
        headerRow.innerHTML = '';
        const cornersRef = ref(window.database, `klassen/${classNumber}/Hoeken`);
        const cornersSnapshot = await get(cornersRef);
        const corners = cornersSnapshot.exists() ? cornersSnapshot.val() : {};

        const nameHeader = document.createElement('th');
        nameHeader.textContent = 'Leerling';
        headerRow.appendChild(nameHeader);

        for (const cornerName of Object.values(corners)) {
            const th = document.createElement('th');
            const span = document.createElement('span');
            span.textContent = cornerName;
            th.appendChild(span);
            headerRow.appendChild(th);
        }
    }

    // Fetch and display students
    function displayStudents() {
        const studentsBody = document.getElementById('studentsBody');
        let isUpdating = false;

        onValue(studentsRef, (snapshot) => {
            if (isUpdating) return; // Skip refresh if updating
            const currentRows = {};
            studentsBody.querySelectorAll('tr').forEach(row => {
                const studentId = row.querySelector('td').dataset.studentId;
                currentRows[studentId] = row;
            });

            if (snapshot.exists()) {
                const cornersRef = ref(window.database, `klassen/${classNumber}/Hoeken`);
                get(cornersRef).then(cornersSnapshot => {
                    const corners = cornersSnapshot.exists() ? cornersSnapshot.val() : {};
                    snapshot.forEach(childSnapshot => {
                        const studentId = childSnapshot.key;
                        const studentData = childSnapshot.val();
                        if (currentRows[studentId]) {
                            // Update existing row
                            const row = currentRows[studentId];
                            Object.keys(corners).forEach(cornerId => {
                                const td = row.querySelector(`td[data-corner="${cornerId}"]`);
                                if (studentData.activeCorners && studentData.activeCorners[cornerId]) {
                                    td.classList.add('active');
                                } else {
                                    td.classList.remove('active');
                                }
                            });
                        } else {
                            // Create new row
                            const row = createStudentRow(studentId, studentData, corners);
                            studentsBody.appendChild(row);
                        }
                    });
                });
            } else {
                studentsBody.innerHTML = '<tr><td colspan="100%">No students found.</td></tr>';
            }
        });

        function createStudentRow(studentId, studentData, corners) {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = studentData.name;
            row.appendChild(nameCell);

            for (const cornerId of Object.keys(corners)) {
                const td = document.createElement('td');
                td.className = 'play-corner';
                td.dataset.corner = cornerId;
                td.dataset.studentId = studentId;
                if (studentData.activeCorners && studentData.activeCorners[cornerId]) {
                    td.classList.add('active');
                }
                td.addEventListener('click', async function() {
                    const isActive = td.classList.toggle('active');
                    const studentRef = ref(window.database, `klassen/${classNumber}/students/${studentId}`);
                    const updates = { [`activeCorners/${cornerId}`]: isActive };
                    isUpdating = true;
                    await update(studentRef, updates);
                    isUpdating = false;
                });
                row.appendChild(td);
            }
            return row;
        }
    }

    // Initialize page
    createTableHeaders();
    displayStudents();

    // Reset button functionality
    document.getElementById('resetButton').addEventListener('click', async function() {
        if (confirm('Are you sure you want to reset all play corners?')) {
            const studentsSnapshot = await get(studentsRef);
            
            if (studentsSnapshot.exists()) {
                const updates = {};
                studentsSnapshot.forEach((childSnapshot) => {
                    const studentId = childSnapshot.key;
                    updates[`${studentId}/activeCorners`] = null;
                });
                
                try {
                    await update(studentsRef, updates);
                    console.log('Reset all play corners successfully');
                } catch (error) {
                    console.error('Error resetting play corners:', error);
                    alert('Error resetting play corners. Please try again.');
                }
            }
        }
    });

    // Students button functionality
    document.getElementById('studentsButton').addEventListener('click', function() {
        window.location.href = 'add_students.html?class=' + classNumber;
    });
}
