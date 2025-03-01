// Your web app's Firebase configuration
// REPLACE WITH YOUR FIREBASE CONFIG FROM CONSOLE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
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
        document.querySelector('.container').style.display = 'flex';
    }
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

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? 
        timestamp : 
        new Date(timestamp.seconds * 1000);
    
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
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
