# 🚀 AI Interview & Resume Preparation Platform

A full-stack MERN application designed to supercharge your interview preparation. This platform analyzes your resume, job description, and self-description using Google Gemini AI to generate a comprehensive interview report. It provides technical and behavioral questions, identifies skill gaps, and creates a tailored day-by-day preparation plan. It also features an AI-powered resume enhancement tool that generates an optimized PDF resume based on AI feedback.

---

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication with HTTP-only cookies, password hashing (bcrypt), and protected routes.
- **📄 Resume Analysis**: Upload your PDF resume. The system parses it using `pdf-parse` and processes the content.
- **🧠 AI-Powered Interview Report**: Uses Google Gemini (`@google/genai`) to generate a detailed report:
  - **Match Score**: Percentage match between your profile and the job description.
  - **Technical & Behavioral Questions**: Tailored questions, expected intentions, and ideal answers.
  - **Skill Gaps Analysis**: Identifies missing skills with severity levels (low, medium, high).
  - **Custom Preparation Plan**: A day-by-day study and preparation schedule.
- **📝 Automated Resume Builder**: Dynamically generates an improved, ATS-friendly PDF resume using Puppeteer based on AI recommendations.
- **📚 History Tracking**: View all your past generated interview reports in one place.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 (via Vite)
- **Routing**: React Router v7
- **Styling**: SCSS (Sass)
- **HTTP Client**: Axios

### Backend

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcryptjs, cookie-parser
- **File Upload & Parsing**: Multer, pdf-parse
- **PDF Generation**: Puppeteer
- **Validation**: Zod, zod-to-json-schema

### Third-Party Services / APIs

- **AI Engine**: Google Gemini API (`@google/genai`)

---

## 🏗️ Project Structure

```text
📦 project-root
 ┣ 📂 backend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 config        # Database connection
 ┃ ┃ ┣ 📂 controllers   # Route business logic (Auth, Interview)
 ┃ ┃ ┣ 📂 middlewares   # Auth & File (Multer) middlewares
 ┃ ┃ ┣ 📂 models        # Mongoose schemas (User, InterviewReport, Blacklist)
 ┃ ┃ ┣ 📂 routes        # Express routes (auth.routes.js, interview.routes.js)
 ┃ ┃ ┗ 📂 services      # External API integrations (AI Service)
 ┃ ┣ 📜 app.js          # Express app configuration
 ┃ ┗ 📜 server.js       # Server entry point
 ┣ 📂 frontend
 ┃ ┣ 📂 public          # Static assets
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 features      # Feature-based modular structure
 ┃ ┃ ┃ ┣ 📂 auth        # Authentication UI, Context, API, Hooks
 ┃ ┃ ┃ ┗ 📂 interview   # Interview UI, Context, API, Hooks
 ┃ ┃ ┣ 📜 App.jsx       # Root React component
 ┃ ┃ ┣ 📜 app.routes.jsx# Route definitions
 ┃ ┃ ┣ 📜 main.jsx      # React DOM rendering
 ┃ ┃ ┗ 📜 style.scss    # Global styles
 ┃ ┗ 📜 vite.config.js  # Vite configuration
 ┗ 📜 README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add your configuration (see `.env Example` below).

Start the backend server:

```bash
node server.js
# or use nodemon if installed globally
```

_The backend runs on `http://localhost:3000` by default._

### 3. Setup the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

_The frontend runs on `http://localhost:5173` by default._

---

## 🔐 .env Example

Create a `.env` file in your `/backend` directory. **Never commit your actual `.env` file to version control.**

```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description                          | Access  |
| :----- | :---------- | :----------------------------------- | :------ |
| `POST` | `/register` | Register a new user                  | Public  |
| `POST` | `/login`    | Login user & set HTTP-only cookie    | Public  |
| `GET`  | `/logout`   | Logout user & blacklist token        | Public  |
| `GET`  | `/get-me`   | Get currently logged-in user profile | Private |

### Interview Reports (`/api/interview`)

| Method | Endpoint                         | Description                                             | Access  |
| :----- | :------------------------------- | :------------------------------------------------------ | :------ |
| `POST` | `/`                              | Generate new report (requires `resume` PDF file upload) | Private |
| `GET`  | `/`                              | Get all interview reports for the logged-in user        | Private |
| `GET`  | `/report/:interviewId`           | Get a specific interview report by ID                   | Private |
| `POST` | `/resume/pdf/:interviewReportId` | Generate and download enhanced Resume PDF               | Private |

---

## 🛡️ Authentication Architecture & Flow

1. **Login/Registration**: The user submits their credentials. The backend verifies/hashes passwords using `bcryptjs`.
2. **JWT Generation**: Upon successful authentication, a JWT is generated and sent to the client via an **HTTP-only cookie**. This prevents XSS attacks from stealing the token.
3. **Protected Requests**: The frontend `Axios` instance is configured with `withCredentials: true`, which automatically sends the HTTP-only cookie with every request to the backend.
4. **Middleware Verification**: The `authMiddleware` reads the cookie, verifies the JWT, checks if the token is blacklisted, and attaches the user object to the request.
5. **Logout**: The `/logout` endpoint clears the cookie from the client and adds the JWT to a `Blacklist` collection in MongoDB to invalidate it completely.

---

## 🚀 Future Improvements

- [ ] Implement OAuth (Google/GitHub) Login.
- [ ] Add Mock Audio/Video Interviews using WebRTC and Speech-to-Text.
- [ ] Implement rate limiting to prevent API abuse (especially for the Gemini API).
- [ ] Add real-time notifications when background PDF generation completes.
- [ ] Support DOCX resume parsing alongside PDF.

---
