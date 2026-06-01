# AI Mock Interviewer

An AI-powered mock interview platform that runs realistic technical and HR interviews, evaluates answers, and produces session-level insights using Groq.

---

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Node.js, Express.js     |
| Database | MongoDB Atlas, Mongoose |
| AI       | Groq SDK                |
| Auth     | JWT, bcryptjs           |

---

## Features

- Role-based interviews for technical and HR practice
- Interview modes: `technical`, `hr`, `mixed`
- Difficulty levels: `easy`, `medium`, `hard`
- AI question generation that uses prior Q&A history
- AI answer evaluation with score, feedback, ideal answer, strengths, and follow-up topic
- Session scoring with `overallScore`, `weakAreas`, and `strongAreas`
- Full session summary with stats and merged Q&A pairs

---

## Project Structure

```text
server/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── questionController.js
│   ├── sessionController.js
│   └── summaryController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Answer.js
│   ├── Question.js
│   ├── Session.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── questionRoutes.js
│   ├── sessionRoutes.js
│   └── summaryRoutes.js
├── services/
│   └── groqService.js
├── utils/
│   └── generateTokens.js
└── server.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account or local MongoDB instance
- Groq API key

### Installation

```bash
git clone https://github.com/x03tanuj/AI-Interview.git
cd AI-Interview/server
npm install
```

### Environment Variables

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

### Run the Server

```bash
npm run dev
```

The backend runs on `http://localhost:5000` by default.

---

## API Reference

All protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Auth

| Method | Endpoint             | Access    | Description              |
| ------ | -------------------- | --------- | ------------------------ |
| POST   | `/api/auth/register` | Public    | Register a new user      |
| POST   | `/api/auth/login`    | Public    | Login and receive a JWT  |
| GET    | `/api/auth/me`       | Protected | Get current user profile |

#### Register

```http
POST /api/auth/register
```

```json
{
  "name": "Your Name",
  "email": "your sample email",
  "password": "your sample password"
}
```

#### Login

```http
POST /api/auth/login
```

```json
{
  "email": "your sample email",
  "password": "our sample password"
}
```

---

### Sessions

| Method | Endpoint                | Access    | Description                              |
| ------ | ----------------------- | --------- | ---------------------------------------- |
| POST   | `/api/sessions`         | Protected | Start a new interview session            |
| GET    | `/api/sessions/history` | Protected | Get the logged-in user's session history |
| GET    | `/api/sessions/:id`     | Protected | Get a single session                     |
| PATCH  | `/api/sessions/:id/end` | Protected | End a session and calculate metrics      |

#### Start Session

```http
POST /api/sessions
```

```json
{
  "mode": "technical",
  "role": "Backend Developer",
  "difficulty": "medium"
}
```

---

### Questions

| Method | Endpoint                  | Access    | Description                              |
| ------ | ------------------------- | --------- | ---------------------------------------- |
| POST   | `/api/questions/generate` | Protected | Generate the next question for a session |
| POST   | `/api/questions/evaluate` | Protected | Submit an answer and evaluate it         |

#### Generate Question

```http
POST /api/questions/generate
```

```json
{
  "sessionId": "session_id_here"
}
```

#### Evaluate Answer

```http
POST /api/questions/evaluate
```

```json
{
  "questionId": "question_id_here",
  "answerText": "Your answer here"
}
```

#### Evaluation Response

```json
{
  "score": 7,
  "feedback": "Good answer, but missed indexing tradeoffs.",
  "strengths": "Explained the API structure clearly.",
  "idealAnswer": "A complete model answer here.",
  "followUpTopic": "Database indexing"
}
```

---

### Summary

| Method | Endpoint                  | Access    | Description                 |
| ------ | ------------------------- | --------- | --------------------------- |
| GET    | `/api/summary/:sessionId` | Protected | Get the full session report |

#### Summary Response includes

- Session details: `mode`, `role`, `difficulty`, `overallScore`, `weakAreas`, `strongAreas`
- Stats: `totalQuestions`, `answeredQuestions`, `completionRate`
- All questions in the session
- All answers with `score`, `feedback`, `idealAnswer`
- Merged Q&A pairs for display

---

## Interview Flow

```text
1. Register / Login and copy the JWT token
2. Start a session with mode, role, and difficulty
3. Generate the next question for that session
4. Submit an answer and receive evaluation
5. Repeat steps 3-4 until the interview ends
6. End the session to calculate metrics
7. Fetch the summary report
```

---

## Response Format

Most endpoints follow this pattern:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "message": "..."
}
```

---

## Notes

- `mode` should be one of `technical`, `hr`, or `mixed`
- `difficulty` should be one of `easy`, `medium`, or `hard`
- Sessions are protected by ownership checks, so users can only access their own records

---

## License

MIT

This is _Part of the Workify ecosystem_
