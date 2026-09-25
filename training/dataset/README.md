# ARIYAAN Personal Voice Dataset

This directory stores your personal voice recordings for future fine-tuning
and personalized command recognition.

## Structure

```
training/
└── dataset/
    ├── greetings/        # "Hello ARIYAAN", "Hi ARIYAAN", etc.
    ├── assistant/        # "What is your name?", "Who are you?", etc.
    ├── time/             # "What is the time?", "What is the date?", etc.
    ├── system/           # "Open Chrome", "Open Calculator", etc.
    ├── general/          # "Tell me a joke", "What is the weather?", etc.
    ├── control/          # "Thank you", "Goodbye ARIYAAN", "Stop", etc.
    └── future_tamil/     # Reserved for Tamil commands (future)
```

## Naming Convention

```
<command_slug>_<attempt_number>.wav

Examples:
  hello_01.wav     ← First recording of "Hello ARIYAAN"
  hello_02.wav     ← Second recording of "Hello ARIYAAN"
  open_chrome_01.wav
  what_time_03.wav
```

## Recording Guidelines

- **Target**: 3–5 recordings per command
- **Quality**: Record in a quiet room with no background noise
- **Format**: 16kHz mono WAV (the recorder utility produces this)
- **Duration**: 1–4 seconds per clip (speak naturally, no rushing)
- **Variety**: Slightly vary your tone, speed, and emphasis between recordings
  to make the dataset more robust

## How to Record

1. Open ARIYAAN in your browser
2. Navigate to: `http://localhost:5173/?recorder`
3. Select a command from the list
4. Click "Record", speak clearly, click "Stop"
5. Play back to verify quality
6. Click "Download WAV"
7. Place the downloaded file in the correct category folder here

## Commands List (30+ English commands)

### Greetings (5 commands)
- "Hello ARIYAAN"
- "Hi ARIYAAN"
- "Good morning ARIYAAN"
- "Good evening ARIYAAN"
- "Hey ARIYAAN"

### Assistant Identity (5 commands)
- "What is your name?"
- "Who are you?"
- "What can you do?"
- "Help me"
- "Introduce yourself"

### Time & Date (4 commands)
- "What is the time?"
- "Tell me the current time"
- "What is today's date?"
- "What day is it today?"

### System / App Control (6 commands)
- "Open Chrome"
- "Launch Google Chrome"
- "Open Calculator"
- "Open Notepad"
- "Open File Explorer"
- "Open settings"

### General Questions (5 commands)
- "Tell me a joke"
- "What is the weather today?"
- "Tell me the latest news"
- "What is the capital of India?"
- "Explain artificial intelligence"

### Conversation Control (7 commands)
- "Can you repeat that?"
- "Stop"
- "Thank you"
- "Thank you ARIYAAN"
- "Goodbye ARIYAAN"
- "Bye ARIYAAN"
- "Exit"

### Future Tamil (reserved)
- "Vanakkam ARIYAAN"

## Future Use

This dataset is intended for:

1. **Fine-tuning Whisper** – once enough samples are collected (50+ hours
   recommended for significant improvement; these 150–250 samples can be
   used for LoRA fine-tuning or few-shot adaptation)
2. **Training a personal command classifier** – a lightweight model trained
   on your voice for faster, offline command recognition
3. **Wake word detection** – "Hey ARIYAAN" detection without cloud services
4. **Tamil dataset** – future Tamil voice recognition

## Note

This dataset does NOT retrain or modify the existing Whisper model or
the Gemini AI backend. It is purely for future experimentation.
