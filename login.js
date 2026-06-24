import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "autodocs-a12f0.firebaseapp.com",
    databaseURL: "https://autodocs-a12f0-default-rtdb.firebaseio.com/",
    projectId: "autodocs-a12f0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const loginBtn = document.getElementById("loginBtn");

// Force T-Domain input to lowercase while typing
document.getElementById("empName").addEventListener("input", function () {
    this.value = this.value.toLowerCase();
});

loginBtn.addEventListener("click", async () => {

    const tDomainInput = document
        .getElementById("empName")
        .value
        .trim()
        .toLowerCase();

    const winIDInput = document
        .getElementById("winID")
        .value
        .trim();

    if (!tDomainInput || !winIDInput) {
        alert("Please enter T-Domain and Win ID.");
        return;
    }

    try {

        // Read only the employees node
        const snapshot = await get(ref(db, "employees"));

        if (!snapshot.exists()) {
            alert("No employee data found.");
            return;
        }

        const users = snapshot.val();

        let found = false;

        for (const key in users) {

            const user = users[key];

            const dbTDomain = String(user["PLDTSMART Domain"] || "")
                .trim()
                .toLowerCase();

            const dbWinID = String(user["Win ID"] || "")
                .trim();

        if (
            dbTDomain === tDomainInput &&
            dbWinID === winIDInput
        ) {
            found = true;

            // Save employee info for later use
            sessionStorage.setItem(
                "employeeName",
                user["Employee Name"]
            );

            break;
        }
        }

        if (found) {

            const employeeName = sessionStorage.getItem("employeeName");

            const loginRecord = {
                employeeName: employeeName,
                tDomain: tDomainInput,
                winID: winIDInput,

                loginDateTime: new Date().toLocaleString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }),

                timestamp: Date.now()
            };

            // Save to Firebase
            const loginRef = push(ref(db, "loginHistory"));

            await set(loginRef, loginRecord);

            // Check if this is the admin account
            const isAdmin =
                tDomainInput === "t-jtagores" &&
                winIDInput === "52385305";

            // Save login info for dashboard use
            sessionStorage.setItem("winID", winIDInput);
            sessionStorage.setItem("tDomain", tDomainInput);

            if (isAdmin) {
                alert("Admin Login Successful!");
                window.location.href = "admin.html";
            } else {
                alert("Login Successful!");
                window.location.href = "dashboard.html";
            }

        } else {
            alert("Invalid T-Domain or Win ID");
        }

    } catch (error) {
        console.error("Firebase Error:", error);
        alert("Database Error: " + error.message);
    }

});



//save

