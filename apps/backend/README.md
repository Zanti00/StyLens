# StyLens Backend

The logic engine for StyLens, powered by **FastAPI**. This service orchestrates AI-driven fashion critiques by combining image analysis with real-time weather and location context.

---

## 🛠️ Technical Stack

- **Framework**: FastAPI (Python 3.12+)
- **AI Engine**: Google Gemini 1.5 Pro (via `google-genai`)
- **Database Wrapper**: Supabase Python Client
- **Rate Limiting**: SlowAPI (Token Bucket algorithm)
- **Validation**: Pydantic v2
- **Image Processing**: Pillow (PIL)

---

## 🏗️ Architecture

The backend follows a layered architecture to ensure separation of concerns:

- `api/`: API endpoints and versioning (FastAPI Routers).
- `services/`: Core business logic (AI orchestration, Weather API calls, Storage management).
- `repositories/`: Data access layer for Supabase interactions.
- `schemas/`: Pydantic models for request/response validation.
- `core/`: Global configurations, security utilities, and error handling.

---

## 🧠 AI Service Logic

The `AIService` is responsible for:
1. **Context Gathering**: Fetching weather data (temp, conditions) via the `WeatherService`.
2. **Prompt Engineering**: Constructing a specialized prompt for Gemini that mandates a "strict fashion critic" persona.
3. **Multi-Modal Analysis**: Sending outfit images and text context to Gemini Pro Vision.
4. **Structured Output**: Parsing the AI response into a typed JSON format for the frontend.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.12+
- `pnpm` (for workspace integration)

### 2. Setup Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure:
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
WEATHER_API_KEY=...
```

### 4. Run Server
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 Testing & Linting

### Running Tests
```bash
pytest
```

### Linting & Formatting
```bash
ruff check .
ruff format .
mypy .
```

---

## 🛡️ Security

- **Service Role Auth**: Uses Supabase Service Role keys for secure, high-privilege DB operations (controlled by the backend).
- **JWT Validation**: Validates user tokens passed from the frontend to ensure authenticated access.
- **Throttling**: Rate limits are enforced on expensive AI analysis endpoints to prevent abuse.
