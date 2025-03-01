// Your web app's Firebase configuration
// REPLACE WITH YOUR FIREBASE CONFIG FROM CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyB5aoLFrL9GgG1KDTz47JWl8H_TGvTOj00",
    authDomain: "my-second-home-daycare.firebaseapp.com",
    projectId: "my-second-home-daycare",
    storageBucket: "my-second-home-daycare.appspot.com",
    messagingSenderId: "1066792337580",
    appId: "1:1066792337580:web:8b3d733c5fbf0d5c09f022"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Check authentication status and redirect if not logged in
auth.onAuthStateChanged(user => {
    if (!user && !window.location.href.includes('login.html')) {
        // Redirect to login page if not logged in and not already on login page
        window.location.href = 'login.html';
    } else if (user) {
        // Show user info if logged in
        const userDisplayElement = document.getElementById('user-display');
        if (userDisplayElement) {
            // Get user data from Firestore
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        userDisplayElement.textContent = userData.name || user.email;
                    } else {
                        userDisplayElement.textContent = user.email;
                    }
                })
                .catch(error => {
                    console.error("Error getting user data:", error);
                    userDisplayElement.textContent = user.email;
                });
        }
        
        // Make main content visible if logged in
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'flex';
        }
        
        // Load data for the application
        loadApplicationData();
    }
});

// Load application data from Firestore
function loadApplicationData() {
    // Load children data
    loadChildren();
    
    // Load Quran students
    loadQuranStudents();
}

// Load registered children
function loadChildren() {
    const tableBody = document.querySelector('#registration table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Get children from Firestore
    db.collection('children').orderBy('registrationDate', 'desc').get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No children registered yet');
                return;
            }
            
            let childCount = 0;
            
            snapshot.forEach(doc => {
                const child = doc.data();
                childCount++;
                
                // Calculate age
                let age = '';
                if (child.dob) {
                    age = calculateAge(child.dob) + ' years';
                }
                
                // Create table row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${child.name || ''}</td>
                    <td>${age}</td>
                    <td>${child.parentName || ''}</td>
                    <td>${child.phone || ''}</td>
                    <td>${formatDate(child.registrationDate)}</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${doc.id}" data-collection="children"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Update dashboard count
            const totalChildrenElement = document.querySelector('.dashboard-cards .card:first-child .card-value');
            if (totalChildrenElement) {
                totalChildrenElement.textContent = childCount;
            }
            
            // Update dashboard recent registrations
            updateRecentRegistrations(snapshot);
        })
        .catch(error => {
            console.error("Error loading children:", error);
        });
}

