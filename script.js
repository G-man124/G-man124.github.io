"use strict";

/*
    My Play Store
    GitHub Pages / static-site version

    Storage:
    - IndexedDB: users and apps
    - localStorage: current login

    IMPORTANT:
    This is client-side authentication.
    It is NOT suitable for a real production
    multi-user application marketplace.
*/


/* ==========================================
   STATE
========================================== */

let db = null;

let users = [];
let apps = [];

let currentUser = null;
let currentCategory = "All";

let toastTimer = null;


/* ==========================================
   DATABASE
========================================== */

const DB_NAME = "MyPlayStore";
const DB_VERSION = 2;


function openDatabase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(DB_NAME, DB_VERSION);


        request.onupgradeneeded = event => {

            const database = event.target.result;


            if (!database.objectStoreNames.contains("users")) {

                database.createObjectStore("users", {
                    keyPath: "id"
                });

            }


            if (!database.objectStoreNames.contains("apps")) {

                database.createObjectStore("apps", {
                    keyPath: "id"
                });

            }

        };


        request.onsuccess = () => {

            db = request.result;

            resolve(db);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


/* ==========================================
   DATABASE HELPERS
========================================== */

function getAll(storeName) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(storeName, "readonly");

        const store =
            transaction.objectStore(storeName);

        const request =
            store.getAll();


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };

    });

}


function putItem(storeName, item) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(storeName, "readwrite");

        const store =
            transaction.objectStore(storeName);

        store.put(item);


        transaction.oncomplete = () => {

            resolve();

        };


        transaction.onerror = () => {

            reject(transaction.error);

        };

    });

}


function deleteItem(storeName, id) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(storeName, "readwrite");

        const store =
            transaction.objectStore(storeName);

        store.delete(id);


        transaction.oncomplete = () => {

            resolve();

        };


        transaction.onerror = () => {

            reject(transaction.error);

        };

    });

}


/* ==========================================
   START
========================================== */

async function startApp() {

    try {

        await openDatabase();

        users = await getAll("users");
        apps = await getAll("apps");

        restoreLogin();

        setupEvents();

        updateAuthUI();

        renderApps();

    } catch (error) {

        console.error(error);

        showToast(
            "Could not open local storage."
        );

    }

}


/* ==========================================
   AUTH
========================================== */

function restoreLogin() {

    const savedId =
        localStorage.getItem(
            "myPlayStoreUser"
        );


    if (!savedId) {

        currentUser = null;

        return;

    }


    currentUser =
        users.find(
            user =>
                String(user.id) === String(savedId)
        ) || null;

}


function updateAuthUI() {

    const loginButton =
        document.getElementById("loginButton");

    const signupButton =
        document.getElementById("signupButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const deleteAccountButton =
        document.getElementById(
            "deleteAccountButton"
        );

    const userMessage =
        document.getElementById("userMessage");


    if (currentUser) {

        loginButton.hidden = true;

        signupButton.hidden = true;

        logoutButton.hidden = false;

        deleteAccountButton.hidden = false;

        userMessage.hidden = false;

        userMessage.textContent =
            `Logged in as ${currentUser.username}`;

    } else {

        loginButton.hidden = false;

        signupButton.hidden = false;

        logoutButton.hidden = true;

        deleteAccountButton.hidden = true;

        userMessage.hidden = true;

    }

}



/* ==========================================
   SIGN UP
========================================== */

async function signup(event) {

    event.preventDefault();


    const username =
        document
            .getElementById("signupUsername")
            .value
            .trim();

    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("signupPassword")
            .value;


    const existing =
        users.find(
            user => user.email === email
        );


    if (existing) {

        showToast(
            "An account with that email already exists."
        );

        return;

    }


    const user = {

        id:
            crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()),

        username,

        email,

        password

    };


    await putItem("users", user);

    users.push(user);

    currentUser = user;


    localStorage.setItem(
        "myPlayStoreUser",
        user.id
    );


    document
        .getElementById("signupForm")
        .reset();


    closeModal("signupModal");

    updateAuthUI();

    renderApps();

    showToast(
        "Account created successfully!"
    );

}


