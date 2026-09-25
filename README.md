# ARIYAAN – Personal AI Assistant

> **"Your Intelligent Personal AI Assistant"**

ARIYAAN is a modern, responsive, and full-stack AI Assistant application built with **React**, **Node.js/Express**, and the **Google Gemini API** (`@google/genai`). It is designed for personal productivity, learning support, programming assistance, mathematical problem-solving, and serves as a comprehensive **Final-Year College Project**.

---

## 💡 Name Meaning & Identity

**ARIYAAN** is inspired by the Tamil concept:

$$\text{Arivu} + \text{Udayaan} = \text{Arivudayaan}$$
$$\text{அறிவு} + \text{உடையான்} = \text{அறிவுடையான்}$$

* **Arivu (அறிவு)**: Knowledge, intelligence, understanding, and wisdom.
* **Udayaan (உடையான்)**: One who possesses a trait or capability.
* **Arivudayaan (அறிவுடையான்)**: *"One who possesses knowledge"* (அறிவை உடையவன் / அறிவும் புரிதலும் கொண்டவர்).

> 🎓 **Final-Year Project Rationale**:
> *"The name ARIYAAN was inspired by the Tamil concept 'Arivu + Udayaan = Arivudayaan', meaning one who possesses knowledge. Since the main purpose of the project is to develop an intelligent AI assistant that understands user queries and provides useful knowledge and assistance, the name ARIYAAN represents the core objective of the system."*

**Brand Motto**:
- **English**: *"From Knowledge to Understanding."*
- **Tamil**: *"அறிவிலிருந்து புரிதலுக்கு."*

---

## 🌟 Key Features

* **Real Gemini AI Integration**: Powered by Google's latest Gemini 2.5 Flash / Pro models via the official `@google/genai` SDK.
* **Integrated Voice Assistant**: Real-time voice interaction with Speech-to-Text (STT) and dynamic Text-to-Speech (TTS) using browser-native Web Speech APIs.
* **System & App Launch Intents**: Voice commands to launch desktop applications such as Google Chrome, Windows Calculator, Notepad, and File Explorer.
* **Voice Customization Panel**: Dedicated Voice tab in Settings to toggle voice input/output, pick available voices, and adjust speech rate.
* **Interactive Message-Level Audio**: In-bubble audio playback button allowing users to listen or replay any AI response on demand.
* **Personal Voice Dataset Recorder**: Built-in audio dataset collector (`?recorder`) with 30+ categorized commands for model fine-tuning and future multilingual support.
* **Multi-turn Conversation Memory**: Retains conversation history context for intelligent follow-up questions.
* **Secure API Key Proxy**: Protects secret credentials by handling all Gemini API calls server-side in Node.js/Express.
* **Interactive Welcome Screen**: Displays initial suggestion cards for topics like code writing, problem-solving, math, and project architecture.
* **Markdown & Code Highlighting**: Formats responses with clear headings, bullet lists, math equations, and code blocks with syntax highlighting and a **Copy Code** button.
* **Conversation History Sidebar**: Automatically generates session titles, saves chat threads locally, and enables session deletion.
* **Dynamic Settings Panel**: Allows switching AI models (`gemini-2.5-flash`, `gemini-2.5-pro`), adjusting creativity temperature (0.0 - 1.0), testing API key connections live, and toggling themes.
* **Theme Switching**: Includes sleek **Dark Mode** (glassmorphism with electric violet/cyan glow) and clean **Light Mode**.
* **Comprehensive Error Handling**: Displays friendly alerts for missing API keys, invalid credentials, rate limits, network timeouts, and empty inputs.
* **Fully Responsive Design**: Optimized across mobile phones, tablets, laptops, and desktop screens.

---

## 🛠️ Technology Stack

* **AI Engine**: Google Gemini API (`@google/genai`)
* **Frontend**: React 18, Vite, Vanilla CSS (Design System Tokens, Glassmorphism), Lucide Icons, Marked, Highlight.js
* **Backend**: Node.js, Express REST API, dotenv, CORS
* **Persistence**: LocalStorage (sessions & client settings)

---

