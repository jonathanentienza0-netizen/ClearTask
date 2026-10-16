
const SUPABASE_URL = "https://jirwifvvfcuczsszorsi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZVZhW6m9OPcIrcSVmrhCzw_Ro9UV-Ew";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Helper: show one page and hide the others
function showPage(pageId) {
    document.querySelectorAll(
        "#loginPage, #registerPage, #forgotPage, #resetPage, #successPage, #dashboardView"
    ).forEach(page => {
        page.style.display = page.id === pageId ? "block" : "none";
    });
}

// Helper: display a message without requiring new HTML
function showMessage(message) {
    alert(message);
}

// REGISTRATION
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
            showMessage("Registration failed: " + error.message);
            return;
        }

        showMessage(
            "Registration submitted! Check your email for the confirmation link."
        );

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
    const userLabel = document.getElementById("dashboardUser");
    const greeting = document.getElementById("dashGreeting");

    if (userLabel) {
        userLabel.textContent = user.user_metadata?.full_name || user.email;
    }

    if (greeting) {
        greeting.textContent =
            "Welcome, " + (user.user_metadata?.full_name || "Student") + "!";
    }

    showPage("dashboardView");
    await loadClearanceTasks();
}

// SHOW THE STUDENT'S CLEARANCE TASKS
async function loadClearanceTasks() {
    const taskList = document.getElementById("taskList");
    const taskEmpty = document.getElementById("taskEmpty");

    if (!taskList) return;

    taskList.innerHTML = "";

    const { data, error } = await supabaseClient
        .from("clearance_tasks")
        .select("id, task_name, status, remarks, offices(office_name)")
        .order("created_at", { ascending: true });

    if (error) {
        showMessage("Unable to load clearance tasks: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        if (taskEmpty) {
            taskEmpty.style.display = "block";
            taskEmpty.textContent = "No clearance tasks have been assigned yet.";
        }
        return;
    }

    if (taskEmpty) taskEmpty.style.display = "none";

    data.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        const officeName = task.offices?.office_name || "Office not specified";
        const status = task.status || "Pending";

        const title = document.createElement("strong");
        title.textContent = task.task_name;

        const details = document.createElement("p");
        details.textContent = `Office: ${officeName} | Status: ${status}`;

        item.appendChild(title);
        item.appendChild(details);

        if (task.remarks) {
            const remarks = document.createElement("p");
            remarks.textContent = "Remarks: " + task.remarks;
            item.appendChild(remarks);
        }

        taskList.appendChild(item);
    });
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