/* ==========================================
   LOGIN
========================================== */

async function login(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const user =
        users.find(
            user =>
                user.email === email &&
                user.password === password
        );


    if (!user) {

        showToast(
            "Incorrect email or password."
        );

        return;

    }


    currentUser = user;


    localStorage.setItem(
        "myPlayStoreUser",
        user.id
    );


    document
        .getElementById("loginForm")
        .reset();


    closeModal("loginModal");

    updateAuthUI();

    renderApps();

    showToast(
        "Logged in successfully!"
    );

}


/* ==========================================
   LOGOUT
========================================== */

function logout() {

    currentUser = null;

    localStorage.removeItem(
        "myPlayStoreUser"
    );

    updateAuthUI();

    renderApps();

    showToast(
        "You have been logged out."
    );

}


/* ==========================================
   UPLOAD
========================================== */

async function uploadApp(event) {

    event.preventDefault();


    if (!currentUser) {

        closeModal("uploadModal");

        openModal("loginModal");

        showToast(
            "Please login before uploading."
        );

        return;

    }


    const name =
        document
            .getElementById("appName")
            .value
            .trim();

    const developer =
        document
            .getElementById("developer")
            .value
            .trim();

    const description =
        document
            .getElementById("description")
            .value
            .trim();

    const category =
        document
            .getElementById("category")
            .value;

    const iconFile =
        document
            .getElementById("icon")
            .files[0];

    const appFile =
        document
            .getElementById("appFile")
            .files[0];


    if (!iconFile || !appFile) {

        showToast(
            "Please select an icon and app file."
        );

        return;

    }


    if (!iconFile.type.startsWith("image/")) {

        showToast(
            "The app icon must be an image."
        );

        return;

    }


    try {

        const icon =
            await fileToDataURL(iconFile);

        const fileData =
            await fileToDataURL(appFile);


        const app = {

            id:
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : String(Date.now()),

            name,

            developer,

            description,

            category,

            icon,

            fileData,

            fileName: appFile.name,

            fileType:
                appFile.type ||
                "application/octet-stream",

            ownerId: currentUser.id,

            ownerUsername:
                currentUser.username,

            date:
                new Date().toISOString()

        };


        await putItem("apps", app);

        apps.push(app);


        document
            .getElementById("uploadForm")
            .reset();


        closeModal("uploadModal");

        renderApps();

        showToast(
            "App uploaded successfully!"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Could not upload the app."
        );

    }

}


/* ==========================================
   DELETE
========================================== */

async function deleteApp(id) {

    if (!currentUser) {

        showToast(
            "Please login first."
        );

        return;

    }


    const app =
        apps.find(
            item => String(item.id) === String(id)
        );


    if (!app) return;


    if (
        String(app.ownerId) !==
        String(currentUser.id)
    ) {

        showToast(
            "You can only delete your own apps."
        );

        return;

    }


    const confirmed =
        window.confirm(
            `Delete "${app.name}"?`
        );


    if (!confirmed) return;


    try {

        await deleteItem(
            "apps",
            id
        );


        apps =
            apps.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        renderApps();

        showToast(
            "App deleted successfully."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Could not delete the app."
        );

    }

}


/* ==========================================
   DOWNLOAD
========================================== */

function downloadApp(id) {

    const app =
        apps.find(
            item =>
                String(item.id) === String(id)
        );


    if (!app) return;


    try {

        const binary =
            dataURLToBlob(
                app.fileData,
                app.fileType
            );


        const url =
            URL.createObjectURL(binary);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            app.fileName ||
            "app-download";


        document.body.appendChild(link);

        link.click();

        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 1000);


    } catch (error) {

        console.error(error);

        showToast(
            "Could not download the app."
        );

    }

}


