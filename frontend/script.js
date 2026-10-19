
const SUPABASE_URL = "https://jirwifvvfcuczsszorsi.supabase.co/";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZVZhW6m9OPcIrcSVmrhCzw_Ro9UV-Ew";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);



const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async event => {
        event.preventDefault();

        const fullName = document.getElementById("registerName").value.trim();
        const studentNumber = document.getElementById("registerStudentNumber").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;
        const terms = document.getElementById("registerTerms");

        if (!fullName || !studentNumber || !email || !password) {
            showMessage("Please complete all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        if (terms && !terms.checked) {
            showMessage("Please accept the terms and conditions.");
            return;
        }

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + window.location.pathname,
                data: {
                    full_name: fullName,
                    student_number: studentNumber
                }
            }
        });

        if (error) {
            alert("Registration failed: " + error.message);
            return;
        }
        //may binago ako dito
        

        alert("Account created successfully!");
registerForm.reset();
showPage("loginPage");

        registerForm.reset();
        showPage("loginPage");
    });
}

// LOGIN — email and password
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        const email = document.getElementById("loginIdentifier").value.trim();
        const password = document.getElementById("loginPassword").value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage("Login failed: " + error.message);
            return;
        }

        await loadDashboard(data.user);
    });
}

// LOAD DASHBOARD

async function loadDashboard(user) {
    const { data: student, error } = await supabaseClient
        .from("students")
        .select("full_name, student_number")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error loading student profile:", error);
    }

    const studentName =
        student?.full_name ||
        user.user_metadata?.full_name ||
        user.email;

    const userLabel = document.getElementById("dashboardUser");
    const greeting = document.getElementById("dashGreeting");

    if (userLabel) {
        userLabel.textContent = studentName;
    }

    if (greeting) {
        greeting.textContent = "Welcome, " + studentName + "!";
    }

    showPage("dashboardPage");
    

document.getElementById("dashboardUser").textContent = studentName;

await loadClearanceTasks();
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


// SHOW THE STUDENT'S CLEARANCE TASKS

async function loadClearanceTasks() {
    const taskList = document.getElementById("taskList");
    const taskEmpty = document.getElementById("taskEmpty");

    if (!taskList) {
        console.error("Task list element not found.");
        return;
    }

    taskList.innerHTML = "";

    const { data: { user }, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.error("Student is not logged in.");
        return;
    }

    const { data: tasks, error } = await supabaseClient
        .from("clearance_tasks")
        .select(`
            id,
            task_name,
            status,
            remarks,
            deadline,
            requirement_id,
            offices (
                office_name
            )
        `)
        .eq("student_id", user.id)
        .not("requirement_id", "is", null)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error loading clearance tasks:", error);
        taskList.textContent = "Unable to load clearance tasks.";
        return;
    }

    if (!tasks || tasks.length === 0) {
        if (taskEmpty) taskEmpty.style.display = "block";
        return;
    }

       if (taskEmpty) taskEmpty.style.display = "none";
      
                const requiredOffices = [
                    "Library",
                    "Guidance",
                    "Accounting"
                ];

                const pendingOffices = requiredOffices.filter(office => {
                    const officeTasks = tasks.filter(task =>
                        task.offices?.office_name === office
                    );

                    return officeTasks.length === 0 ||
                        officeTasks.some(task => task.status !== "Cleared");
                });

                const overallStatus = document.getElementById(
                    "overallClearanceStatus"
                );

                if (overallStatus) {
                    const fullyCleared = pendingOffices.length === 0;

                    overallStatus.textContent = fullyCleared
                        ? "Fully Cleared"
                        : "Pending";

                    overallStatus.style.color = fullyCleared
                        ? "#16a34a"
                        : "#ea580c";
}
            const total = tasks.length;

            const completed = tasks.filter(
                     task => task.status === "Cleared"
                ).length;

            const pending = tasks.filter(
                    task => task.status === "Pending"
                ).length;

            const today = new Date().toISOString().split("T")[0];

            const overdue = tasks.filter(
                    task =>
                    task.deadline &&
                    task.deadline < today &&
                    task.status === "Pending"
            ).length;

