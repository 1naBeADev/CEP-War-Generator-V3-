import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

        const snapshot = await get(ref(db, "/"));

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
            const dbWinID = String(user["Win ID"]);

            if (
                dbTDomain === tDomainInput &&
                dbWinID === winIDInput
            ) {
                found = true;
                break;
            }
        }

        if (found) {
    // check if this is the admin account
            const isAdmin =
                tDomainInput === "t-jtagores" &&
                winIDInput === "52385305";

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