
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


/* Page NaviGAYtion */

function showPage(pageId) {

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

            const currentPassword = getPassword();


            const validIdentifier =
                identifier.toLowerCase() ===
                DEFAULT_ACCOUNT.username.toLowerCase()

                ||

                identifier.toLowerCase() ===
                DEFAULT_ACCOUNT.email.toLowerCase();


            const validPassword =
                password === currentPassword;


            if (validIdentifier && validPassword) {

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
                    DEFAULT_ACCOUNT.name
                );


                /* Dashboard */

                document.getElementById(
                    "dashboardUser"
                ).textContent = identifier;


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

document
    .getElementById("newPassword")
    .addEventListener("input", function() {

        const password = this.value;


        const hasLength =
            password.length >= 8;

        const hasUppercase =
            /[A-Z]/.test(password);

        const hasLowercase =
            /[a-z]/.test(password);

        const hasNumber =
            /[0-9]/.test(password);

        const hasSpecial =
            /[^A-Za-z0-9]/.test(password);


        /* Update requirements */

        updateRequirement(
            "lengthRequirement",
            hasLength
        );

        updateRequirement(
            "uppercaseRequirement",
            hasUppercase
        );

        updateRequirement(
            "lowercaseRequirement",
            hasLowercase
        );

        updateRequirement(
            "numberRequirement",
            hasNumber
        );

        updateRequirement(
            "specialRequirement",
            hasSpecial
        );


        /* Calculate strength */

        let score = 0;

        if (hasLength) score++;
        if (hasUppercase) score++;
        if (hasLowercase) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;


        const progress =
            document.getElementById(
                "strengthProgress"
            );

        const strengthText =
            document.getElementById(
                "strengthText"
            );


        if (!password) {

            progress.style.width = "0%";

            strengthText.textContent = "—";

        } else if (score <= 2) {

            progress.style.width = "35%";

            strengthText.textContent =
                "Weak";

        } else if (score <= 4) {

            progress.style.width = "70%";

            strengthText.textContent =
                "Medium";

        } else {

            progress.style.width = "100%";

            strengthText.textContent =
                "Strong";

        }

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

            localStorage.setItem(
                "demoPassword",
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