// Update recent registrations on dashboard
function updateRecentRegistrations(snapshot) {
    const recentRegistrationsTable = document.querySelector('#recent-registrations tbody');
    if (!recentRegistrationsTable) return;
    
    // Clear existing rows
    recentRegistrationsTable.innerHTML = '';
    
    // Get the 3 most recent registrations
    const recentChildren = snapshot.docs.slice(0, 3);
    
    recentChildren.forEach(doc => {
        const child = doc.data();
        
        // Calculate age
        let age = '';
        if (child.dob) {
            age = calculateAge(child.dob) + ' years';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${child.name || ''}</td>
            <td>${age}</td>
            <td>${formatDate(child.registrationDate)}</td>
            <td>
                <button class="action-btn view-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
            </td>
        `;
        
        recentRegistrationsTable.appendChild(row);
    });
}

// Load Quran students
function loadQuranStudents() {
    // All students table
    const allStudentsTable = document.querySelector('#all-students tbody');
    if (!allStudentsTable) return;
    
    // Clear existing rows
    allStudentsTable.innerHTML = '';
    
    // Level tables
    const beginnerTable = document.querySelector('#beginner-level tbody');
    const intermediateTable = document.querySelector('#intermediate-level tbody');
    const advancedTable = document.querySelector('#advanced-level tbody');
    
    if (beginnerTable) beginnerTable.innerHTML = '';
    if (intermediateTable) intermediateTable.innerHTML = '';
    if (advancedTable) advancedTable.innerHTML = '';
    
    // Get quran students from Firestore
    db.collection('quranStudents').orderBy('registrationDate', 'desc').get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No Quran students registered yet');
                return;
            }
            
            let studentCount = 0;
            let totalRevenue = 0;
            
            snapshot.forEach(doc => {
                const student = doc.data();
                studentCount++;
                
                // Add to total revenue
                if (student.monthlyFee) {
                    totalRevenue += parseFloat(student.monthlyFee);
                }
                
                // Create table row
                const row = createQuranStudentRow(student, doc.id);
                
                // Add to all students table
                if (allStudentsTable) {
                    allStudentsTable.appendChild(row.cloneNode(true));
                }
                
                // Add to level-specific table
                if (student.level === 'beginner' && beginnerTable) {
                    beginnerTable.appendChild(row.cloneNode(true));
                } else if (student.level === 'intermediate' && intermediateTable) {
                    intermediateTable.appendChild(row.cloneNode(true));
                } else if (student.level === 'advanced' && advancedTable) {
                    advancedTable.appendChild(row.cloneNode(true));
                }
            });
            
            // Update student count and revenue
            const totalStudentsElement = document.querySelector('.summary-cards .card:first-child .card-value');
            const monthlyRevenueElement = document.querySelector('.summary-cards .card:last-child .card-value');
            
            if (totalStudentsElement) {
                totalStudentsElement.textContent = studentCount;
            }
            
            if (monthlyRevenueElement) {
                monthlyRevenueElement.textContent = '$' + totalRevenue;
            }
        })
        .catch(error => {
            console.error("Error loading Quran students:", error);
        });
}

// Create a row for a Quran student
function createQuranStudentRow(student, docId) {
    const row = document.createElement('tr');
    
    // Get progress data
    let progress = student.progress || 0;
    let progressColor = 'var(--primary-color)';
    
    if (student.level === 'intermediate') {
        progressColor = 'var(--blue-color)';
    } else if (student.level === 'advanced') {
        progressColor = 'var(--green-color)';
    }
    
    row.innerHTML = `
        <td>${student.name || ''}</td>
        <td>${student.age ? student.age + ' years' : ''}</td>
        <td>${student.currentSurah || ''}</td>
        <td>
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%; background-color: ${progressColor};"></div>
            </div>
            <span>${progress}%</span>
        </td>
        <td>${student.teacher || ''}</td>
        <td>$${student.monthlyFee || '0'}</td>
        <td>
            <button class="action-btn view-btn" data-id="${docId}"><i class="fas fa-eye"></i></button>
            <button class="action-btn edit-btn" data-id="${docId}"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-btn" data-id="${docId}" data-collection="quranStudents"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    return row;
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Child registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const childData = {
                name: document.getElementById('child-name').value,
                dob: document.getElementById('child-dob').value,
                parentName: document.getElementById('parent-name').value,
                phone: document.getElementById('parent-phone').value,
                email: document.getElementById('parent-email').value || '',
                registrationDate: new Date(),
                emergencyContact: document.getElementById('emergency-contact').value || '',
                relationship: document.getElementById('relationship').value || '',
                medicalInfo: document.getElementById('medical-info').value || '',
                notes: document.getElementById('additional-notes').value || ''
            };
            
            // Save to Firestore
            db.collection('children').add(childData)
                .then(() => {
                    showNotification('Child registered successfully!');
                    registrationForm.reset();
                    
                    // Reload children data
                    loadChildren();
                })
                .catch(error => {
                    console.error("Error adding child:", error);
                    showNotification('Error registering child. Please try again.');
                });
        });
    }
    
    // Quran registration form
    const quranRegistrationForm = document.getElementById('quran-registration-form');
    if (quranRegistrationForm) {
        quranRegistrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Calculate progress based on level
            const quranLevel = document.getElementById('quran-level').value;
            let progress;
            
            if (quranLevel === 'beginner') {
                progress = Math.floor(Math.random() * 20) + 10; // 10-30%
            } else if (quranLevel === 'intermediate') {
                progress = Math.floor(Math.random() * 20) + 30; // 30-50%
            } else {
                progress = Math.floor(Math.random() * 30) + 50; // 50-80%
            }
            
            // Get form data
            const studentData = {
                name: document.getElementById('student-full-name').value,
                age: document.getElementById('student-age').value,
                parentName: document.getElementById('parent-guardian-name').value || '',
                phone: document.getElementById('contact-number').value || '',
                email: document.getElementById('email-address').value || '',
                registrationDate: new Date(),
                level: quranLevel,
                currentSurah: document.getElementById('current-surah').value,
                teacher: document.getElementById('quran-teacher').value === 'mohammed' ? 'Mohammed (Quran Teacher)' : '',
                classDays: getSelectedOptions('class-days'),
                classTime: document.getElementById('class-time').value || '',
                monthlyFee: document.getElementById('monthly-fee').value,
                paymentMethod: document.getElementById('payment-method').value || '',
                paymentStatus: document.getElementById('payment-status').value || '',
                notes: document.getElementById('special-requirements').value || '',
                progress: progress
            };
            
            // Save to Firestore
            db.collection('quranStudents').add(studentData)
                .then(() => {
                    showNotification('Quran student registered successfully!');
                    quranRegistrationForm.reset();
                    
                    // Reload Quran students data
                    loadQuranStudents();
                })
                .catch(error => {
                    console.error("Error adding Quran student:", error);
                    showNotification('Error registering Quran student. Please try again.');
                });
        });
    }
    
    // Delete functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            const deleteBtn = e.target.closest('.delete-btn');
            const docId = deleteBtn.getAttribute('data-id');
            const collection = deleteBtn.getAttribute('data-collection') || 'children';
            
            if (confirm('Are you sure you want to delete this record?')) {
                // Delete from Firestore
                db.collection(collection).doc(docId).delete()
                    .then(() => {
                        showNotification('Record deleted successfully!');
                        
                        // Reload data
                        if (collection === 'children') {
                            loadChildren();
                        } else if (collection === 'quranStudents') {
                            loadQuranStudents();
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting document:", error);
                        showNotification('Error deleting record. Please try again.');
                    });
            }
        }
    });
    
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContainer = this.closest('.tab-container');
            
            // Update active tab
            tabContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show active tab pane
            tabContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Navigation
    const navItems = document.querySelectorAll('.nav-item:not(#logout-btn)');
    const sections = document.querySelectorAll('section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            if (!sectionId) return;
            
            // Update active navigation
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Show active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });
});

// Logout functionality
const logoutButton = document.getElementById('logout-btn');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error("Error signing out:", error);
                showNotification('Error signing out. Please try again.');
            });
    });
}

// Helper function to get selected options from a multi-select
function getSelectedOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return [];
    
    const result = [];
    const options = select && select.options;
    
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
            result.push(options[i].value);
        }
    }
    
    return result;
}

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return '';
    
    let date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (timestamp.seconds) {
        // Firestore timestamp
        date = new Date(timestamp.seconds * 1000);
    } else {
        // Try to parse as string
        date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
        return '';
    }
    
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Calculate age from date of birth
function calculateAge(dob) {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
        return '';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Global notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
