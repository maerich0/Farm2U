/* =========================================
   Object: AuthManager
   Description: Manages user login, signup, and sessions
   ========================================= */
const AuthManager = {
    
    /* -------------------------------------
       Function: getCurrentUser
       Description: Returns the currently logged in user object
       ------------------------------------- */
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    /* -------------------------------------
       Function: isLoggedIn
       Description: Checks if a user session is active
       ------------------------------------- */
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    /* -------------------------------------
       Function: login
       Description: Validates credentials and starts session
       ------------------------------------- */
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const sessionUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            localStorage.setItem('currentUser', JSON.stringify(sessionUser));
            localStorage.setItem('isLoggedIn', 'true');
            return true;
        }
        return false;
    },

    /* -------------------------------------
       Function: signup
       Description: Creates a new user account
       ------------------------------------- */
    signup(name, email, password, role) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) return false; 

        const id = role === 'farmer' ? 'frm_' + Date.now() : Date.now().toString();

        const newUser = {
            id: id,
            name: name,
            email: email,
            password: password,
            role: role,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        this.login(email, password);
        return true;
    },

    /* -------------------------------------
       Function: logout
       Description: Ends session and redirects to home
       ------------------------------------- */
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    },

    /* -------------------------------------
       Function: checkLoginStatus
       Description: Updates Navbar UI based on login state
       ------------------------------------- */
    checkLoginStatus() {
        const user = this.getCurrentUser();
        const userBtn = document.getElementById('user-btn'); 
        
        if (userBtn && user) {
            let iconClass = 'ri-user-fill';
            if (user.role === 'farmer') iconClass = 'ri-plant-fill';
            if (user.role === 'business') iconClass = 'ri-briefcase-fill';
            
            userBtn.innerHTML = `<i class="${iconClass}"></i>`;
            userBtn.title = `Dashboard (${user.name})`;
            userBtn.removeAttribute('href');
            userBtn.style.cursor = 'pointer';

            const newBtn = userBtn.cloneNode(true);
            userBtn.parentNode.replaceChild(newBtn, userBtn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof DashboardManager !== 'undefined') {
                    DashboardManager.open();
                }
            });
        }
    }
};

/* =========================================
   Event: DOMContentLoaded
   Description: Initializes Auth page specific UI logic
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Run Global Checks
    AuthManager.checkLoginStatus();

    // 2. Auth Page Form Logic
    const authForm = document.getElementById('authForm');
    
    if (authForm) {
        let isLogin = true;
        let currentRole = 'consumer';

        const formTitle = document.getElementById('formTitle');
        const btnText = document.getElementById('btnText');
        const toggleText = document.getElementById('toggleText');
        const signupFields = document.getElementById('signupFields');
        const errorEl = document.getElementById('emailError');
        const roleBtns = document.querySelectorAll('.role-btn');

        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        /* -------------------------------------
           Function: updateUI
           Description: Refreshes form text based on state
           ------------------------------------- */
        const updateUI = () => {
            errorEl.style.display = 'none';

            if (isLogin) {
                formTitle.innerText = 'Login';
                btnText.innerText = 'Login';
                toggleText.innerText = "Don't have an account? Sign Up";
                signupFields.style.display = 'none';
            } else {
                const prettyRole = capitalize(currentRole);
                formTitle.innerText = `Join as ${prettyRole}`; 
                btnText.innerText = `Sign Up as ${prettyRole}`;
                toggleText.innerText = "Already have an account? Login";
                signupFields.style.display = 'block';
            }

            roleBtns.forEach(btn => {
                if (btn.dataset.role === currentRole) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        // Role Switching
        roleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentRole = btn.dataset.role;
                updateUI(); 
            });
        });

        // Toggle Mode
        toggleText.addEventListener('click', () => {
            isLogin = !isLogin;
            updateUI();
        });

        // Form Submission
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('pass').value;

            if (isLogin) {
                if (AuthManager.login(email, password)) {
                    window.location.href = 'index.html';
                } else {
                    errorEl.textContent = 'Invalid email or password';
                    errorEl.style.display = 'block';
                }
            } else {
                const name = document.getElementById('name').value;
                if (!name) {
                    errorEl.textContent = 'Full Name is required';
                    errorEl.style.display = 'block';
                    return;
                }
                
                if (AuthManager.signup(name, email, password, currentRole)) {
                    alert(`Account created successfully as a ${capitalize(currentRole)}!`);
                    window.location.href = 'index.html';
                } else {
                    errorEl.textContent = 'User with this email already exists';
                    errorEl.style.display = 'block';
                }
            }
        });

        // Initialize
        updateUI();
    }
});