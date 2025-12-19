# FixItNow - Hostel Service Portal 🏨

**FixItNow** is a modern, responsive web application designed to streamline hostel maintenance requests and complaints. It bridges the gap between hostel residents and administration by providing a unified platform for reporting issues, tracking their status, and ensuring transparency.

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## 🌟 Key Features

### 🔐 Authentication & Security
- **Secure Login/Signup**: Users can sign up using email/password or their Google account.
- **Profile Management**: Automatically captures and stores user details (Hostel, Room No) for streamlined request processing.
- **Session Management**: Persistent login sessions with secure logout functionality.

### 🛠 Maintenance Services
Residents can easily request various maintenance services including:
- **Room Cleaning**: Request daily cleaning.
- **Electrical**: Report faulty lights, fans, or sockets.
- **Plumbing**: Report leaks or bathroom issues.
- **WiFi**: Connectivities issues.
- **Mess**: Food quality or hygiene complaints.
- **Laundry**: Washing/Ironing service requests.
- **Others**: General assistance.

### 🚨 Rector Complaints
A dedicated section for serious issues that require immediate attention:
- **Harassment**: Reporting sensitive issues safely.
- **Safety Issues**: Reporting security concerns.
- **Serious Complaints**: Direct line to the Rector.

### 📊 Real-time Tracking & Data
- **Live Status Updates**: Users can track the status of their own requests in real-time (Pending, In Progress, Resolved).
- **Public History**: A transparency section ("Stored Data") showing recent requests and complaints from the community to foster accountability.

### 🎨 Modern UI/UX
- **Glassmorphism Design**: sleek, semi-transparent aesthetic using modern CSS techniques.
- **Responsive Layout**: Fully functional on desktop and mobile devices.
- **Sticky Navigation**: Easy access to all sections.

---

## 💻 Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | HTML5 | Semantic structure |
| | CSS3 | Custom styling with Glassmorphism & Animations |
| | JavaScript (ES6+) | Core application logic & DOM manipulation |
| **Backend** | Firebase Auth | User authentication & management |
| | Cloud Firestore | NoSQL database for storing requests & user profiles |
| **Icons** | FontAwesome | Visual indicators for services & actions |
| **Fonts** | Google Fonts | 'Poppins' for a clean, modern typography |

---

## 📂 Project Structure

```bash
📦 FixItNow-main
 ┣ 📂 .git              # Version control
 ┣ 📂 images            # Static assets (backgrounds, logos)
 ┣ 📜 firebase.js       # Firebase configuration & API wrapper functions
 ┣ 📜 home.html         # Main Dashboard (Services, Forms, Tracking)
 ┣ 📜 index.html        # Authentication Landing Page (Login/Signup)
 ┣ 📜 index.js          # Main controller logic (Auth handling, UI updates)
 ┣ 📜 style.css         # Global styles & responsive design
 ┗ 📜 README.md         # Project documentation
```

### Key File Descriptions
- **`firebase.js`**: Centralizes all Firebase logic. It handles connection, authentication methods, and database CRUD operations.
- **`index.js`**: The brain of the frontend. It handles event listeners, form submissions, and dynamic HTML generation based on data.
- **`style.css`**: Contains all visual styles, including the `glass` class for the signature glassmorphism effect.

---

## 🚀 Setup & Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge).
- A code editor (VS Code recommended).
- **Firebase Project**: You need a Firebase project with **Authentication** and **Firestore** enabled.

### Steps
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd FixItNow
   ```

2. **Configure Firebase**
   - Open `firebase.js`.
   - Locate the `firebaseConfig` object (~line 30).
   - Replace the values with your own Firebase project credentials.
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       // ... other config
   };
   ```

3. **Run Locally**
   - Since this project uses ES Modules (`type="module"`), you must serve it via a local HTTP server (not by opening the file directly).
   - Using **Live Server** (VS Code Extension): Right-click `index.html` -> "Open with Live Server".
   - Or using Python:
     ```bash
     python -m http.server
     ```

4. **Access the App**
   - Navigate to `http://127.0.0.1:5500` (or the port shown by your server).

---

## 🛡 Security & Best Practices
- **Environment Variables**: For production, ensure Firebase keys are secured or restricted by domain.
- **Access Control**: Currently, the "Stored Data" section is public. Ensure sensitive data is not logged in public descriptions.
- **Input Validation**: Basic client-side validation is implemented.

---

## 🤝 Contributing
1. Fork the repository.
2. Create feature branch (`git checkout -b feature/NewFeature`).
3. Commit changes (`git commit -m 'Add NewFeature'`).
4. Push to branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

© 2024 FixItNow Team. All Rights Reserved.
https://fix-it-now-one.vercel.app/
