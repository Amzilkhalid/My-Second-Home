<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Second Home - Login</title>
    <style>
        /* Use the same color scheme as your main app */
        :root {
            --primary-color: #FF6B6B;
            --secondary-color: #4ECDC4;
            --accent-color: #FFD166;
            --background-color: #F7FFF7;
            --text-color: #2D3748;
            --purple-color: #9C6ADE;
            --blue-color: #5B8AF9;
            --green-color: #7ED957;
            --pink-color: #FF71CE;
        }
        
        body {
            background-color: var(--background-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        
        .login-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        
        .logo {
            text-align: center;
            font-size: 28px;
            margin-bottom: 20px;
            color: var(--primary-color);
            font-weight: bold;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        button:hover {
            background-color: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        
        .error {
            color: red;
            font-size: 14px;
            margin-top: 10px;
            text-align: center;
        }
        
        .register-link {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
        }
        
        .register-link a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .register-link a:hover {
            text-decoration: underline;
        }
        
        .app-description {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">My Second Home</div>
        <div id="login-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password">
            </div>
            <button id="login-button">Login</button>
            <div id="error-message" class="error"></div>
            <div class="register-link">
                <a href="#" id="register-toggle">Don't have an account? Register</a>
            </div>
        </div>
        
        <div id="register-form" style="display: none;">
            <div class="form-group">
                <label for="reg-name">Full Name</label>
                <input type="text" id="reg-name" placeholder="Enter your full name">
            </div>
            <div class="form-group">
                <label for="reg-email">Email</label>
                <input type="email" id="reg-email" placeholder="Enter your email">
            </div>
            <div class="form-group">
                <label for="reg-password">Password</label>
                <input type="password" id="reg-password" placeholder="Create a password">
            </div>
            <button id="register-button">Register</button>
            <div id="reg-error-message" class="error"></div>
            <div class="register-link">
                <a href="#" id="login-toggle">Already have an account? Login</a>
            </div>
        </div>
        
        <div class="app-description">
            Daycare Management System for staff members
        </div>
    </div>

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

    <script>
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCsGBl8yIxKquh-QCN1F5NUa7hF4TLyhA8",
            authDomain: "my-second-home-cfd9e.firebaseapp.com",
            projectId: "my-second-home-cfd9e",
            storageBucket: "my-second-home-cfd9e.firebasestorage.app",
            messagingSenderId: "483174288185",
            appId: "1:483174288185:web:e80973c72f97e7319a36e8",
            measurementId: "G-8V7JRGXC45"
        };
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize services
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // References
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginButton = document.getElementById('login-button');
        const registerButton = document.getElementById('register-button');
        const registerToggle = document.getElementById('register-toggle');
        const loginToggle = document.getElementById('login-toggle');
        const errorMessage = document.getElementById('error-message');
        const regErrorMessage = document.getElementById('reg-error-message');
        
        // Toggle between login and register forms
        registerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
        
        loginToggle.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
        
        // Login functionality
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                errorMessage.textContent = "Please enter both email and password";
                return;
            }
            
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
            
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    // Redirect to main app page
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    errorMessage.textContent = error.message;
                    loginButton.disabled = false;
                    loginButton.textContent = "Login";
                });
        });
        
        // Registration functionality
        registerButton.addEventListener('click', () => {
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            if (!name || !email || !password) {
                regErrorMessage.textContent = "Please fill in all fields";
                return;
            }
            
            if (password.length < 6) {
                regErrorMessage.textContent = "Password must be at least 6 characters";
                return;
            }
            
            registerButton.disabled = true;
            registerButton.textContent = "Registering...";
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    // Store additional user info in Firestore
                    return db.collection('users').doc(cred.user.uid).set({
                        name: name,
                        email: email,
                        role: 'staff',  // Default role
                        createdAt: new Date()
                    });
                })
                .then(() => {
                    // Redirect to main app
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    regErrorMessage.textContent = error.message;
                    registerButton.disabled = false;
                    registerButton.textContent = "Register";
                });
        });
        
        // Check if user is already logged in
        auth.onAuthStateChanged(user => {
            if (user) {
                window.location.href = 'index.html';
            }
        });
        
        // Handle enter key press
        document.getElementById('email').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('password').focus();
            }
        });
        
        document.getElementById('password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginButton.click();
            }
        });
        
        document.getElementById('reg-name').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('reg-email').focus();
            }
        });
        
        document.getElementById('reg-email').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('reg-password').focus();
            }
        });
        
        document.getElementById('reg-password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                registerButton.click();
            }
        });
    </script>
</body>
</html>
