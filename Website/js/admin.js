import { auth, db, storage } from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const loginForm = document.getElementById("loginForm");
const logoutButton = document.getElementById("logoutButton");
const authStatus = document.getElementById("authStatus");
const noticeForm = document.getElementById("noticeForm");
const fileForm = document.getElementById("fileForm");
const courseForm = document.getElementById("courseForm");
const noticeList = document.getElementById("noticeList");
const uploadList = document.getElementById("uploadList");
const courseList = document.getElementById("courseList");
const fileStatus = document.getElementById("fileStatus");
const noticeCount = document.getElementById("noticeCount");
const uploadCount = document.getElementById("uploadCount");
const noticeMetric = document.getElementById("noticeMetric");
const uploadMetric = document.getElementById("uploadMetric");
const courseMetric = document.getElementById("courseMetric");
const ADMIN_EMAILS = new Set(["info@samarthya.edu.np"]);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const splitHighlights = (value) =>
  String(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const setStatus = (message, tone = "neutral") => {
  if (!authStatus) return;
  authStatus.dataset.tone = tone;
  authStatus.textContent = message;
};

const toggleView = (signedIn) => {
  loginPanel?.classList.toggle("hidden", signedIn);
  dashboardPanel?.classList.toggle("hidden", !signedIn);
};

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    setStatus("Signing in...", "neutral");
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    setStatus(error.message.replace("Firebase:", "").trim(), "error");
  }
});

logoutButton?.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  toggleView(Boolean(user));
  if (user) {
    if (!ADMIN_EMAILS.has(user.email)) {
      signOut(auth);
      setStatus("This account is not allowed to access the admin panel.", "error");
      return;
    }

    setStatus(`Signed in as ${user.email}`, "success");
  } else {
    setStatus("Sign in to manage notices, uploads, and admin content.", "neutral");
  }
});

noticeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("noticeTitle").value.trim();
  const body = document.getElementById("noticeBody").value.trim();
  const category = document.getElementById("noticeCategory").value;

  if (!title || !body) return;

  const submitButton = noticeForm.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Publishing...";

  try {
    await addDoc(collection(db, "notices"), {
      title,
      body,
      category,
      createdAt: serverTimestamp(),
    });
    noticeForm.reset();
    setStatus("Notice published.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

fileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("uploadFile");
  const labelInput = document.getElementById("uploadLabel");
  const file = fileInput.files?.[0];

  if (!file) {
    fileStatus.textContent = "Choose a file first.";
    return;
  }

  const submitButton = fileForm.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Uploading...";
  fileStatus.textContent = "Uploading file to Firebase Storage...";

  try {
    const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "files"), {
      label: labelInput.value.trim() || file.name,
      fileName: file.name,
      fileURL: downloadURL,
      contentType: file.type || "application/octet-stream",
      createdAt: serverTimestamp(),
    });

    fileForm.reset();
    fileStatus.textContent = "File uploaded and saved.";
  } catch (error) {
    fileStatus.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

courseForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("courseTitle").value.trim();
  const category = document.getElementById("courseCategory").value;
  const level = document.getElementById("courseLevel").value.trim();
  const duration = document.getElementById("courseDuration").value.trim();
  const description = document.getElementById("courseDescription").value.trim();
  const status = document.getElementById("courseStatus").value;
  const highlights = splitHighlights(document.getElementById("courseHighlights").value);

  if (!title || !description) return;

  const submitButton = courseForm.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    await addDoc(collection(db, "courses"), {
      title,
      slug: slugify(title),
      category,
      level,
      duration,
      description,
      highlights,
      status,
      createdAt: serverTimestamp(),
    });

    courseForm.reset();
    setStatus("Course added.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

const noticeQuery = query(collection(db, "notices"), orderBy("createdAt", "desc"));
onSnapshot(noticeQuery, (snapshot) => {
  if (!noticeList) return;
  [noticeCount, noticeMetric].forEach((element) => {
    if (element) element.textContent = String(snapshot.size);
  });
  if (snapshot.empty) {
    noticeList.innerHTML = "<p class='empty-state'>No notices yet.</p>";
    return;
  }

  noticeList.innerHTML = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      return `
        <article class="admin-item">
          <div class="admin-item-top">
            <span class="pill">${escapeHtml(data.category || "general")}</span>
            <span class="admin-meta">${createdAt.toLocaleString()}</span>
          </div>
          <h3>${escapeHtml(data.title || "Untitled notice")}</h3>
          <p>${escapeHtml(data.body || "")}</p>
        </article>
      `;
    })
    .join("");
});

const fileQuery = query(collection(db, "files"), orderBy("createdAt", "desc"));
onSnapshot(fileQuery, (snapshot) => {
  if (!uploadList) return;
  [uploadCount, uploadMetric].forEach((element) => {
    if (element) element.textContent = String(snapshot.size);
  });
  if (snapshot.empty) {
    uploadList.innerHTML = "<p class='empty-state'>No uploads yet.</p>";
    return;
  }

  uploadList.innerHTML = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      return `
        <article class="admin-item">
          <div class="admin-item-top">
            <span class="pill">storage</span>
            <span class="admin-meta">${createdAt.toLocaleString()}</span>
          </div>
          <h3>${escapeHtml(data.label || data.fileName || "Uploaded file")}</h3>
          <a href="${escapeHtml(data.fileURL)}" target="_blank" rel="noopener">Open file</a>
        </article>
      `;
    })
    .join("");
});

const courseQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
onSnapshot(courseQuery, (snapshot) => {
  if (!courseList) return;
  [courseMetric].forEach((element) => {
    if (element) element.textContent = String(snapshot.size);
  });
  if (snapshot.empty) {
    courseList.innerHTML = "<p class='empty-state'>No courses yet.</p>";
    return;
  }

  courseList.innerHTML = snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      const highlights = Array.isArray(data.highlights) ? data.highlights : [];
      return `
        <article class="admin-item course-item">
          <div class="admin-item-top">
            <span class="pill">${escapeHtml(data.category || "course")}</span>
            <span class="admin-meta">${createdAt.toLocaleString()}</span>
          </div>
          <h3>${escapeHtml(data.title || "Untitled course")}</h3>
          <p>${escapeHtml(data.description || "")}</p>
          <div class="course-meta">
            ${data.level ? `<span>${escapeHtml(data.level)}</span>` : ""}
            ${data.duration ? `<span>${escapeHtml(data.duration)}</span>` : ""}
            ${data.status ? `<span>${escapeHtml(data.status)}</span>` : ""}
          </div>
          ${
            highlights.length
              ? `<div class="course-tags">${highlights
                  .map((item) => `<span>${escapeHtml(item)}</span>`)
                  .join("")}</div>`
              : ""
          }
        </article>
      `;
    })
    .join("");
});
