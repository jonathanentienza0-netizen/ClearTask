
const DEFAULT_ACCOUNT = {
    username: "demo",
    email: "demo@example.com",
    password: "Password123!",
    name: "Demo User"
};


function getPassword() {

    return localStorage.getItem("demoPassword")
        || DEFAULT_ACCOUNT.password;

}


/* Accounts (frontend demo only) */

function getUsers() {

    try {

        return JSON.parse(
            localStorage.getItem("demoUsers")
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveUsers(users) {

    localStorage.setItem(
        "demoUsers",
        JSON.stringify(users)
    );

}


/* Find demo account or a registered account */

function findAccount(identifier) {

    const id = identifier.toLowerCase();

    if (
        id === DEFAULT_ACCOUNT.username.toLowerCase() ||
        id === DEFAULT_ACCOUNT.email.toLowerCase()
    ) {

        return {
            name: DEFAULT_ACCOUNT.name,
            username: DEFAULT_ACCOUNT.username,
            email: DEFAULT_ACCOUNT.email,
            password: getPassword()
        };

    }

    return getUsers().find(function(user) {

        return user.username.toLowerCase() === id
            || user.email.toLowerCase() === id;

    }) || null;

}


function isUsernameTaken(username) {

    return findAccount(username) !== null;

}


function isEmailTaken(email) {

    return findAccount(email) !== null;

}


/* Save a new password for the account that owns this email */

function applyNewPassword(email, newPassword) {

    const users = getUsers();

    const index = users.findIndex(function(user) {

        return email &&
            user.email.toLowerCase() === email.toLowerCase();

    });

    if (index !== -1) {

        users[index].password = newPassword;

        saveUsers(users);

    } else {

        localStorage.setItem(
            "demoPassword",
            newPassword
        );

    }

}


/* Left panel text changes per page */

function updateWelcomePanel(pageId) {

    const title =
        document.querySelector(".welcome-text h1");

    const text =
        document.querySelector(".welcome-text p");

    if (!title || !text) return;

    if (pageId === "registerPage") {

        title.textContent = "Join ClearTask";

        text.textContent =
            "Create your account in less than a minute and get started right away.";

    } else {

        title.textContent = "Welcome Back!";

        text.textContent =
            "Sign in to your account and continue where you left off.";

    }

}


/* Page NaviGAYtion */

function showPage(pageId) {

    updateWelcomePanel(pageId);


    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    clearMessages();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* Klir msgs */

function clearMessages() {

    const messages = document.querySelectorAll(".message");

    messages.forEach(message => {
        message.textContent = "";
        message.className = "message";
    });

    const errors = document.querySelectorAll(".error-message");

    errors.forEach(error => {
        error.textContent = "";
    });
}


/* Showroom msgs */

function showMessage(elementId, message, type) {

    const element = document.getElementById(elementId);

    element.textContent = message;

    element.className = "message " + type;
}


/* Password visibility on and off */

function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    const icon = button.querySelector("i");

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");

    }

}


/* Tandaam moko */

function loadRememberedUser() {

    const savedUser =
        localStorage.getItem("rememberedUser");

    if (savedUser) {

        document.getElementById("loginIdentifier").value =
            savedUser;

        document.getElementById("rememberMe").checked =
            true;
    }

}


/* lOGin */

document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const identifier =
            document
                .getElementById("loginIdentifier")
                .value
                .trim();

        const password =
            document
                .getElementById("loginPassword")
                .value;

        const rememberMe =
            document
                .getElementById("rememberMe")
                .checked;


        const identifierError =
            document.getElementById(
                "loginIdentifierError"
            );

        const passwordError =
            document.getElementById(
                "loginPasswordError"
            );


        identifierError.textContent = "";

        passwordError.textContent = "";


        /* Validation */

        if (!identifier) {

            identifierError.textContent =
                "Please enter your email or username.";

            return;
        }


        if (!password) {

            passwordError.textContent =
                "Please enter your password.";

            return;
        }


        /* Loading */

        const button =
            document.getElementById("loginButton");

        button.classList.add("loading");

        button.innerHTML =
            `<span>Signing in...</span>
             <i class="fa-solid fa-spinner fa-spin"></i>`;


        setTimeout(function() {

            const account = findAccount(identifier);


            if (account && password === account.password) {

                /* Remember Me */

                if (rememberMe) {

                    localStorage.setItem(
                        "rememberedUser",
                        identifier
                    );

                } else {

                    localStorage.removeItem(
                        "rememberedUser"
                    );

                }


                /* Save session */

                sessionStorage.setItem(
                    "loggedIn",
                    "true"
                );


                sessionStorage.setItem(
                    "loggedUser",
                    account.name
                );


                /* Dashboard */

                document.getElementById(
                    "dashboardUser"
                ).textContent = account.name;


                showPage("dashboardPage");


            } else {

                showMessage(
                    "loginMessage",
                    "Invalid username/email or password.",
                    "error"
                );

            }


            /* Restore button */

            button.classList.remove("loading");

            button.innerHTML =
                `<span>Sign In</span>
                 <i class="fa-solid fa-arrow-right"></i>`;


        }, 800);

    });


