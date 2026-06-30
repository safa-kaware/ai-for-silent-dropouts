# EduTrack AI - Student Success Platform

An AI-powered web platform dedicated to identifying academic risks early and providing structured, personalized recovery paths for every student.

---

## 🌟 Key Features

### 👨‍🏫 Faculty & Mentor Dashboard
- **Risk Predictive Analysis**: Automatically analyzes student scores, assignment completions, and class attendance to label students as **Low Risk**, **Medium Risk**, or **High Risk**.
- **Interactive Analytics**: Interactive data visualizations powered by `recharts` to examine overall batch performance, weakest subject distribution, and risk correlations.
- **Explainable AI**: Transparent, factor-based breakdowns of risk assessments so mentors understand exactly *why* a student was flagged (e.g., whether attendance, assignment gaps, or exam marks drove the prediction).
- **Intervention & Action Panel**:
  - **Gemini AI Email Drafts**: Seamlessly generates personalized, encouraging, and supportive outreach emails.
  - **SMS Interventions**: Integration options for Twilio to send immediate notification alerts to parents or students.
- **Recovery Plan Builder**: Automatically generates structured, 4-week personalized study roadmaps tailored to each student's weakest subject and performance level using the Google Gemini AI.
- **Study Material Distribution**: Digital hub for mentors to post targeted study guides, practice tests, and reference links directly to the student portal.
- **Follow-Up Logs & Audit Trail**: Documents and logs every check-in, parental phone call, and tutoring session to track progress over time.

### 🎓 Student Portal
- **Personalized Dashboard**: High-contrast, easy-to-read progress dashboards with clear average mark gauges, attendance trackers, and assignment status indicators.
- **AI-curated Growth Roadmap**: Displays the custom 4-week recovery plan created by their mentors.
- **Explainable Feedback**: Simple, humanized insight cards detailing areas of strength and subjects requiring focused attention.
- **Study Resource Hub**: Immediate access to study materials, practice resources, and guides curated by faculty members specifically for their weakest subject areas.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4.0, Vite 6.0
- **Animations**: `motion` (Framer Motion)
- **Charts & Visualizations**: `recharts`
- **AI Integrations**: `@google/genai` (Google Gemini SDK)
- **Communications**: Twilio SDK for automated SMS messaging
- **Backend & Dev Tooling**: Node.js, Express, `tsx`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
3. Installation
Install the project dependencies:
code
Bash
npm install
4. Running the Development Server
Launch both the Vite frontend and Express server:
code
Bash
npm run dev
Open your browser and navigate to http://localhost:3000.
5. Build for Production
To bundle the frontend assets and compile the Express server for production:
code
Bash
npm run build
Start the compiled bundle:
code
Bash
npm run start

```env
# Gemini API Key for smart draft generation and 4-week roadmap curation
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Public URL where the application or service is hosted
APP_URL="YOUR_APP_URL"