/* ==========================================
   DETAILS
========================================== */

function showDetails(id) {

    const app =
        apps.find(
            item =>
                String(item.id) === String(id)
        );


    if (!app) return;


    const content =
        document.getElementById(
            "detailsContent"
        );


    content.innerHTML = `

        <div class="details-header">

            <img
                class="details-icon"
                src="${escapeHTML(app.icon)}"
                alt=""
            >

            <div>

                <h2 class="details-title">
                    ${escapeHTML(app.name)}
                </h2>

                <p class="details-developer">
                    ${escapeHTML(app.developer)}
                </p>

            </div>

        </div>

        <div class="app-category">
            ${escapeHTML(app.category)}
        </div>

        <p class="details-description">
            ${escapeHTML(app.description)}
        </p>

        <button
            class="submit-button"
            type="button"
            data-download="${escapeHTML(String(app.id))}">
            Download
        </button>
    `;


    content
        .querySelector("[data-download]")
        .addEventListener(
            "click",
            () => downloadApp(app.id)
        );


    openModal("detailsModal");

}


/* ==========================================
   RENDER
========================================== */

function renderApps() {

    const grid =
        document.getElementById(
            "appGrid"
        );


    const search =
        document
            .getElementById("search")
            .value
            .trim()
            .toLowerCase();


    const filtered =
        apps.filter(app => {

            const searchable =
                [
                    app.name,
                    app.developer,
                    app.description,
                    app.category
                ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                searchable.includes(search);


            const matchesCategory =
                currentCategory === "All" ||
                app.category === currentCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    document.getElementById(
        "appCount"
    ).textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "app"
                : "apps"
        }`;


    grid.innerHTML = "";


    if (!filtered.length) {

        grid.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    📱
                </div>

                <h3>No apps found</h3>

                <p>
                    Try another search or upload an app.
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(app => {

        const card =
            document.createElement("article");


        card.className = "app-card";


        const isOwner =
            currentUser &&
            String(app.ownerId) ===
            String(currentUser.id);


        card.innerHTML = `

            <img
                class="app-icon"
                src="${escapeHTML(app.icon)}"
                alt=""
                loading="lazy"
            >

            <h3 class="app-name">
                ${escapeHTML(app.name)}
            </h3>

            <p class="app-developer">
                ${escapeHTML(app.developer)}
            </p>

            <span class="app-category">
                ${escapeHTML(app.category)}
            </span>

            <p class="app-description">
                ${escapeHTML(app.description)}
            </p>

            ${
                isOwner
                    ? `
                        <div class="owner-label">
                            ✓ Uploaded by you
                        </div>
                    `
                    : ""
            }

            <div class="app-actions">

                <button
                    class="details"
                    type="button"
                    data-action="details">
                    Details
                </button>

                <button
                    class="download"
                    type="button"
                    data-action="download">
                    Download
                </button>

                ${
                    isOwner
                        ? `
                            <button
                                class="delete"
                                type="button"
                                data-action="delete">
                                Delete
                            </button>
                        `
                        : ""
                }

            </div>
        `;


        card
            .querySelector(
                '[data-action="details"]'
            )
            .addEventListener(
                "click",
                () => showDetails(app.id)
            );


        card
            .querySelector(
                '[data-action="download"]'
            )
            .addEventListener(
                "click",
                () => downloadApp(app.id)
            );


        const deleteButton =
            card.querySelector(
                '[data-action="delete"]'
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => deleteApp(app.id)
            );

        }


        grid.appendChild(card);

    });

}


/* ==========================================
   CATEGORY
========================================== */

function setCategory(category, button) {

    currentCategory = category;


    document
        .querySelectorAll(".category")
        .forEach(item =>
            item.classList.remove("active")
        );


    button.classList.add("active");

    renderApps();

}


/* ==========================================
   MODALS
========================================== */

function openModal(id) {

    document
        .getElementById(id)
        .hidden = false;

}


function closeModal(id) {

    document
        .getElementById(id)
        .hidden = true;

}


/* ==========================================
   FILE HELPERS
========================================== */

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () =>
                resolve(reader.result);


            reader.onerror = () =>
                reject(reader.error);


            reader.readAsDataURL(file);

        }
    );

}


function dataURLToBlob(
    dataURL,
    type
) {

    const parts =
        dataURL.split(",");


    const binary =
        atob(parts[1]);


    const array =
        new Uint8Array(
            binary.length
        );


    for (
        let i = 0;
        i < binary.length;
        i++
    ) {

        array[i] =
            binary.charCodeAt(i);

    }


    return new Blob(
        [array],
        {
            type:
                type ||
                parts[0]
                    .match(/:(.*?);/)[1]
        }
    );

}


/* ==========================================
   SECURITY
========================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/* ==========================================
   TOAST
========================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


/* ==========================================
   EVENTS
========================================== */

function setupEvents() {

    document
        .getElementById("search")
        .addEventListener(
            "input",
            renderApps
        );


    document
        .getElementById("loginButton")
        .addEventListener(
            "click",
            () => openModal("loginModal")
        );


    document
        .getElementById("signupButton")
        .addEventListener(
            "click",
            () => openModal("signupModal")
        );


    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            logout
        );


    document
        .getElementById("uploadButton")
        .addEventListener(
            "click",
            handleUploadOpen
        );


    document
        .getElementById("heroUploadButton")
        .addEventListener(
            "click",
            handleUploadOpen
        );


    document
        .getElementById("signupForm")
        .addEventListener(
            "submit",
            signup
        );


    document
        .getElementById("loginForm")
        .addEventListener(
            "submit",
            login
        );


    document
        .getElementById("uploadForm")
        .addEventListener(
            "submit",
            uploadApp
        );


    document
        .querySelectorAll(".category")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    setCategory(
                        button.dataset.category,
                        button
                    )
            );

        });


    document
        .querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    closeModal(
                        button.dataset.close
                    )
            );

        });


    document
        .getElementById("switchLogin")
        .addEventListener(
            "click",
            () => {

                closeModal("signupModal");

                openModal("loginModal");

            }
        );


    document
        .getElementById("switchSignup")
        .addEventListener(
            "click",
            () => {

                closeModal("loginModal");

                openModal("signupModal");

            }
        );


    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeModal(
                            modal.id
                        );

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(".modal")
                    .forEach(modal => {

                        closeModal(
                            modal.id
                        );

                    });

            }

        }
    );

}


function handleUploadOpen() {

    if (!currentUser) {

        openModal("loginModal");

        showToast(
            "Login or create an account to upload."
        );

        return;

    }


    openModal("uploadModal");

}
async function deleteAccount() {

    if (!currentUser) {
        showToast("You are not logged in.");
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete your account?\n\n" +
        "This will permanently delete:\n" +
        "• Your account\n" +
        "• All apps you uploaded\n" +
        "• Your login information\n\n" +
        "This cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {

        // Delete the user's account
        await deleteItem(
            "users",
            currentUser.id
        );

        // Find all apps uploaded by this user
        const userApps = apps.filter(
            app =>
                String(app.ownerId) ===
                String(currentUser.id)
        );

        // Delete all of their apps
        for (const app of userApps) {

            await deleteItem(
                "apps",
                app.id
            );

        }

        // Remove apps from memory
        apps = apps.filter(
            app =>
                String(app.ownerId) !==
                String(currentUser.id)
        );

        // Remove user from memory
        users = users.filter(
            user =>
                String(user.id) !==
                String(currentUser.id)
        );

        // Log out
        currentUser = null;

        // Remove saved login
        localStorage.removeItem(
            "myPlayStoreUser"
        );

        updateAuthUI();

        renderApps();

        showToast(
            "Your account has been deleted."
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Could not delete your account."
        );

    }
}



/* ==========================================
   RUN
========================================== */

startApp();

