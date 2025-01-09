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
console.log('Firebase initialized');

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
                            Pas klas aan
                        </button>
                    </div>
                `;
                studentsList.appendChild(div);
            });
        } else {
            studentsList.innerHTML = '<div class="empty-state">Nog geen leerlingen toegevoegd.</div>';
        }
    });

    // Delete student function
    window.deleteStudent = async function(studentId) {
        try {
            const studentRef = ref(window.database, `klassen/${classNumber}/students/${studentId}`);
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
    const studentsRef = ref(window.database, 'klassen/' + classNumber + '/students');

    // Function to create table headers
    function createTableHeaders() {
        const headerRow = document.querySelector('#studentsTable thead tr');
        headerRow.innerHTML = ''; // Clear existing headers
        
        // Add student name header
        const nameHeader = document.createElement('th');
        nameHeader.innerHTML = `<span>Student Name</span>`;
        headerRow.appendChild(nameHeader);
        
        // Add corner headers
        for (let i = 1; i <= 8; i++) {
            const th = document.createElement('th');
            th.innerHTML = `<span>Play Corner ${i}</span>`;
            headerRow.appendChild(th);
        }
    }

    // Create headers
    createTableHeaders();

    // Function to create table row for a student
    function createStudentRow(studentId, studentData) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${studentData.name}</td>`;
        
        // Add play corners (1-8)
        for (let i = 1; i <= 8; i++) {
            const td = document.createElement('td');
            td.className = 'play-corner';
            td.dataset.corner = i;
            td.dataset.studentId = studentId;
            
            // Check if this corner is active for this student
            if (studentData.activeCorners && studentData.activeCorners[i]) {
                td.classList.add('active');
            }
            
            td.addEventListener('click', async function() {
                const isActive = td.classList.toggle('active');
                
                // Update the database with the new active status
                const studentRef = ref(window.database, `klassen/${classNumber}/students/${studentId}`);
                const updates = {
                    [`activeCorners/${i}`]: isActive
                };
                
                try {
                    await update(studentRef, updates);
                    console.log(`Updated corner ${i} status to ${isActive} for student ${studentId}`);
                } catch (error) {
                    console.error('Error updating corner status:', error);
                    // Revert the visual change if the database update fails
                    td.classList.toggle('active');
                }
            });
            
            row.appendChild(td);
        }
        return row;
    }

    // Listen for changes in the students data
    onValue(studentsRef, (snapshot) => {
        console.log('Database response:', snapshot.val());
        const studentsBody = document.getElementById('studentsBody');
        studentsBody.innerHTML = ''; // Clear existing rows
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const studentId = childSnapshot.key;
                const studentData = childSnapshot.val();
                const row = createStudentRow(studentId, studentData);
                studentsBody.appendChild(row);
            });
        }
    });

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
