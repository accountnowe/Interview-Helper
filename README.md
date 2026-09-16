

# 🧠 AI-Powered Interview Helper

A smart web-based platform that automates technical interviews using Generative AI, intelligent resume parsing, timed question flows, and structured candidate evaluation — designed to mirror real-world technical screening.

---

## 🌟 Project Overview

This project is an **end-to-end interview automation system** built to reduce manual screening effort.
It conducts structured technical interviews by generating questions, evaluating responses, and presenting insights through a clean interviewer dashboard.

The core focus is **reliability, usability, and real interview logic**, not just AI output.

---

## 🎯 Key Capabilities

### 👤 Candidate Side

* Resume upload with automatic parsing (PDF / DOCX)
* Guided interview flow with clear instructions
* AI-driven technical questions with increasing difficulty
* Question timers with automatic submission
* Instant answer evaluation and feedback
* Interview progress saved automatically (refresh-safe)

---

### 🧑‍💼 Interviewer Side

* Centralized view of all candidates
* Access to complete interview transcripts
* Per-question and overall scoring
* Visual performance indicators
* AI-generated candidate summary

---

## 🧩 How the System Works

### 1️⃣ Resume Processing

* Detects file format
* Extracts text content
* Identifies basic candidate details
* Converts raw data into structured form

### 2️⃣ Question Generation

* Questions are generated dynamically
* Difficulty levels are enforced
* Duplicate questions are avoided
* Output is short, clear, and interview-appropriate

### 3️⃣ Answer Evaluation

* Technical relevance analysis
* Keyword and concept detection
* Clarity and completeness scoring
* Short, meaningful feedback

### 4️⃣ Fail-Safe Design

If AI services are unavailable:

* Rule-based evaluation is triggered
* Predefined questions are used
* Interview flow continues without interruption

---

## 🏗️ Architecture Philosophy

This project follows a **fallback-first design**, ensuring the app never breaks:

* **Primary Layer**: Generative AI logic
* **Secondary Layer**: Algorithmic evaluation
* **Final Layer**: Curated interview content

This makes the platform usable even under API limits or network issues.

---

## 🧠 State & Data Handling

* Redux Toolkit for predictable state updates
* Centralized interview state
* Persistent storage for session recovery
* Clean separation between UI and logic

---

## 🛠️ Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui components

### State & Utilities

* Redux Toolkit
* Redux Persist
* Custom validation helpers

### AI & File Handling

* Generative AI service integration
* PDF & DOCX parsing libraries

---

## 🚀 Running the Project Locally

```bash
# Clone the repository
git clone https://github.com/accountnowe/Interview-Assistant.git
cd Interview-Assistant

# Install dependencies
npm install

# Create environment file
# .env
VITE_GEMINI_API_KEY=your_api_key_here

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📂 Folder Structure

```
src/
├── components/
│   ├── interviewee/     # Candidate UI
│   ├── interviewer/     # Dashboard UI
│   └── ui/              # Reusable components
├── pages/               # Application pages
├── services/            # AI & resume logic
├── store/               # Redux configuration
├── utils/               # Helpers & validators
└── main.tsx
```

---

## 🧪 What Was Tested

* Resume uploads (PDF & DOCX)
* AI question generation
* Timed interview flow
* Answer evaluation logic
* Offline / fallback behavior
* Page refresh recovery
* Responsive design
* Complete interview lifecycle

---

## ☁️ Deployment

```bash
npm run build
```

Set the environment variable:

```
VITE_GEMINI_API_KEY
```

Deployable on:

* Netlify
* Vercel
* Static hosting services

---

## 🔮 Planned Improvements

* Voice-based interviews
* Multi-language support
* Candidate comparison view
* Exportable reports
* Custom interview templates
* Video interview analysis

---

## 🧠 Engineering Highlights

* Designed for failure tolerance
* Clean separation of concerns
* Typed state management
* Scalable component structure
* Production-oriented error handling

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Shivansh Ajmera**

*Built as a demonstration of full-stack development, GenAI integration, and real-world interview system design.*


.