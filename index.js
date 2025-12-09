// index.js — FIXED VERSION (Login + Dashboard + Stored Data)

// Imports from firebase.js
import {
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    auth,
    db,
    doc,
    getDoc,
    addRequest,
    addRectorComplaint,
    onUserRequestsRealtime,
    getUserRequests,
    signOutUser,
    collection,
    query,
    where,
    getDocs,
    onAuthStateChanged,
    getAllRequests,
    getAllRectorComplaints,
    setDoc,
    serverTimestamp
} from "./firebase.js";

// UI message helper
function showMessage(container, message, isError = true) {
    let el = container.querySelector(".form-message");
    if (!el) {
        el = document.createElement("div");
        el.className = "form-message";
        el.style.marginTop = "12px";
        el.style.fontSize = "0.95rem";
        container.appendChild(el);
    }
    el.style.color = isError ? "#DC2626" : "#059669";
    el.textContent = message;
}


// Main Initialization Function
function initApp() {
    console.log("Initializing App...");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const maintenanceForm = document.getElementById("maintenance-form");
    const rectorForm = document.getElementById("rector-form");
    // === LOGOUT HANDLER (paste here) ===
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOutUser();   // from firebase.js
                window.location.href = "index.html";
            } catch (err) {
                console.error("Logout failed:", err);
                alert("Logout failed: " + (err.message || err));
            }
        });
    }



    // ============================================================
    // LOGIN / SIGNUP LOGIC
    // ============================================================

    if (loginForm || signupForm) {

        // TAB SWITCHING LOGIC
        const tabLogin = document.getElementById("tab-login");
        const tabSignup = document.getElementById("tab-signup");

        // Clear errors when typing
        const clearErrors = (form) => {
            const el = form.querySelector(".form-message");
            if (el) el.textContent = "";
        };
        if (loginForm) {
            loginForm.querySelectorAll("input").forEach(inpt => {
                inpt.addEventListener("input", () => clearErrors(loginForm));
            });
        }
        if (signupForm) {
            signupForm.querySelectorAll("input").forEach(inpt => {
                inpt.addEventListener("input", () => clearErrors(signupForm));
            });
        }

        if (tabLogin && tabSignup) {
            tabLogin.addEventListener("click", () => {
                tabLogin.classList.add("active");
                tabSignup.classList.remove("active");
                loginForm.classList.remove("hidden");
                signupForm.classList.add("hidden");
                clearErrors(loginForm);
                clearErrors(signupForm);
            });

            tabSignup.addEventListener("click", () => {
                tabSignup.classList.add("active");
                tabLogin.classList.remove("active");
                signupForm.classList.remove("hidden");
                loginForm.classList.add("hidden");
                clearErrors(loginForm);
                clearErrors(signupForm);
            });
        }

        // LOGIN
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                const email = loginForm.querySelector('input[type="email"]').value.trim();
                const password = loginForm.querySelector('input[type="password"]').value.trim();

                if (!email || !password) {
                    showMessage(loginForm, "Please enter email & password.");
                    return;
                }

                const btn = loginForm.querySelector(".btn-primary");
                btn.disabled = true;

                try {
                    await loginWithEmail(email, password);
                    window.location.href = "home.html";
                } catch (err) {
                    // Error caught; handled in UI
                    let msg = "Login failed. Please try again.";
                    if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                        msg = "Invalid email or password. If you signed up with Google, please use that button.";
                    } else if (err.code === "auth/too-many-requests") {
                        msg = "Too many failed attempts. Please try again later.";
                    } else if (err.message) {
                        msg = err.message;
                    }
                    showMessage(loginForm, msg);
                } finally {
                    btn.disabled = false;
                }
            });

            const googleBtn = loginForm.querySelector(".btn-google");
            if (googleBtn) {
                googleBtn.addEventListener("click", async () => {
                    try {
                        // After Google sign-in, ensure user doc exists (prevents missing profile issues)
                        const result = await loginWithGoogle();
                        const user = result.user;
                        if (user && user.uid) {
                            const userDocRef = doc(db, "users", user.uid);
                            const snap = await getDoc(userDocRef);
                            if (!snap.exists()) {
                                // set a default document for Google users
                                await setDoc(userDocRef, {
                                    uid: user.uid,
                                    email: user.email || "",
                                    username: user.displayName || "Google User",
                                    hostel: "Not Assigned",
                                    room: "",
                                    createdAt: serverTimestamp()
                                });
                            }
                        }
                        // redirect
                        window.location.href = "home.html";
                    } catch (err) {
                        // console.error(err);
                        showMessage(loginForm, "Google Sign-in failed");
                    }
                });
            }
        }


        // SIGNUP
        if (signupForm) {
            signupForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                // safer selectors: grab all .form-control fields and index them explicitly
                const inputs = signupForm.querySelectorAll(".form-control");
                const username = inputs[0]?.value.trim() || "";
                const hostelRoom = inputs[1]?.value.trim() || "";
                const email = inputs[2]?.value.trim() || "";
                const password = inputs[3]?.value.trim() || "";

                if (!username || !hostelRoom || !email || !password) {
                    showMessage(signupForm, "All fields are required.");
                    return;
                }

                let hostel = hostelRoom;
                let room = "";
                if (hostelRoom.includes("-")) {
                    const parts = hostelRoom.split("-");
                    hostel = parts[0].trim();
                    room = parts[1]?.trim() ?? "";
                }

                const btn = signupForm.querySelector(".btn-primary");
                btn.disabled = true;

                try {
                    await signupWithEmail({ email, password, username, hostel, room });
                    window.location.href = "home.html";
                } catch (err) {
                    // console.error(err);
                    let msg = "Signup failed. Please try again.";
                    if (err.code === "auth/email-already-in-use") {
                        msg = "This email is already registered.";
                    } else if (err.code === "auth/weak-password") {
                        msg = "Password should be at least 6 characters.";
                    } else if (err.message) {
                        msg = err.message;
                    }
                    showMessage(signupForm, msg);
                } finally {
                    btn.disabled = false;
                }
            });

            const googleBtnSignup = signupForm.querySelector(".btn-google");
            if (googleBtnSignup) {
                googleBtnSignup.addEventListener("click", async () => {
                    try {
                        // After Google sign-in, ensure user doc exists
                        const result = await loginWithGoogle();
                        const user = result.user;
                        if (user && user.uid) {
                            const userDocRef = doc(db, "users", user.uid);
                            const snap = await getDoc(userDocRef);
                            if (!snap.exists()) {
                                // set a default document for Google users
                                await setDoc(userDocRef, {
                                    uid: user.uid,
                                    email: user.email || "",
                                    username: user.displayName || "Google User",
                                    hostel: "Not Assigned",
                                    room: "",
                                    createdAt: serverTimestamp()
                                });
                            }
                        }
                        // redirect
                        window.location.href = "home.html";
                    } catch (err) {
                        // console.error(err);
                        showMessage(signupForm, "Google Signup failed");
                    }
                });
            }
        }
    }


    // ============================================================
    // DASHBOARD LOGIC (HOME PAGE)
    // ============================================================

    if (maintenanceForm || rectorForm) {

        const userNameDisplay = document.getElementById("user-name-display");
        const userRoomDisplay = document.getElementById("user-room-display");

        const trackingTableBody = document.getElementById("tracking-table-body");
        const storedDataBody = document.getElementById("stored-data-body");


        // 📌 LOAD STORED DATA (Maintenance + Rector Complaints) - PUBLIC VISIBILITY
        async function loadStoredData() {
            console.log("Loading stored data (Public View)...");
            if (!storedDataBody) return;
            storedDataBody.innerHTML = "";
            let allItems = [];

            // 1️⃣ LOAD ALL MAINTENANCE REQUESTS
            try {
                const requests = await getAllRequests();
                console.log("Fetched all requests:", requests.length);
                allItems = [...allItems, ...requests];
            } catch (err) {
                console.error("Error loading request history:", err);
            }

            // 2️⃣ LOAD ALL RECTOR COMPLAINTS
            try {
                const complaints = await getAllRectorComplaints();
                const formattedComplaints = complaints.map(c => ({ ...c, isComplaint: true }));
                console.log("Fetched all complaints:", formattedComplaints.length);
                allItems = [...allItems, ...formattedComplaints];
            } catch (err) {
                console.error("Error loading rector complaints:", err);
            }

            // Sort all items by timestamp desc
            allItems.sort((a, b) => {
                const tA = a.timestamp ? a.timestamp.seconds : 0;
                const tB = b.timestamp ? b.timestamp.seconds : 0;
                return tB - tA;
            });

            if (allItems.length === 0) {
                storedDataBody.innerHTML = "<tr><td colspan='5'>No history found.</td></tr>";
                return;
            }

            // Render
            allItems.forEach(item => {
                let date = "Unknown";
                if (item.timestamp?.seconds) {
                    date = new Date(item.timestamp.seconds * 1000).toLocaleString();
                }

                const type = item.isComplaint ? (item.complaintType || "Rector Complaint") : (item.serviceType || "Maintenance");
                const status = item.status || "Submitted";
                // For public view, we show the username/room from the record
                const uName = item.username || "Anonymous";
                const uRoom = item.room || "N/A";

                storedDataBody.innerHTML += `
                    <tr>
                        <td>${uName}</td>
                        <td>${uRoom}</td>
                        <td>${type}</td>
                        <td>${date}</td>
                        <td>${status}</td>
                    </tr>
                `;
            });
        }


        // 🔥 AUTH LISTENER (load everything once logged in)
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                if (window.location.pathname.includes("home.html")) {
                    window.location.href = "index.html";
                }
                return;
            }

            // LOAD USER PROFILE
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                if (userNameDisplay) userNameDisplay.value = data.username || "";
                if (userRoomDisplay) userRoomDisplay.value = (data.hostel ? data.hostel + "-" : "") + (data.room || "");
            }

            // REALTIME TRACKING LISTENER
            if (trackingTableBody) {
                onUserRequestsRealtime(user.uid, (requests) => {
                    trackingTableBody.innerHTML = "";
                    requests.forEach(req => {
                        let date = "Unknown";
                        if (req.timestamp?.seconds) {
                            date = new Date(req.timestamp.seconds * 1000).toLocaleString();
                        }

                        const status = (req.status) ? req.status : "Pending";
                        const statusClass = String(status).toLowerCase().replace(/[^a-z0-9-_]/g, '-');

                        const shortId = req.id ? `#${String(req.id).slice(0, 5)}` : "#-----";
                        const serviceType = req.serviceType || "-";
                        const room = req.room || "-";

                        trackingTableBody.innerHTML += `
                            <tr>
                                <td>${shortId}</td>
                                <td>${serviceType}</td>
                                <td>${room}</td>
                                <td><span class="status-${statusClass}">${status}</span></td>
                                <td>${date}</td>
                            </tr>
                        `;
                    });
                });
            }

            // LOAD STORED DATA
            loadStoredData();
        });


        // SUBMIT MAINTENANCE REQUEST
        maintenanceForm?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const serviceType = document.getElementById("service-type").value;
            const description = document.getElementById("request-desc").value;
            const submitBtn = maintenanceForm.querySelector("button[type='submit']");

            const user = auth.currentUser;
            if (!user) return alert("Not logged in!");

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting...";

                // Use the values entered in the form
                const usernameInput = document.getElementById("user-name-display").value.trim();
                const roomInput = document.getElementById("user-room-display").value.trim();

                // If fields are empty, fallback to basic user info or "Anonymous"
                const username = usernameInput || (user.displayName || "Anonymous");
                const room = roomInput || "Not Assigned";

                await addRequest({
                    uid: user.uid,
                    username,
                    room,
                    serviceType,
                    description,
                    status: "Pending"
                });

                alert("Request submitted successfully!");
                maintenanceForm.reset();

                // Refresh stored data immediately
                loadStoredData();

            } catch (err) {
                console.error("Request failed:", err);
                alert("Failed to submit request: " + (err.message || err));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Request";
            }
        });


        // SUBMIT RECTOR COMPLAINT
        rectorForm?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const complaintType = document.getElementById("complaint-type").value;
            const description = document.getElementById("complaint-desc").value;
            const submitBtn = rectorForm.querySelector("button[type='submit']");

            const user = auth.currentUser;
            if (!user) return alert("You are not logged in.");

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting...";

                await addRectorComplaint({
                    uid: user.uid,
                    complaintType,
                    description,
                    status: "Submitted"
                });

                alert("Complaint submitted successfully!");
                rectorForm.reset();

                // Refresh stored data
                loadStoredData();

            } catch (err) {
                console.error("Complaint failed:", err);
                alert("Failed to submit complaint: " + (err.message || err));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit to Rector";
            }
        });
    }


    // ============================================================
    // AUTO REDIRECT HANDLER
    // ============================================================
    onAuthStateChanged(auth, (user) => {
        const onLoginPage =
            window.location.pathname.endsWith("index.html") ||
            window.location.pathname.endsWith("/") ||
            window.location.pathname === "";

        if (user && onLoginPage) {
            if (location.hostname === "localhost") return;
            window.location.href = "home.html";
        }
    });
}

// Run Init safely
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