/* Nakalimutang password */

document
    .getElementById("forgotForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("forgotEmail")
                .value
                .trim();


        const error =
            document.getElementById(
                "forgotEmailError"
            );


        error.textContent = "";


        /* Email validation */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!email) {

            error.textContent =
                "Please enter your email address.";

            return;
        }


        if (!emailPattern.test(email)) {

            error.textContent =
                "Please enter a valid email address.";

            return;
        }


        /* Loading */

        const button =
            document.getElementById(
                "forgotButton"
            );


        button.classList.add("loading");

        button.innerHTML =
            `<span>Sending...</span>
             <i class="fa-solid fa-spinner fa-spin"></i>`;


        setTimeout(function() {

            button.classList.remove("loading");

            button.innerHTML =
                `<span>Send Reset Link</span>
                 <i class="fa-solid fa-paper-plane"></i>`;


            /*
                Frontend demo:
                No real email is sent.
            */

            showMessage(
                "forgotMessage",
                "Password reset link sent successfully. This is a frontend demo.",
                "success"
            );


            /* Store email temporarily */

            sessionStorage.setItem(
                "resetEmail",
                email
            );


            /*
                Automatically show reset page
                after a short delay.
            */

            setTimeout(function() {

                showPage("resetPage");

            }, 1200);


        }, 1000);

    });


/* kalakasan ng password */

const RESET_UI = {
    progress: "strengthProgress",
    text: "strengthText",
    requirements: {
        length: "lengthRequirement",
        uppercase: "uppercaseRequirement",
        lowercase: "lowercaseRequirement",
        number: "numberRequirement",
        special: "specialRequirement"
    }
};

const REGISTER_UI = {
    progress: "registerStrengthProgress",
    text: "registerStrengthText",
    requirements: {
        length: "registerLengthRequirement",
        uppercase: "registerUppercaseRequirement",
        lowercase: "registerLowercaseRequirement",
        number: "registerNumberRequirement",
        special: "registerSpecialRequirement"
    }
};


function checkPassword(password) {

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    const score =
        Object.values(checks).filter(Boolean).length;

    return {
        checks: checks,
        score: score,
        valid: score === 5
    };

}


function renderPasswordStrength(password, ui) {

    const result = checkPassword(password);


    /* Update requirements */

    Object.keys(ui.requirements).forEach(function(key) {

        updateRequirement(
            ui.requirements[key],
            result.checks[key]
        );

    });


    /* Update strength bar */

    const progress =
        document.getElementById(ui.progress);

    const strengthText =
        document.getElementById(ui.text);


    if (!password) {

        progress.style.width = "0%";

        progress.style.background = "#d1d5db";

        strengthText.textContent = "—";

    } else if (result.score <= 2) {

        progress.style.width = "35%";

        progress.style.background = "#ef4444";

        strengthText.textContent = "Weak";

    } else if (result.score <= 4) {

        progress.style.width = "70%";

        progress.style.background = "#f59e0b";

        strengthText.textContent = "Medium";

    } else {

        progress.style.width = "100%";

        progress.style.background = "#16a34a";

        strengthText.textContent = "Strong";

    }

}


document
    .getElementById("newPassword")
    .addEventListener("input", function() {

        renderPasswordStrength(this.value, RESET_UI);

    });


/* requirement update */

function updateRequirement(elementId, valid) {

    const element =
        document.getElementById(elementId);

    if (valid) {

        element.classList.add("valid");

        element.querySelector("i").className =
            "fa-solid fa-check";

    } else {

        element.classList.remove("valid");

        element.querySelector("i").className =
            "fa-solid fa-circle";

    }

}


/* reset pass */

document
    .getElementById("resetForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const newPassword =
            document
                .getElementById("newPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        const error =
            document.getElementById(
                "confirmPasswordError"
            );


        error.textContent = "";


        /* Password requirements */

        const validPassword =
            newPassword.length >= 8 &&
            /[A-Z]/.test(newPassword) &&
            /[a-z]/.test(newPassword) &&
            /[0-9]/.test(newPassword) &&
            /[^A-Za-z0-9]/.test(newPassword);


        if (!validPassword) {

            showMessage(
                "resetMessage",
                "Please meet all password requirements.",
                "error"
            );

            return;
        }


        /* Match */

        if (newPassword !== confirmPassword) {

            error.textContent =
                "Passwords do not match.";

            return;
        }


        /* Loading */

        const button =
            document.getElementById(
                "resetButton"
            );


        button.classList.add("loading");

        button.innerHTML =
            `<span>Resetting...</span>
             <i class="fa-solid fa-spinner fa-spin"></i>`;


        setTimeout(function() {

            /*
                Store new password.

                NOTE:
                This is only for a frontend demo.
                Never store real passwords this way.
            */

            applyNewPassword(
                sessionStorage.getItem("resetEmail"),
                newPassword
            );


            button.classList.remove("loading");

            button.innerHTML =
                `<span>Reset Password</span>
                 <i class="fa-solid fa-check"></i>`;


            sessionStorage.removeItem(
                "resetEmail"
            );


            showPage("successPage");


        }, 900);

    });


