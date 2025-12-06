// firebase.js
// Modular Firebase v10 - initializes app, auth, firestore and provides helper functions

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    doc,
    getDoc,
    query,
    where,
    onSnapshot,
    getDocs,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ---------- REPLACE WITH YOUR CONFIG ----------
const firebaseConfig = {
    apiKey: "AIzaSyCbxDkifekEb25Gs6n6vIlyIcb_xjBE7Hw",
    authDomain: "fixitnow-e263e.firebaseapp.com",
    projectId: "fixitnow-e263e",
    storageBucket: "fixitnow-e263e.firebasestorage.app",
    messagingSenderId: "67315244868",
    appId: "1:67315244868:web:38c4547225ea9f6e9b0111",
    measurementId: "G-983LN68397"
};
// ---------------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ------------------- Helper wrappers ------------------- */

/**
 * Create new user with email/password and create user document in Firestore
 * @param {{email: string, password: string, username:string, hostel:string, room:string}} userData
 */
async function signupWithEmail(userData) {
    const { email, password, username, hostel, room } = userData;
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
        uid,
        email,
        username,
        hostel,
        room,
        createdAt: serverTimestamp()
    });

    return userCred;
}

/**
 * Sign in with email/password
 * @param {string} email
 * @param {string} password
 */
async function loginWithEmail(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with Google (popup)
 */
async function loginWithGoogle() {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(auth, googleProvider);
}

/**
 * Sign out current user
 */
async function signOutUser() {
    return await signOut(auth);
}

/**
 * Create a maintenance request document
 * @param {object} requestData - { uid, username, room, serviceType, description }
 */
async function addRequest(requestData) {
    const docRef = await addDoc(collection(db, "requests"), {
        ...requestData,
        status: "Pending",
        timestamp: serverTimestamp()
    });
    return docRef;
}

/**
 * Create rector complaint
 * @param {object} complaintData - { uid, complaintType, description }
 */
async function addRectorComplaint(complaintData) {
    const docRef = await addDoc(collection(db, "rectorComplaints"), {
        ...complaintData,
        status: "Submitted",
        timestamp: serverTimestamp()
    });
    return docRef;
}

/**
 * Get user's requests (once)
 * @param {string} uid
 */
async function getUserRequests(uid) {
    const q = query(
        collection(db, "requests"),
        where("uid", "==", uid)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort in memory to avoid missing index error
    return items.sort((a, b) => {
        const tA = a.timestamp ? a.timestamp.seconds : 0;
        const tB = b.timestamp ? b.timestamp.seconds : 0;
        return tB - tA;
    });
}

/**
 * Listen in realtime to user's requests (callback receives array)
 * @param {string} uid
 * @param {(arr: any[]) => void} onChange
 */
function onUserRequestsRealtime(uid, onChange) {
    const q = query(
        collection(db, "requests"),
        where("uid", "==", uid)
    );
    return onSnapshot(q, snapshot => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory
        items.sort((a, b) => {
            const tA = a.timestamp ? a.timestamp.seconds : 0;
            const tB = b.timestamp ? b.timestamp.seconds : 0;
            return tB - tA;
        });
        onChange(items);
    });
}

/* ------------------- Public Data Fetching ------------------- */

/**
 * Get ALL maintenance requests (for public view)
 */
async function getAllRequests() {
    const snap = await getDocs(collection(db, "requests"));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return items.sort((a, b) => {
        const tA = a.timestamp ? a.timestamp.seconds : 0;
        const tB = b.timestamp ? b.timestamp.seconds : 0;
        return tB - tA;
    });
}

/**
 * Get ALL rector complaints (for public view)
 */
async function getAllRectorComplaints() {
    const snap = await getDocs(collection(db, "rectorComplaints"));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return items.sort((a, b) => {
        const tA = a.timestamp ? a.timestamp.seconds : 0;
        const tB = b.timestamp ? b.timestamp.seconds : 0;
        return tB - tA;
    });
}

/* ------------------- Export what you need ------------------- */

export {
    app,
    auth,
    db,
    googleProvider,
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    signOutUser,
    addRequest,
    addRectorComplaint,
    getUserRequests,
    onUserRequestsRealtime,
    getDoc,
    doc,
    serverTimestamp,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    onAuthStateChanged,
    getAllRequests,
    getAllRectorComplaints,
    setDoc    // <-- ADDED export so other modules can create/update docs
};