## ⚙️ Gemini API Configuration

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open the `.env` file in the project root folder.
3. Replace the placeholder with your actual Gemini API key:

   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=5000
   ```

4. Alternatively, you can enter and test your API key dynamically in the application's **Settings** panel.

> 🔒 **Security Note**: Never commit `.env` files containing real API credentials to public GitHub repositories. `.env` is included in `.gitignore` by default.

---

## 🚀 Installation & Setup Instructions

### 1. Install Dependencies

Run the setup command from the project root directory:

```bash
npm run setup
```

This will automatically install dependencies for both the `backend` and `frontend` subfolders.

---

### 2. Run in Development Mode

You can run the backend API server and frontend development server:

#### Start Backend API Server:
```bash
npm run dev:backend
```
*Backend runs on: [http://localhost:5000](http://localhost:5000)*

#### Start Frontend Development Server:
```bash
npm run dev:frontend
```
*Frontend runs on: [http://localhost:5173](http://localhost:5173)*

---

### 3. Production Build & Execution

To compile the frontend for production and serve everything from the Express backend:

```bash
npm run build:frontend
npm start
```
*Open [http://localhost:5000](http://localhost:5000) in your web browser.*

---

## 🎙️ Voice Assistant & Dataset Collector

ARIYAAN features native voice interaction built on the Web Speech API (SpeechRecognition and SpeechSynthesis), integrated with the existing Gemini AI processing pipeline.

### Voice Features & Intent Engine
* **Push-to-Talk Mic**: Click the microphone icon next to the chat bar to speak. The button indicates states: *Idle*, *Listening*, *Processing*, *Speaking*, and *Error*.
* **System Control Commands**:
  - *"Open Chrome"* / *"Launch Google Chrome"*
  - *"Open Calculator"*
  - *"Open Notepad"*
  - *"Open File Explorer"*
* **Instant Information & Conversational Intents**:
  - *"Hello ARIYAAN"* / *"Good morning"* (Instant warm response)
  - *"What is the time?"* / *"Tell me the current time"* (Real-time clock readout)
  - *"What is today's date?"* / *"What day is it today?"*
  - *"Who are you?"* / *"What can you do?"*
* **Full Generative Fallback**: Any complex query (e.g. *"Explain quantum computing"*, *"Write an essay about renewable energy"*) is seamlessly routed to the Google Gemini LLM, and the response is read aloud using the voice synthesizer.
* **Audio Controls**: Individual AI message bubbles feature a **Speak / Stop** button to replay or silence spoken responses.
* **Settings Modal (Voice Tab)**: Control voice input enable/disable, voice output enable/disable, choose speech synthesizer voice, and adjust speech rate slider.

### Standalone Personal Voice Dataset Recorder
Access the built-in dataset recorder at `http://localhost:5173/?recorder` to capture your own speech samples:
* 30+ categorized commands across **Greetings**, **Assistant Identity**, **Time & Date**, **System Commands**, **General Questions**, **Conversation Control**, and **Future Tamil**.
* Automatically encodes audio into 16kHz mono PCM WAV files.
* Saves progress across sessions in `localStorage`.
* Downloaded samples can be organized into `training/dataset/<category>/`.

---

## 🧪 Recommended Test Cases

### 1. General & AI Test Prompts
1. **Basic Question**: `"What is artificial intelligence?"`
2. **Follow-up Context**: `"Explain it with an example."` *(Verifies multi-turn memory)*
3. **Programming**: `"Write a Python program to check whether a number is prime."` *(Verifies code formatting & copy button)*
4. **Mathematics**: `"Solve 25 × 48 and explain the calculation step by step."`
5. **General Knowledge**: `"What is the capital of Japan?"`
6. **Error Handling**: Launch without an API key or enter an invalid key to test the friendly error alert and Settings modal.

### 2. Voice Assistant Test Cases
1. **Voice Greeting**: Click mic and say `"Hello ARIYAAN"` &rarr; verifies mic listening, greeting detection, and audio response.
2. **Time & Date**: Say `"What is the time?"` or `"What is today's date?"` &rarr; verifies instant local intent response.
3. **Desktop App Launch**: Say `"Open Calculator"` or `"Open Chrome"` &rarr; opens the desktop app via backend command runner.
4. **AI Voice Query**: Say `"Explain quantum computing in simple terms"` &rarr; verifies speech-to-text input passing to Gemini model and voice readout.
5. **Voice Settings**: Toggle *Voice Output* to OFF in Settings &rarr; verifies silent text response; toggle back ON to restore speech.

---

## 📜 License

This project is open-source under the MIT License. Developed for educational and final-year project demonstration.