/* ================= CREATE ACCOUNT ================= */

function setFieldError(elementId, message) {

    document.getElementById(elementId).textContent = message;

}


function resetRegisterForm() {

    document.getElementById("registerForm").reset();

    renderPasswordStrength("", REGISTER_UI);

    ["registerPassword", "registerConfirmPassword"]
        .forEach(function(inputId) {

            const input = document.getElementById(inputId);

            input.type = "password";

            input
                .parentElement
                .querySelector(".password-toggle i")
                .className = "fa-regular fa-eye";

        });

}


document
    .getElementById("registerPassword")
    .addEventListener("input", function() {

        renderPasswordStrength(this.value, REGISTER_UI);

    });


document
    .getElementById("registerForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("registerName")
                .value
                .trim();

        const username =
            document
                .getElementById("registerUsername")
                .value
                .trim();

        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("registerPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("registerConfirmPassword")
                .value;

        const termsAccepted =
            document
                .getElementById("registerTerms")
                .checked;


        /* Clear old errors */

        [
            "registerNameError",
            "registerUsernameError",
            "registerEmailError",
            "registerConfirmError",
            "registerTermsError"
        ].forEach(function(id) {

            setFieldError(id, "");

        });

        const message =
            document.getElementById("registerMessage");

        message.textContent = "";

        message.className = "message";


        /* Validation */

        let valid = true;


        if (name.length < 2) {

            setFieldError(
                "registerNameError",
                "Please enter your full name."
            );

            valid = false;

        }


        if (!/^[A-Za-z0-9_.]{3,20}$/.test(username)) {

            setFieldError(
                "registerUsernameError",
                "Use 3-20 letters, numbers, underscores or dots."
            );

            valid = false;

        } else if (isUsernameTaken(username)) {

            setFieldError(
                "registerUsernameError",
                "That username is already taken."
            );

            valid = false;

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {

            setFieldError(
                "registerEmailError",
                "Please enter your email address."
            );

            valid = false;

        } else if (!emailPattern.test(email)) {

            setFieldError(
                "registerEmailError",
                "Please enter a valid email address."
            );

            valid = false;

        } else if (isEmailTaken(email)) {

            setFieldError(
                "registerEmailError",
                "An account with this email already exists."
            );

            valid = false;

        }


        if (!checkPassword(password).valid) {

            showMessage(
                "registerMessage",
                "Please meet all password requirements.",
                "error"
            );

            valid = false;

        }


        if (password !== confirmPassword) {

            setFieldError(
                "registerConfirmError",
                "Passwords do not match."
            );

            valid = false;

        }


        if (!termsAccepted) {

            setFieldError(
                "registerTermsError",
                "You must accept the terms to continue."
            );

            valid = false;

        }


        if (!valid) return;


        /* Loading */

        const button =
            document.getElementById("registerButton");

        button.classList.add("loading");

        button.innerHTML =
            `<span>Creating account...</span>
             <i class="fa-solid fa-spinner fa-spin"></i>`;


        setTimeout(function() {

            /*
                Save new account.

                NOTE:
                This is only for a frontend demo.
                Never store real passwords this way.
            */

            const users = getUsers();

            users.push({
                name: name,
                username: username,
                email: email,
                password: password
            });

            saveUsers(users);


            button.classList.remove("loading");

            button.innerHTML =
                `<span>Create Account</span>
                 <i class="fa-solid fa-user-plus"></i>`;


            resetRegisterForm();


            /* Send the user to login with their username filled in */

            showPage("loginPage");

            document.getElementById(
                "loginIdentifier"
            ).value = username;

            document.getElementById(
                "loginPassword"
            ).value = "";

            showMessage(
                "loginMessage",
                "Account created successfully! You can now sign in.",
                "success"
            );


        }, 900);

    });


/* ================= LOGOUT ================= */

function logout() {

    sessionStorage.removeItem(
        "loggedIn"
    );

    sessionStorage.removeItem(
        "loggedUser"
    );


    document.getElementById(
        "loginPassword"
    ).value = "";


    showPage("loginPage");

}


/* check session */

function checkSession() {

    const loggedIn =
        sessionStorage.getItem(
            "loggedIn"
        );


    if (loggedIn === "true") {

        const loggedUser =
            sessionStorage.getItem(
                "loggedUser"
            );

        document.getElementById(
            "dashboardUser"
        ).textContent =
            loggedUser || "Demo User";

        showPage("dashboardPage");

    } else {

        showPage("loginPage");

    }

}


/* intialize */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadRememberedUser();

        checkSession();

    }
);