// Update dashboard statistics
            document.getElementById("statTotal").textContent = total;
            document.getElementById("statDone").textContent = completed;
            document.getElementById("statPending").textContent = pending;
            document.getElementById("statOverdue").textContent = overdue;
            // Calculate clearance progress
            const progress = total > 0
                ? Math.round((completed / total) * 100)
                : 0;

            // Update progress percentage
            document.getElementById("progressPercent").textContent =
                progress + "%";

            // Update progress bar
            document.getElementById("progressFill").style.width =
                progress + "%";

            // Update progress message
            document.getElementById("progressNote").textContent =
                `${completed} of ${total} clearance requirements completed.`;

                // Replace existing list with the latest query result
                const fragment = document.createDocumentFragment();

    const filteredTasks = tasks.filter(task => {
    if (dashFilter === "active") {
        return task.status === "Pending";
    }

    if (dashFilter === "done") {
        return task.status === "Cleared";
    }

    return true;
});

filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        const officeName =
            task.offices?.office_name || "Unknown Office";

        const title = document.createElement("strong");
        title.textContent = task.task_name;

        const details = document.createElement("p");
        details.textContent =
            `Office: ${officeName} | Status: ${task.status}`;

        item.appendChild(title);
        item.appendChild(details);
        // Add proof upload control for pending requirements
                if (task.status === "Pending") {
                    const uploadInput = document.createElement("input");
                    uploadInput.type = "file";
                    uploadInput.accept = ".pdf,.jpg,.jpeg,.png";
                    uploadInput.style.display = "none";

                    const uploadButton = document.createElement("button");
                    uploadButton.type = "button";
                    uploadButton.textContent = "Upload Proof";
                    uploadButton.className = "upload-proof-btn";

                    uploadButton.addEventListener("click", () => {
                        uploadInput.click();
                    });
                    uploadInput.addEventListener("change", async () => {
                            const file = uploadInput.files[0];
                            if (!file) return;

                            const allowedTypes = [
                                "application/pdf",
                                "image/jpeg",
                                "image/png"
                            ];

                            if (!allowedTypes.includes(file.type)) {
                                alert("PDF, JPG, or PNG files only.");
                                uploadInput.value = "";
                                return;
                            }

                            if (file.size > 5 * 1024 * 1024) {
                                alert("Maximum file size is 5 MB.");
                                uploadInput.value = "";
                                return;
                            }

                            uploadButton.disabled = true;
                            uploadButton.textContent = "Uploading...";

                            try {
                                const { data: { user }, error: authError } =
                                    await supabaseClient.auth.getUser();

                                if (authError || !user) {
                                    throw new Error("Please log in again.");
                                }

                                const extension = file.name.split(".").pop().toLowerCase();
                                const filePath =
                                    `${user.id}/${task.id}/proof-${crypto.randomUUID()}.${extension}`;

                                const { error: uploadError } = await supabaseClient.storage
                                    .from("clearance-proofs")
                                    .upload(filePath, file, {
                                        contentType: file.type,
                                        upsert: false
                                    });

                               if (uploadError) throw uploadError;

                                        
                                        const { error: completionError } = await supabaseClient.rpc(
                                            "complete_my_clearance_task",
                                            {
                                                p_task_id: task.id,
                                                p_file_path: filePath
                                            }
                                        );

                                        if (completionError) {
                                            throw new Error(
                                                "Proof uploaded, but clearance status was not updated: " +
                                                completionError.message
                                            );
                                        }

                                        alert("Proof submitted! Requirement marked as Cleared.");

                                        
                                        await loadClearanceTasks();
                            } catch (error) {
                                console.error("Proof upload error:", error);
                                alert("Upload failed: " + error.message);
                            } finally {
                                uploadButton.disabled = false;
                                uploadButton.textContent = "Upload Proof";
                                uploadInput.value = "";
                            }
                        });

                    item.appendChild(uploadButton);
                    item.appendChild(uploadInput);
                }

        if (task.deadline) {
            const deadline = document.createElement("p");
            deadline.textContent = `Deadline: ${task.deadline}`;
            item.appendChild(deadline);
        }
        fragment.appendChild(item);
    });

    taskList.replaceChildren(fragment);
    if (taskEmpty) {
    taskEmpty.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    const message = taskEmpty.querySelector("p");

    if (message) {
        message.textContent =
            dashFilter === "done"
                ? "No cleared requirements yet."
                : dashFilter === "active"
                ? "No pending requirements."
                : "No clearance requirements found.";
    }
}
}


// LOGOUT
document.addEventListener("click", async event => {
    const button = event.target.closest(
        "#logoutButton, #logoutBtn, .logout-button"
    );

    if (!button) return;

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        showMessage("Logout failed: " + error.message);
        return;
    }

    showPage("loginPage");
});

