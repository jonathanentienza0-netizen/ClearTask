const SUPABASE_URL = "https://jirwifvvfcuczsszorsi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZVZhW6m9OPcIrcSVmrhCzw_Ro9UV-Ew";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
const DEFAULT_ACCOUNT = {
    studentNumber: "demo",
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
        id === DEFAULT_ACCOUNT.studentNumber.toLowerCase() ||
        id === DEFAULT_ACCOUNT.email.toLowerCase()
    ) {

        return {
            name: DEFAULT_ACCOUNT.name,
            studentNumber: DEFAULT_ACCOUNT.studentNumber,
            email: DEFAULT_ACCOUNT.email,
            password: getPassword()
        };

    }

    return getUsers().find(function(user) {

        return user.studentNumber.toLowerCase() === id
            || user.email.toLowerCase() === id;

    }) || null;

}


function isStudentNumberTaken(studentNumber) {

    return findAccount(studentNumber) !== null;

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

    const authContainer = document.querySelector(".auth-container");
    const dashboardView = document.getElementById("dashboardView");

    if (pageId === "dashboardPage" && !dashboardView) {
        console.error("#dashboardView not found in Index.html");
        return;
    }


    /* Dashboard is a full-screen view, outside the login layout */

    if (pageId === "dashboardPage") {

        authContainer.style.display = "none";
        dashboardView.classList.add("active");

        initDashboard();
        clearMessages();

        window.scrollTo({ top: 0 });

        return;
    }

    dashboardView.classList.remove("active");
    authContainer.style.display = "";

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
                "Please enter your email or student number.";

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
                    "Invalid student number /email or password.",
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

        const studentNumber =
            document
                .getElementById("registerStudentNumber")
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
            "registerStudentNumberError",
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


        if (!/^[A-Za-z0-9_.]{3,20}$/.test(studentNumber)) {

            setFieldError(
                "registerStudentNumberError",
                "Use 3-20 letters, numbers, underscores or dots."
            );

            valid = false;

        } else if (isStudentNumberTaken(studentNumber)) {

            setFieldError(
                "registerStudentNumberError",
                "That student number is already taken."
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
                studentNumber: studentNumber,
                email: email,
                password: password
            });

            saveUsers(users);


            button.classList.remove("loading");

            button.innerHTML =
                `<span>Create Account</span>
                 <i class="fa-solid fa-user-plus"></i>`;


            resetRegisterForm();


            /* Send the user to login with their student number filled in */

            showPage("loginPage");

            document.getElementById(
                "loginIdentifier"
            ).value = studentNumber;

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

/* ================= DASHBOARD ================= */

let dashTasks = [];
let dashFilter = "all";

function tasksKey() {
    return "clearTasks_" +
        (sessionStorage.getItem("loggedUser") || "guest");
}

function loadTasks() {

    const raw = localStorage.getItem(tasksKey());

    /* First visit: give a few sample tasks */

    if (raw === null) {

        return [
            { id: 1, title: "Explore your new dashboard", priority: "low",    due: "", done: true  },
            { id: 2, title: "Add your first task",        priority: "medium", due: "", done: false },
            { id: 3, title: "Finish the project report",  priority: "high",   due: "", done: false }
        ];

    }

    try {
        return JSON.parse(raw) || [];
    } catch (error) {
        return [];
    }

}

function saveTasks() {
    localStorage.setItem(tasksKey(), JSON.stringify(dashTasks));
}

function todayString() {

    const d = new Date();

    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");

}

function isOverdue(task) {
    return !task.done && task.due && task.due < todayString();
}

function initDashboard() {

    const name =
        sessionStorage.getItem("loggedUser") || "Demo User";

    document.getElementById("dashboardUser").textContent = name;

    const hour = new Date().getHours();

    const greeting =
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
                    "Good evening";

    document.getElementById("dashGreeting").textContent =
        greeting + ", " + name.split(" ")[0] + "!";

    document.getElementById("dashDate").textContent =
        new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    dashTasks = loadTasks();
    dashFilter = "all";

    document
        .querySelectorAll("#filterTabs button")
        .forEach(function(btn) {
            btn.classList.toggle(
                "active",
                btn.dataset.filter === "all"
            );
        });

    renderTasks();
}

function renderTasks() {

    const list = document.getElementById("taskList");
    const empty = document.getElementById("taskEmpty");

    list.innerHTML = "";

    const visible = dashTasks.filter(function(task) {
        if (dashFilter === "active") return !task.done;
        if (dashFilter === "done") return task.done;
        return true;
    });

    visible.forEach(function(task) {

        const li = document.createElement("li");
        li.className = "task-item" + (task.done ? " done" : "");
        li.dataset.id = task.id;

        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = task.done;
        check.className = "task-check";

        const body = document.createElement("div");
        body.className = "task-body";

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const badge = document.createElement("span");
        badge.className = "badge " + task.priority;
        badge.textContent = task.priority;
        meta.appendChild(badge);

        if (task.due) {

            const due = document.createElement("span");
            due.textContent = "Due " + task.due;

            if (isOverdue(task)) {
                due.className = "overdue";
                due.textContent += " (overdue)";
            }

            meta.appendChild(due);
        }

        body.appendChild(title);
        body.appendChild(meta);

        const del = document.createElement("button");
        del.type = "button";
        del.className = "task-delete";
        del.setAttribute("aria-label", "Delete task");
        del.innerHTML = '<i class="fa-regular fa-trash-can"></i>';

        li.appendChild(check);
        li.appendChild(body);
        li.appendChild(del);

        list.appendChild(li);
    });

    empty.style.display = visible.length ? "none" : "block";

    updateStats();
}

function updateStats() {

    const total = dashTasks.length;
    const done = dashTasks.filter(t => t.done).length;
    const pending = total - done;
    const overdue = dashTasks.filter(isOverdue).length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statDone").textContent = done;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statOverdue").textContent = overdue;

    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressFill").style.width = percent + "%";

    document.getElementById("progressNote").textContent =
        total === 0 ? "Add a task to get started." :
        pending === 0 ? "All done. Great job!" :
        done + " of " + total + " tasks completed.";
}

