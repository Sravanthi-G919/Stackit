import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "https://stackit-backend-ntvj.onrender.com/api";

function App() {
  // =========================================================
  // USER
  // =========================================================

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  // =========================================================
  // AUTH
  // =========================================================

  const [showSignup, setShowSignup] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // =========================================================
  // FILES
  // =========================================================

  const [files, setFiles] = useState([]);
  const [trashFiles, setTrashFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activePage, setActivePage] = useState("mydrive");

  const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode") || "list"
  );

  // =========================================================
  // THEME
  // =========================================================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // =========================================================
  // MODALS
  // =========================================================

  const [showShare, setShowShare] = useState(false);
  const [shareFile, setShareFile] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  const [showSettings, setShowSettings] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================================================
  // DRAG DROP
  // =========================================================

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // =========================================================
  // COLORS
  // =========================================================

  const theme = darkMode
    ? {
        page: "#0f172a",
        sidebar: "#111827",
        card: "#1e293b",
        card2: "#172033",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#334155",
        input: "#0f172a",
        hover: "#273449",
      }
    : {
        page: "#f8fafc",
        sidebar: "#ffffff",
        card: "#ffffff",
        card2: "#f8fafc",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        input: "#ffffff",
        hover: "#f1f5f9",
      };

  // =========================================================
  // SAVE THEME / VIEW
  // =========================================================

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  // =========================================================
  // MESSAGE AUTO CLEAR
  // =========================================================

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

  // =========================================================
  // SPRINKLE EFFECT
  // =========================================================

  const sprinkle = (event) => {
    const colors = [
      "#2563eb",
      "#7c3aed",
      "#ec4899",
      "#f59e0b",
      "#16a34a",
      "#ef4444",
      "#06b6d4",
    ];

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("span");

      particle.innerHTML = "✦";

      particle.style.position = "fixed";
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.zIndex = "99999";
      particle.style.pointerEvents = "none";
      particle.style.fontSize = `${8 + Math.random() * 10}px`;
      particle.style.color =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.transition =
        "transform 650ms ease-out, opacity 650ms ease-out";

      document.body.appendChild(particle);

      const x = (Math.random() - 0.5) * 140;
      const y = (Math.random() - 0.5) * 140;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${x}px, ${y}px) rotate(${
          Math.random() * 360
        }deg)`;
        particle.style.opacity = "0";
      });

      setTimeout(() => {
        particle.remove();
      }, 700);
    }
  };

  // =========================================================
  // GLOBAL CLICK
  // =========================================================

  useEffect(() => {
    const handleClick = (e) => {
      if (
        e.target.tagName === "BUTTON" ||
        e.target.closest("button")
      ) {
        sprinkle(e);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // =========================================================
  // LOAD MY FILES
  // =========================================================

  const loadFiles = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${API_URL}/files?username=${encodeURIComponent(username)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load files");
      }

      const data = await response.json();

      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage("Cannot load files.");
    }
  };

  // =========================================================
  // LOAD TRASH
  // =========================================================

  const loadTrash = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `${API_URL}/files/trash?username=${encodeURIComponent(username)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load trash");
      }

      const data = await response.json();

      setTrashFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage("Cannot load Trash.");
    }
  };

  // =========================================================
  // LOAD SHARED FILES
  // =========================================================

  const loadSharedFiles = async () => {
    if (!userEmail) {
      setMessage(
        "Your email is not available. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/shares/received?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to load shared files");
      }

      const data = await response.json();

      const details = await Promise.all(
        data.map(async (share) => {
          try {
            const fileResponse = await fetch(
              `${API_URL}/files/${share.fileId}`
            );

            if (fileResponse.ok) {
              const fileData = await fileResponse.json();

              return {
                ...share,
                fileName: fileData.fileName,
                fileSize: fileData.fileSize,
                fileType: fileData.fileType,
              };
            }
          } catch (error) {
            console.error(error);
          }

          return {
            ...share,
            fileName: `File ${share.fileId}`,
          };
        })
      );

      setSharedFiles(details);
    } catch (error) {
      console.error(error);
      setMessage("Cannot load shared files.");
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (username) {
      loadFiles();
    }
  }, [username]);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async () => {
    if (!loginUsername.trim() || !loginPassword) {
      setMessage("Please enter username and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });

      const resultText = await response.text();

      if (!response.ok) {
        throw new Error(resultText || "Invalid login");
      }

      let result = null;

      try {
        result = JSON.parse(resultText);
      } catch {
        result = null;
      }

      const loggedUsername =
        result?.username || loginUsername.trim();

      const loggedEmail =
        result?.email ||
        result?.userEmail ||
        "";

      localStorage.setItem("username", loggedUsername);

      if (loggedEmail) {
        localStorage.setItem("userEmail", loggedEmail);
      }

      setUsername(loggedUsername);
      setUserEmail(loggedEmail);

      setLoginUsername("");
      setLoginPassword("");

      setMessage(
        result?.message || "Login successful."
      );
    } catch (error) {
      console.error(error);
      setMessage("Invalid username or password.");
    }
  };

  // =========================================================
  // SIGNUP
  // =========================================================

  const signup = async () => {
    const trimmedUsername = signupUsername.trim();
    const trimmedEmail = signupEmail.trim();

    const usernameRegex =
      /^(?=.*[A-Za-z])[A-Za-z0-9_]+$/;

    const emailRegex =
      /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;

    if (!trimmedUsername) {
      setMessage("Please enter a username.");
      return;
    }

    if (!usernameRegex.test(trimmedUsername)) {
      setMessage(
        "Username can contain letters, numbers and underscore only."
      );
      return;
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!signupPassword) {
      setMessage("Please enter your password.");
      return;
    }

    if (signupPassword.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password: signupPassword,
        }),
      });

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(result || "Account created successfully.");

      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");

      setShowSignup(false);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Signup failed.");
    }
  };

  // =========================================================
  // UPLOAD
  // =========================================================

  const uploadSingleFile = async (file) => {
    if (!file) return;

    if (!username) {
      setMessage("Please login first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("username", username);

    try {
      const response = await fetch(
        `${API_URL}/files/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(
        result || `${file.name} uploaded successfully.`
      );

      await loadFiles();
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "File upload failed."
      );
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    await uploadSingleFile(selectedFile);

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // DRAG AND DROP
  // =========================================================

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const droppedFiles = Array.from(
      e.dataTransfer.files || []
    );

    if (!droppedFiles.length) {
      return;
    }

    setMessage(
      `Uploading ${droppedFiles.length} file${
        droppedFiles.length > 1 ? "s" : ""
      }...`
    );

    for (const file of droppedFiles) {
      await uploadSingleFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSelectedFile(null);

    await loadFiles();
  };

  // =========================================================
  // DOWNLOAD
  // =========================================================

  const downloadFile = (id, fileName) => {
    const link = document.createElement("a");

    link.href = `${API_URL}/files/download/${id}`;
    link.download = fileName || "download";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteFile = async (id) => {
    const confirmed = window.confirm(
      "Move this file to Trash?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/files/${id}?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(result || "File moved to Trash.");

      await loadFiles();
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "File deletion failed."
      );
    }
  };

  // =========================================================
  // ⭐ STAR / UNSTAR
  // =========================================================

  const isFileStarred = (value) => {
    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true"
    );
  };

  const toggleStar = async (id, currentStarred) => {
    const oldStarred = isFileStarred(currentStarred);
    const newStarred = !oldStarred;

    // -------------------------------------------------------
    // INSTANT UI UPDATE
    // -------------------------------------------------------

    setFiles((previous) =>
      previous.map((file) =>
        file.id === id
          ? {
              ...file,
              starred: newStarred,
            }
          : file
      )
    );

    try {
      const response = await fetch(
        `${API_URL}/files/${id}/star?username=${encodeURIComponent(
          username
        )}`,
        {
          method: newStarred ? "PUT" : "DELETE",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(
          result || "Unable to update starred status."
        );
      }

      setMessage(
        newStarred
          ? "⭐ File added to Starred."
          : "☆ File removed from Starred."
      );

      // -------------------------------------------------------
      // SYNC WITH DATABASE
      // -------------------------------------------------------

      await loadFiles();
    } catch (error) {
      console.error(error);

      // -------------------------------------------------------
      // ROLLBACK IF BACKEND FAILS
      // -------------------------------------------------------

      setFiles((previous) =>
        previous.map((file) =>
          file.id === id
            ? {
                ...file,
                starred: oldStarred,
              }
            : file
        )
      );

      setMessage(
        error.message ||
          "Unable to update starred status."
      );
    }
  };

  // =========================================================
  // SHARE
  // =========================================================

  const shareFileWithEmail = async () => {
    if (!shareFile) {
      setMessage("Please select a file.");
      return;
    }

    const email = shareEmail.trim();

    const emailRegex =
      /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;

    if (!email || !emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/shares/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: shareFile.id,
            ownerUsername: username,
            sharedWithEmail: email,
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(
        result || "File shared successfully."
      );

      setShowShare(false);
      setShareFile(null);
      setShareEmail("");
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "File sharing failed."
      );
    }
  };

  // =========================================================
  // RESTORE
  // =========================================================

  const restoreFile = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/files/${id}/restore?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "PUT",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(
        result || "File restored successfully."
      );

      await loadTrash();
      await loadFiles();
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "File restore failed."
      );
    }
  };

  // =========================================================
  // PERMANENT DELETE
  // =========================================================

  const permanentDelete = async (id) => {
    const confirmed = window.confirm(
      "This will permanently delete the file. Continue?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/files/${id}/permanent?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(
        result || "File permanently deleted."
      );

      await loadTrash();
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "Permanent deletion failed."
      );
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const changePassword = async () => {
    if (!currentPassword) {
      setMessage("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setMessage("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setMessage("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setMessage(
        "New password must be different from current password."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/users/password?username=${encodeURIComponent(
          username
        )}&currentPassword=${encodeURIComponent(
          currentPassword
        )}&newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: "PUT",
        }
      );

      const resultText = await response.text();

      let result = null;

      try {
        result = JSON.parse(resultText);
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            resultText ||
            "Password change failed."
        );
      }

      setMessage(
        result?.message ||
          resultText ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowSettings(false);
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Password change failed."
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");

    setUsername("");
    setUserEmail("");

    setFiles([]);
    setTrashFiles([]);
    setSharedFiles([]);

    setMessage("");
    setSearch("");

    setActivePage("mydrive");

    setShowShare(false);
    setShowSettings(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatSize = (bytes) => {
    const value = Number(bytes || 0);

    if (value === 0) return "0 Bytes";

    if (value < 1024) {
      return `${value} Bytes`;
    }

    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    }

    if (value < 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(
      value /
      (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;
  };

  const getFileIcon = (fileName = "", fileType = "") => {
    const name = fileName.toLowerCase();

    if (
      fileType?.includes("image") ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
    ) {
      return "🖼️";
    }

    if (
      fileType?.includes("pdf") ||
      name.endsWith(".pdf")
    ) {
      return "📕";
    }

    if (/\.(doc|docx)$/i.test(name)) {
      return "📘";
    }

    if (/\.(xls|xlsx|csv)$/i.test(name)) {
      return "📗";
    }

    if (/\.(ppt|pptx)$/i.test(name)) {
      return "📙";
    }

    if (/\.(zip|rar|7z)$/i.test(name)) {
      return "🗜️";
    }

    if (/\.(mp4|avi|mkv|mov)$/i.test(name)) {
      return "🎬";
    }

    if (/\.(mp3|wav|aac)$/i.test(name)) {
      return "🎵";
    }

    if (
      /\.(js|jsx|java|py|cpp|c|html|css)$/i.test(name)
    ) {
      return "💻";
    }

    return "📄";
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const starredFiles = useMemo(
    () =>
      files.filter((file) =>
        isFileStarred(file.starred)
      ),
    [files]
  );

  const storageUsed = useMemo(
    () =>
      files.reduce(
        (total, file) =>
          total + Number(file.fileSize || 0),
        0
      ),
    [files]
  );

  // =========================================================
  // FILTER
  // =========================================================

  const filteredFiles = useMemo(() => {
    const query = search.toLowerCase().trim();

    let result = files;

    if (activePage === "starred") {
      result = starredFiles;
    }

    if (!query) {
      return result;
    }

    return result.filter((file) =>
      String(file.fileName || "")
        .toLowerCase()
        .includes(query)
    );
  }, [
    files,
    starredFiles,
    search,
    activePage,
  ]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigate = async (page) => {
    setActivePage(page);
    setSearch("");

    if (page === "mydrive") {
      await loadFiles();
    }

    if (page === "starred") {
      await loadFiles();
    }

    if (page === "trash") {
      await loadTrash();
    }

    if (page === "shared") {
      await loadSharedFiles();
    }
  };

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (!username) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg,#0f172a,#1d4ed8,#312e81)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          fontFamily: "Inter,Arial,sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#ffffff",
            borderRadius: "24px",
            padding: "40px",
            boxShadow:
              "0 30px 80px rgba(0,0,0,.35)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                fontSize: "60px",
                marginBottom: "10px",
              }}
            >
              ☁️
            </div>

            <h1
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "32px",
              }}
            >
              Stackit 
            </h1>

            <p
              style={{
                color: "#64748b",
              }}
            >
              Secure. Simple. Organized.
            </p>
          </div>

          {!showSignup ? (
            <>
              <h2
                style={{
                  color: "#0f172a",
                  textAlign: "center",
                }}
              >
                Welcome back
              </h2>

              <input
                value={loginUsername}
                onChange={(e) =>
                  setLoginUsername(e.target.value)
                }
                placeholder="Username"
                style={inputStyle}
              />

              <input
                type="password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") login();
                }}
                placeholder="Password"
                style={inputStyle}
              />

              <button
                onClick={login}
                style={{
                  ...primaryButton,
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                🔐 Sign In
              </button>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  marginTop: "25px",
                }}
              >
                Don't have an account?
              </p>

              <button
                onClick={() => {
                  setShowSignup(true);
                  setMessage("");
                }}
                style={{
                  ...secondaryButton,
                  width: "100%",
                }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <h2
                style={{
                  color: "#0f172a",
                  textAlign: "center",
                }}
              >
                Create Account
              </h2>

              <input
                value={signupUsername}
                onChange={(e) =>
                  setSignupUsername(e.target.value)
                }
                placeholder="Username"
                style={inputStyle}
              />

              <input
                type="email"
                value={signupEmail}
                onChange={(e) =>
                  setSignupEmail(e.target.value)
                }
                placeholder="Email address"
                style={inputStyle}
              />

              <input
                type="password"
                value={signupPassword}
                onChange={(e) =>
                  setSignupPassword(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") signup();
                }}
                placeholder="Password"
                style={inputStyle}
              />

              <button
                onClick={signup}
                style={{
                  ...successButton,
                  width: "100%",
                }}
              >
                ✅ Create Account
              </button>

              <button
                onClick={() => {
                  setShowSignup(false);
                  setMessage("");
                }}
                style={{
                  ...secondaryButton,
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                ← Back to Sign In
              </button>
            </>
          )}

          {message && (
            <MessageBox message={message} />
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.page,
        color: theme.text,
        fontFamily:
          "Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif",
        display: "flex",
        transition: "background .25s,color .25s",
      }}
    >
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        style={{
          width: "245px",
          minHeight: "100vh",
          background: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          padding: "24px 15px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
        }}
      >
        {/* LOGO */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 12px 25px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "13px",
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "23px",
            }}
          >
            ☁️
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              CloudDrive
            </div>

            <div
              style={{
                fontSize: "11px",
                color: theme.muted,
              }}
            >
              Secure storage
            </div>
          </div>
        </div>

        {/* NEW UPLOAD */}

        <button
          onClick={() =>
            fileInputRef.current?.click()
          }
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg,#2563eb,#4f46e5)",
            color: "#fff",
            fontWeight: "800",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "25px",
            boxShadow:
              "0 8px 20px rgba(37,99,235,.25)",
          }}
        >
          ＋ New Upload
        </button>

        {/* NAVIGATION */}

        <div
          style={{
            fontSize: "11px",
            color: theme.muted,
            fontWeight: "800",
            padding: "0 12px 8px",
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          Storage
        </div>

        <SidebarButton
          icon="📁"
          label="My Drive"
          active={activePage === "mydrive"}
          count={files.length}
          onClick={() => navigate("mydrive")}
          theme={theme}
        />

        <SidebarButton
          icon="⭐"
          label="Starred"
          active={activePage === "starred"}
          count={starredFiles.length}
          onClick={() => navigate("starred")}
          theme={theme}
        />

        <SidebarButton
          icon="🔗"
          label="Shared with me"
          active={activePage === "shared"}
          onClick={() => navigate("shared")}
          theme={theme}
        />

        <SidebarButton
          icon="🗑️"
          label="Trash"
          active={activePage === "trash"}
          count={trashFiles.length}
          onClick={() => navigate("trash")}
          theme={theme}
        />

        {/* DIVIDER */}

        <div
          style={{
            height: "1px",
            background: theme.border,
            margin: "22px 10px",
          }}
        />

        {/* ACCOUNT */}

        <div
          style={{
            fontSize: "11px",
            color: theme.muted,
            fontWeight: "800",
            padding: "0 12px 8px",
            textTransform: "uppercase",
          }}
        >
          Account
        </div>

        <button
          onClick={() => {
            setShowSettings(true);
            setMessage("");
          }}
          style={{
            ...sidebarButtonStyle(theme),
          }}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            ...sidebarButtonStyle(theme),
          }}
        >
          <span>{darkMode ? "☀️" : "🌙"}</span>
          <span>
            {darkMode ? "Light mode" : "Dark mode"}
          </span>
        </button>

        <button
          onClick={logout}
          style={{
            ...sidebarButtonStyle(theme),
            color: "#ef4444",
          }}
        >
          <span>↪️</span>
          <span>Logout</span>
        </button>

        {/* USER */}

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "15px",
            right: "15px",
            padding: "12px",
            borderRadius: "12px",
            background: theme.card2,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            style={{
              fontWeight: "700",
              fontSize: "13px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            👤 {username}
          </div>

          {userEmail && (
            <div
              style={{
                fontSize: "11px",
                color: theme.muted,
                marginTop: "3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </div>
          )}
        </div>
      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* HEADER */}

        <header
          style={{
            height: "72px",
            background: theme.sidebar,
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            gap: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "800",
            }}
          >
            {activePage === "mydrive" && "My Drive"}
            {activePage === "starred" && "⭐ Starred"}
            {activePage === "shared" &&
              "🔗 Shared with me"}
            {activePage === "trash" && "🗑️ Trash"}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              maxWidth: "520px",
            }}
          >
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="🔍 Search in CloudDrive..."
              style={{
                ...searchStyle(theme),
                flex: 1,
              }}
            />

            <button
              onClick={() => {
                if (
                  activePage === "mydrive" ||
                  activePage === "starred"
                ) {
                  loadFiles();
                } else if (
                  activePage === "trash"
                ) {
                  loadTrash();
                } else {
                  loadSharedFiles();
                }
              }}
              style={{
                ...iconButton(theme),
              }}
              title="Refresh"
            >
              🔄
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "5px",
              background: theme.card2,
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding: "4px",
            }}
          >
            <button
              onClick={() => setViewMode("list")}
              style={{
                ...viewToggle(theme),
                background:
                  viewMode === "list"
                    ? theme.card
                    : "transparent",
              }}
              title="List view"
            >
              ☰
            </button>

            <button
              onClick={() => setViewMode("grid")}
              style={{
                ...viewToggle(theme),
                background:
                  viewMode === "grid"
                    ? theme.card
                    : "transparent",
              }}
              title="Grid view"
            >
              ▦
            </button>
          </div>
        </header>

        {/* CONTENT */}

        <main
          style={{
            padding: "30px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* WELCOME */}

          {activePage === "mydrive" && (
            <div style={{ marginBottom: "25px" }}>
              <h1
                style={{
                  margin: "0 0 5px",
                  fontSize: "28px",
                }}
              >
                Welcome back, {username} 👋
              </h1>

              <p
                style={{
                  color: theme.muted,
                  margin: 0,
                }}
              >
                Manage your files securely from one place.
              </p>
            </div>
          )}

          {/* MESSAGE */}

          {message && (
            <MessageBox
              message={message}
              darkMode={darkMode}
            />
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          {activePage === "mydrive" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(190px,1fr))",
                gap: "16px",
                marginBottom: "25px",
              }}
            >
              <StatCard
                icon="📁"
                title="Total Files"
                value={files.length}
                theme={theme}
              />

              <StatCard
                icon="💾"
                title="Storage Used"
                value={formatSize(storageUsed)}
                theme={theme}
              />

              <StatCard
                icon="⭐"
                title="Starred"
                value={starredFiles.length}
                theme={theme}
              />

              <StatCard
                icon="🗑️"
                title="Trash"
                value={trashFiles.length}
                theme={theme}
              />
            </div>
          )}

          {/* =================================================
              UPLOAD BOX
          ================================================= */}

          {(activePage === "mydrive" ||
            activePage === "starred") && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: isDragging
                  ? "2px dashed #2563eb"
                  : `2px dashed ${theme.border}`,
                borderRadius: "16px",
                padding: "25px",
                marginBottom: "25px",
                background: isDragging
                  ? darkMode
                    ? "#172554"
                    : "#eff6ff"
                  : theme.card,
                textAlign: "center",
                transition: ".2s",
              }}
            >
              <div
                style={{
                  fontSize: "35px",
                  marginBottom: "8px",
                }}
              >
                {isDragging ? "📥" : "☁️"}
              </div>

              <h3
                style={{
                  margin: "0 0 5px",
                }}
              >
                {isDragging
                  ? "Drop files here"
                  : "Upload files"}
              </h3>

              <p
                style={{
                  margin: "0 0 15px",
                  color: theme.muted,
                  fontSize: "13px",
                }}
              >
                Drag and drop your files here or choose a
                file from your computer
              </p>

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files?.[0] || null
                  )
                }
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  style={secondaryButtonTheme(theme)}
                >
                  📂 Choose File
                </button>

                {selectedFile && (
                  <>
                    <span
                      style={{
                        color: theme.muted,
                        fontSize: "13px",
                      }}
                    >
                      {selectedFile.name}
                    </span>

                    <button
                      onClick={uploadFile}
                      style={primaryButton}
                    >
                      ⬆️ Upload
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* =================================================
              MY FILES / STARRED
          ================================================= */}

          {(activePage === "mydrive" ||
            activePage === "starred") && (
            <section
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: "18px",
                padding: "22px",
                boxShadow: darkMode
                  ? "none"
                  : "0 5px 25px rgba(15,23,42,.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px",
                    }}
                  >
                    {activePage === "starred"
                      ? "⭐ Starred Files"
                      : "📁 My Drive"}
                  </h2>

                  <p
                    style={{
                      margin: "4px 0 0",
                      color: theme.muted,
                      fontSize: "13px",
                    }}
                  >
                    {filteredFiles.length} file
                    {filteredFiles.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <EmptyState
                  type={
                    activePage === "starred"
                      ? "starred"
                      : "files"
                  }
                  theme={theme}
                />
              ) : viewMode === "grid" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill,minmax(220px,1fr))",
                    gap: "16px",
                  }}
                >
                  {filteredFiles.map((file) => (
                    <FileGridCard
                      key={file.id}
                      file={file}
                      theme={theme}
                      onStar={toggleStar}
                      onDownload={downloadFile}
                      onDelete={deleteFile}
                      onShare={(file) => {
                        setShareFile(file);
                        setShareEmail("");
                        setShowShare(true);
                      }}
                      getFileIcon={getFileIcon}
                      formatSize={formatSize}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {filteredFiles.map((file) => (
                    <FileListCard
                      key={file.id}
                      file={file}
                      theme={theme}
                      onStar={toggleStar}
                      onDownload={downloadFile}
                      onDelete={deleteFile}
                      onShare={(file) => {
                        setShareFile(file);
                        setShareEmail("");
                        setShowShare(true);
                      }}
                      getFileIcon={getFileIcon}
                      formatSize={formatSize}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* =================================================
              SHARED
          ================================================= */}

          {activePage === "shared" && (
            <section
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: "18px",
                padding: "22px",
              }}
            >
              {sharedFiles.length === 0 ? (
                <EmptyState
                  type="shared"
                  theme={theme}
                />
              ) : (
                sharedFiles.map((share) => (
                  <div
                    key={share.id}
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: "14px",
                      padding: "18px",
                      marginBottom: "12px",
                      background: theme.card2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: darkMode
                            ? "#0f172a"
                            : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "25px",
                        }}
                      >
                        {getFileIcon(
                          share.fileName,
                          share.fileType
                        )}
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: "750",
                            wordBreak: "break-word",
                          }}
                        >
                          {share.fileName}
                        </div>

                        <div
                          style={{
                            color: theme.muted,
                            fontSize: "12px",
                            marginTop: "5px",
                          }}
                        >
                          Shared by{" "}
                          <b>
                            {share.ownerUsername}
                          </b>
                          {share.fileSize
                            ? ` • ${formatSize(
                                share.fileSize
                              )}`
                            : ""}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        downloadFile(
                          share.fileId,
                          share.fileName
                        )
                      }
                      style={primaryButton}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                ))
              )}
            </section>
          )}

          {/* =================================================
              TRASH
          ================================================= */}

          {activePage === "trash" && (
            <section
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: "18px",
                padding: "22px",
              }}
            >
              {trashFiles.length === 0 ? (
                <EmptyState
                  type="trash"
                  theme={theme}
                />
              ) : (
                trashFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: "14px",
                      padding: "18px",
                      marginBottom: "12px",
                      background: theme.card2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "30px",
                        }}
                      >
                        {getFileIcon(
                          file.fileName,
                          file.fileType
                        )}
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: "750",
                            wordBreak: "break-word",
                          }}
                        >
                          {file.fileName}
                        </div>

                        <div
                          style={{
                            color: theme.muted,
                            fontSize: "12px",
                            marginTop: "5px",
                          }}
                        >
                          {formatSize(file.fileSize)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          restoreFile(file.id)
                        }
                        style={successButton}
                      >
                        ♻️ Restore
                      </button>

                      <button
                        onClick={() =>
                          permanentDelete(file.id)
                        }
                        style={dangerButton}
                      >
                        ❌ Delete Forever
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </main>

        {/* FOOTER */}

        <footer
          style={{
            textAlign: "center",
            padding: "25px",
            color: theme.muted,
            fontSize: "12px",
          }}
        >
          ☁️ CloudDrive • Secure File Management
        </footer>
      </div>

      {/* =====================================================
          SHARE MODAL
      ===================================================== */}

      {showShare && (
        <Modal
          theme={theme}
          title="🔗 Share File"
          onClose={() => {
            setShowShare(false);
            setShareFile(null);
            setShareEmail("");
          }}
        >
          <p
            style={{
              color: theme.muted,
            }}
          >
            Share{" "}
            <b style={{ color: theme.text }}>
              {shareFile?.fileName}
            </b>{" "}
            with another user.
          </p>

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            Email address
          </label>

          <input
            type="email"
            value={shareEmail}
            onChange={(e) =>
              setShareEmail(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                shareFileWithEmail();
              }
            }}
            placeholder="example@gmail.com"
            style={inputStyleTheme(theme)}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={shareFileWithEmail}
              style={{
                ...primaryButton,
                flex: 1,
              }}
            >
              🔗 Share
            </button>

            <button
              onClick={() => {
                setShowShare(false);
                setShareFile(null);
                setShareEmail("");
              }}
              style={{
                ...secondaryButtonTheme(theme),
                flex: 1,
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          SETTINGS MODAL
      ===================================================== */}

      {showSettings && (
        <Modal
          theme={theme}
          title="⚙️ Settings"
          onClose={() => {
            setShowSettings(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
        >
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: theme.card2,
              border: `1px solid ${theme.border}`,
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontWeight: "700",
              }}
            >
              👤 {username}
            </div>

            {userEmail && (
              <div
                style={{
                  color: theme.muted,
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {userEmail}
              </div>
            )}
          </div>

          <h3
            style={{
              marginBottom: "5px",
            }}
          >
            🔐 Change Password
          </h3>

          <p
            style={{
              color: theme.muted,
              fontSize: "13px",
            }}
          >
            Enter your current password and choose a new
            password.
          </p>

          <label style={labelStyle}>
            Current Password
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            placeholder="Current password"
            style={inputStyleTheme(theme)}
          />

          <label style={labelStyle}>
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            placeholder="New password"
            style={inputStyleTheme(theme)}
          />

          <label style={labelStyle}>
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                changePassword();
              }
            }}
            placeholder="Confirm new password"
            style={inputStyleTheme(theme)}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={changePassword}
              style={{
                ...successButton,
                flex: 1,
              }}
            >
              🔐 Change Password
            </button>

            <button
              onClick={() => {
                setShowSettings(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              style={{
                ...secondaryButtonTheme(theme),
                flex: 1,
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// =============================================================
// SIDEBAR BUTTON
// =============================================================

function SidebarButton({
  icon,
  label,
  count,
  active,
  onClick,
  theme,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...sidebarButtonStyle(theme),
        background: active
          ? theme.hover
          : "transparent",
        color: active
          ? theme.text
          : theme.muted,
        fontWeight: active ? "800" : "600",
      }}
    >
      <span
        style={{
          width: "25px",
          textAlign: "center",
        }}
      >
        {icon}
      </span>

      <span
        style={{
          flex: 1,
          textAlign: "left",
        }}
      >
        {label}
      </span>

      {count !== undefined && (
        <span
          style={{
            fontSize: "11px",
            color: theme.muted,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// =============================================================
// FILE LIST CARD
// =============================================================

function FileListCard({
  file,
  theme,
  onStar,
  onDownload,
  onDelete,
  onShare,
  getFileIcon,
  formatSize,
}) {
  const starred =
    file.starred === true ||
    file.starred === 1 ||
    file.starred === "1" ||
    file.starred === "true";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "15px",
        border: `1px solid ${theme.border}`,
        borderRadius: "13px",
        marginBottom: "10px",
        background: theme.card2,
        transition: ".2s",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: theme.card,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "25px",
          flexShrink: 0,
        }}
      >
        {getFileIcon(file.fileName, file.fileType)}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontWeight: "750",
            wordBreak: "break-word",
          }}
        >
          {file.fileName}
        </div>

        <div
          style={{
            color: theme.muted,
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          {formatSize(file.fileSize)}
          {" • "}
          {file.fileType || "File"}
        </div>
      </div>

      {/* =====================================================
          ⭐ STAR BUTTON
          ===================================================== */}

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onStar(file.id, starred);
        }}
        title={
          starred
            ? "Unstar file"
            : "Star file"
        }
        aria-label={
          starred
            ? "Unstar file"
            : "Star file"
        }
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: `1px solid ${theme.border}`,
          background: starred
            ? "#f59e0b"
            : theme.card,
          color: starred
            ? "#ffffff"
            : theme.muted,
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "all 0.2s ease",
          boxShadow: starred
            ? "0 4px 12px rgba(245,158,11,.25)"
            : "none",
        }}
      >
        {starred ? "⭐" : "☆"}
      </button>

      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <SmallAction
          text="⬇️"
          title="Download"
          onClick={() =>
            onDownload(
              file.id,
              file.fileName
            )
          }
          theme={theme}
        />

        <SmallAction
          text="🔗"
          title="Share"
          onClick={() => onShare(file)}
          theme={theme}
        />

        <SmallAction
          text="🗑️"
          title="Move to Trash"
          onClick={() => onDelete(file.id)}
          theme={theme}
        />
      </div>
    </div>
  );
}

// =============================================================
// FILE GRID CARD
// =============================================================

function FileGridCard({
  file,
  theme,
  onStar,
  onDownload,
  onDelete,
  onShare,
  getFileIcon,
  formatSize,
}) {
  const starred =
    file.starred === true ||
    file.starred === 1 ||
    file.starred === "1" ||
    file.starred === "true";

  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: "15px",
        padding: "17px",
        background: theme.card2,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "14px",
            background: theme.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
          }}
        >
          {getFileIcon(
            file.fileName,
            file.fileType
          )}
        </div>

        {/* =================================================
            ⭐ STAR BUTTON
        ================================================= */}

        <button
          onClick={() =>
            onStar(file.id, starred)
          }
          title={
            starred
              ? "Unstar file"
              : "Star file"
          }
          aria-label={
            starred
              ? "Unstar file"
              : "Star file"
          }
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: `1px solid ${
              starred
                ? "#f59e0b"
                : theme.border
            }`,
            background: starred
              ? "#f59e0b"
              : theme.card,
            color: starred
              ? "#ffffff"
              : theme.muted,
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "all 0.2s ease",
            boxShadow: starred
              ? "0 4px 12px rgba(245,158,11,.25)"
              : "none",
          }}
        >
          {starred ? "⭐" : "☆"}
        </button>
      </div>

      <div
        style={{
          fontWeight: "750",
          marginTop: "15px",
          wordBreak: "break-word",
          minHeight: "40px",
        }}
      >
        {file.fileName}
      </div>

      <div
        style={{
          color: theme.muted,
          fontSize: "12px",
          marginTop: "7px",
        }}
      >
        {formatSize(file.fileSize)}
      </div>

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginTop: "15px",
        }}
      >
        <SmallAction
          text="⬇️"
          title="Download"
          onClick={() =>
            onDownload(
              file.id,
              file.fileName
            )
          }
          theme={theme}
        />

        <SmallAction
          text="🔗"
          title="Share"
          onClick={() => onShare(file)}
          theme={theme}
        />

        <SmallAction
          text="🗑️"
          title="Move to Trash"
          onClick={() => onDelete(file.id)}
          theme={theme}
        />
      </div>
    </div>
  );
}

// =============================================================
// SMALL ACTION
// =============================================================

function SmallAction({
  text,
  title,
  onClick,
  theme,
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        flex: 1,
        minWidth: "40px",
        padding: "8px",
        borderRadius: "8px",
        border: `1px solid ${theme.border}`,
        background: theme.card,
        color: theme.text,
        cursor: "pointer",
        fontSize: "15px",
      }}
    >
      {text}
    </button>
  );
}

// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState({ type, theme }) {
  const data = {
    files: {
      icon: "📂",
      title: "No files found",
      text: "Upload your first file to get started.",
    },
    starred: {
      icon: "⭐",
      title: "No starred files",
      text: "Star important files and they will appear here.",
    },
    shared: {
      icon: "🔗",
      title: "Nothing shared with you",
      text: "Files shared with you will appear here.",
    },
    trash: {
      icon: "🗑️",
      title: "Trash is empty",
      text: "Deleted files will appear here.",
    },
  };

  const item = data[type] || data.files;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "70px 20px",
        color: theme.muted,
      }}
    >
      <div
        style={{
          fontSize: "55px",
          marginBottom: "15px",
        }}
      >
        {item.icon}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          color: theme.text,
        }}
      >
        {item.title}
      </h3>

      <p style={{ margin: 0 }}>
        {item.text}
      </p>
    </div>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  icon,
  title,
  value,
  theme,
}) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: "15px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "12px",
          background: theme.card2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: theme.muted,
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "23px",
            fontWeight: "850",
            marginTop: "3px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// MODAL
// =============================================================

function Modal({
  children,
  title,
  theme,
  onClose,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,.72)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: theme.card,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: "20px",
          padding: "28px",
          boxSizing: "border-box",
          boxShadow:
            "0 30px 80px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "9px",
              border: `1px solid ${theme.border}`,
              background: theme.card2,
              color: theme.text,
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// =============================================================
// MESSAGE
// =============================================================

function MessageBox({
  message,
  darkMode = false,
}) {
  const lower = String(message).toLowerCase();

  const error =
    lower.includes("failed") ||
    lower.includes("cannot") ||
    lower.includes("invalid") ||
    lower.includes("error") ||
    lower.includes("incorrect") ||
    lower.includes("match") ||
    lower.includes("different") ||
    lower.includes("unable");

  return (
    <div
      style={{
        padding: "13px 16px",
        marginBottom: "20px",
        borderRadius: "11px",
        background: error
          ? darkMode
            ? "#451a1a"
            : "#fee2e2"
          : darkMode
          ? "#12351f"
          : "#dcfce7",
        color: error
          ? darkMode
            ? "#fca5a5"
            : "#991b1b"
          : darkMode
          ? "#86efac"
          : "#166534",
        border: `1px solid ${
          error
            ? darkMode
              ? "#7f1d1d"
              : "#fecaca"
            : darkMode
            ? "#14532d"
            : "#bbf7d0"
        }`,
        fontWeight: "700",
        fontSize: "14px",
      }}
    >
      {error ? "⚠️ " : "✅ "}
      {message}
    </div>
  );
}

// =============================================================
// STYLES
// =============================================================

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  boxSizing: "border-box",
  fontSize: "15px",
  color: "#0f172a",
  background: "#fff",
  outline: "none",
};

const primaryButton = {
  padding: "10px 17px",
  border: "none",
  borderRadius: "9px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "750",
  cursor: "pointer",
};

const successButton = {
  padding: "10px 17px",
  border: "none",
  borderRadius: "9px",
  background: "#16a34a",
  color: "#fff",
  fontWeight: "750",
  cursor: "pointer",
};

const dangerButton = {
  padding: "10px 17px",
  border: "none",
  borderRadius: "9px",
  background: "#dc2626",
  color: "#fff",
  fontWeight: "750",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "11px 17px",
  border: "2px solid #2563eb",
  borderRadius: "9px",
  background: "#fff",
  color: "#2563eb",
  fontWeight: "750",
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  fontWeight: "700",
  marginTop: "15px",
  marginBottom: "6px",
};

function inputStyleTheme(theme) {
  return {
    width: "100%",
    padding: "13px",
    border: `1px solid ${theme.border}`,
    borderRadius: "10px",
    boxSizing: "border-box",
    fontSize: "14px",
    color: theme.text,
    background: theme.input,
    outline: "none",
  };
}

function secondaryButtonTheme(theme) {
  return {
    padding: "10px 17px",
    border: `1px solid ${theme.border}`,
    borderRadius: "9px",
    background: theme.card2,
    color: theme.text,
    fontWeight: "750",
    cursor: "pointer",
  };
}

function sidebarButtonStyle(theme) {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 12px",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: theme.muted,
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "3px",
  };
}

function searchStyle(theme) {
  return {
    width: "100%",
    padding: "11px 15px",
    border: `1px solid ${theme.border}`,
    borderRadius: "10px",
    background: theme.card2,
    color: theme.text,
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };
}

function iconButton(theme) {
  return {
    width: "40px",
    height: "40px",
    borderRadius: "9px",
    border: `1px solid ${theme.border}`,
    background: theme.card2,
    color: theme.text,
    cursor: "pointer",
    fontSize: "16px",
  };
}

function viewToggle(theme) {
  return {
    width: "34px",
    height: "30px",
    border: "none",
    borderRadius: "7px",
    color: theme.text,
    cursor: "pointer",
    fontSize: "16px",
  };
}

export default App;