// FORGOT PASSWORD
const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
    forgotForm.addEventListener("submit", async event => {
        event.preventDefault();

        const email = document.getElementById("forgotEmail").value.trim();

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });

        if (error) {
            showMessage("Unable to send reset email: " + error.message);
            return;
        }

        showMessage("If the email is registered, a password reset link will be sent.");
    });
}

// RESET PASSWORD
const resetForm = document.getElementById("resetForm");

if (resetForm) {
    resetForm.addEventListener("submit", async event => {
        event.preventDefault();

        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        const { error } = await supabaseClient.auth.updateUser({ password });

        if (error) {
            showMessage("Unable to reset password: " + error.message);
            return;
        }

        showMessage("Password updated successfully. You can now log in.");
        showPage("loginPage");
    });
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

    /* [NEW] Left welcome panel becomes a left/top border on the dashboard */
    setDashboardMode(pageId === "dashboardPage" || pageId === "dashboardView");

    if (pageId === "dashboardPage" && !dashboardView) {
        console.error("#dashboardView not found in Index.html");
        return;
    }


    /* Dashboard is a full-screen view, outside the login layout */

    if (pageId === "dashboardPage") {

        /* [CHANGED] keep the container visible (it holds the border now), hide only the auth pages */
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
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
    // Supports simple messages from Supabase
    if (arguments.length === 1) {
        alert(elementId);
        return;
    }

    const element = document.getElementById(elementId);

    if (!element) {
        alert(message);
        return;
    }

    element.textContent = message;
    element.className = "message " + (type || "error");
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





/* ================= LOGOUT ================= */



    
async function logout() {

    // End the Supabase authentication session
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
        return;
    }

    // Clear old session data
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("loggedUser");

    // Clear password field
    const passwordInput = document.getElementById("loginPassword");

    if (passwordInput) {
        passwordInput.value = "";
    }

    // Return to login page
    showPage("loginPage");

}


/* ================= [NEW] DASHBOARD BORDER / HOME / PROFILE ================= */

/* Turn the left welcome panel into a left + top border (CSS: .dashboard-mode) */
function setDashboardMode(on) {
    const authContainer = document.querySelector(".auth-container");

    if (authContainer) {
        authContainer.classList.toggle("dashboard-mode", on);
    }

    if (!on) closeProfile();
}

/* Home button (top left) */
function goHome() {
    closeProfile();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Profile modal (button beside Logout, top right) */
function openProfile() {
    document.getElementById("profileName").textContent =
        document.getElementById("dashboardUser").textContent;

    document.getElementById("profileModal").classList.add("open");
}

function closeProfile() {
    const modal = document.getElementById("profileModal");

    if (modal) modal.classList.remove("open");
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") closeProfile();
});


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
    document.getElementById("dashboardUser").textContent.trim() || "Student";

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
    .addEventListener("click", async function(event) {

        const btn = event.target.closest("button");
        if (!btn) return;

        dashFilter = btn.dataset.filter;

        this.querySelectorAll("button").forEach(function(b) {
            b.classList.toggle("active", b === btn);
        });

        await loadClearanceTasks();
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

// RESTORE AN EXISTING LOGIN SESSION
async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error.message);
        return;
    }

    if (data.session?.user) {
        await loadDashboard(data.session.user);
    } else {
        showPage("loginPage");
    }
}

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        showPage("resetPage");
    }
});

checkSession();


const officeNames = [
    "Library", "Registrar", "Guidance", "Accounting"
];

let currentOffice = null;

const officeFieldConfigs = {
    Library: [
        ["books_borrowed", "Books Borrowed", "number"],
        ["date_borrowed", "Date Borrowed", "date"],
        ["due_date", "When to Return", "date"]
    ],
    Registrar: [
        ["papers", "Papers to Submit", "text"],
        ["due_date", "Deadline", "date"]
    ],
    Guidance: [
        ["papers", "Papers to Submit", "text"],
        ["due_date", "Deadline", "date"]
    ],
    Accounting: [
        ["balance", "Balance to Be Paid", "number"],
        ["due_date", "Due Date", "date"]
    ]
};