/* Add task */

document
    .getElementById("taskForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const input = document.getElementById("taskInput");
        const title = input.value.trim();

        if (!title) return;

        dashTasks.unshift({
            id: Date.now(),
            title: title,
            priority: document.getElementById("taskPriority").value,
            due: document.getElementById("taskDue").value,
            done: false
        });

        saveTasks();

        input.value = "";
        document.getElementById("taskDue").value = "";

        renderTasks();
    });

/* Check / delete (event delegation) */

document
    .getElementById("taskList")
    .addEventListener("click", function(event) {

        const li = event.target.closest(".task-item");
        if (!li) return;

        const id = Number(li.dataset.id);

        if (event.target.closest(".task-delete")) {

            dashTasks = dashTasks.filter(t => t.id !== id);

        } else if (event.target.classList.contains("task-check")) {

            const task = dashTasks.find(t => t.id === id);
            if (task) task.done = event.target.checked;

        } else {
            return;
        }

        saveTasks();
        renderTasks();
    });

/* Filter tabs */

document
    .getElementById("filterTabs")
    .addEventListener("click", function(event) {

        const btn = event.target.closest("button");
        if (!btn) return;

        dashFilter = btn.dataset.filter;

        this.querySelectorAll("button").forEach(function(b) {
            b.classList.toggle("active", b === btn);
        });

        renderTasks();
    });

/* Clear completed */

document
    .getElementById("clearDoneBtn")
    .addEventListener("click", function() {

        dashTasks = dashTasks.filter(t => !t.done);

        saveTasks();
        renderTasks();
    });

/* intialize */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadRememberedUser();

        checkSession();

    }
);