function openOffice(office) {
    if (!officeNames.includes(office)) return;

    currentOffice = office;

    document.getElementById("officeTitle").textContent =
        office;

    const fields = document.getElementById("officeFields");
    fields.replaceChildren();

    officeFieldConfigs[office].forEach(([name, label, type]) => {
        const wrapper = document.createElement("label");
        wrapper.className = "office-field";

        const title = document.createElement("span");
        title.textContent = label;

        const input = document.createElement("input");
        input.name = name;
        input.type = type;
        input.required = true;

        if (type === "number") {
            input.min = name === "books_borrowed" ? "1" : "0";
            input.step = name === "balance" ? "0.01" : "1";
        }

        wrapper.append(title, input);
        fields.appendChild(wrapper);
    });

    // Hide dashboard content while viewing an office
    document.querySelectorAll(
        ".dash-main > :not(#officeSection)"
    ).forEach(element => {
        element.hidden = true;
        element.style.display = "none";
    });

    document.getElementById("officeSection").hidden = false;

    loadOfficeTasks();
    window.scrollTo(0, 0);
}

// Override existing Home behavior to return to dashboard
function goHome() {
    currentOffice = null;

    document.getElementById("officeSection").hidden = true;

    document.querySelectorAll(
        ".dash-main > :not(#officeSection)"
    ).forEach(element => {
        element.hidden = false;
        element.style.removeProperty("display");
    });

    if (typeof closeProfile === "function") {
        closeProfile();
    }

    window.scrollTo(0, 0);
}

// ADD TASK
document.getElementById("officeTaskForm")
    .addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!currentOffice) return;

        const { data: { user }, error: authError } =
            await supabaseClient.auth.getUser();

        if (authError || !user) {
            alert("Please log in first.");
            return;
        }

        const formData = new FormData(this);

        const task = {
            student_id: user.id,
            office: currentOffice,
            due_date: formData.get("due_date")
        };

        if (currentOffice === "Library") {
            task.books_borrowed =
                Number(formData.get("books_borrowed"));
            task.date_borrowed =
                formData.get("date_borrowed");
        }

        if (currentOffice === "Registrar" ||
            currentOffice === "Guidance") {
            task.papers = formData.get("papers").trim();
        }

        if (currentOffice === "Finance") {
            task.balance = Number(formData.get("balance"));
        }

        const { error } = await supabaseClient
            .from("student_office_tasks")
            .insert(task);

        if (error) {
            alert("Error: " + error.message);
            return;
        }

        this.reset();
        await loadOfficeTasks();
    });
// DISPLAY CLEARANCE REQUIREMENTS PER OFFICE
async function loadOfficeTasks() {
    const office = currentOffice;
    if (!office) return;

    const list = document.getElementById("officeTaskList");
    if (!list) return;

    list.textContent = "Loading requirements...";

    const { data: { user }, error: authError } =
        await supabaseClient.auth.getUser();

    if (authError || !user) {
        list.textContent = "Please log in first.";
        return;
    }

    const { data: tasks, error } = await supabaseClient
        .from("clearance_tasks")
        .select(`
            id,
            task_name,
            status,
            offices (
                office_name
            )
        `)
        .eq("student_id", user.id)
        .not("requirement_id", "is", null);

    // Prevent results from appearing on the wrong office page
    if (currentOffice !== office) return;

    if (error) {
        console.error("Office requirements error:", error);
        list.textContent = "Unable to load requirements.";
        return;
    }

    list.replaceChildren();

    // Registrar is automatically cleared when all
    // other offices have completed requirements.
    if (office === "Registrar") {
        const requiredOffices = [
            "Library",
            "Guidance",
            "Accounting"
        ];

       const pendingOffices = requiredOffices.filter(name => {
                const officeTasks = tasks.filter(task =>
                    task.offices?.office_name === name
                );

                return officeTasks.length === 0 ||
                    officeTasks.some(task => task.status !== "Cleared");
            });
        const message = document.createElement("p");

        message.textContent = pendingOffices.length === 0
            ? "Registrar Status: Cleared"
            : "Registrar Status: Pending. Complete: " +
              pendingOffices.join(", ");

        list.appendChild(message);
        return;
    }

    const officeTasks = tasks.filter(task =>
        task.offices?.office_name === office
    );

    if (officeTasks.length === 0) {
        list.textContent = "No clearance requirements found.";
        return;
    }

    officeTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "office-task";

        const title = document.createElement("strong");
        title.textContent = task.task_name;

        const status = document.createElement("p");
        status.textContent = "Status: " + task.status;

        item.append(title, status);
        list.appendChild(item);
    });
}

// UPDATE STATUS
async function updateOfficeTask(id, done) {
    const { error } = await supabaseClient
        .from("student_office_tasks")
        .update({ done })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadOfficeTasks();
}

// DELETE TASK
async function deleteOfficeTask(id) {
    if (!confirm("Delete this task?")) return;

    const { error } = await supabaseClient
        .from("student_office_tasks")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadOfficeTasks();
}
