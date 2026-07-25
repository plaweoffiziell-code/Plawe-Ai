# Plawe AI

Plawe AI is a clean, mobile-first AI chat for Obsidian. It can read and search
your vault immediately, while every file-changing action is shown as a preview
and waits for your approval.

## Features

- Clean chat UI designed for iPhone and desktop
- One slash action: `/open plawe ai`
- OpenRouter model support
- Attach the active note as context
- Read and search Markdown notes
- Create, replace, append, move, and trash notes with confirmation
- Create folders with confirmation
- Uses Obsidian's mobile-compatible APIs

## Install

1. Extract the `plawe-ai` folder into your vault at `.obsidian/plugins/`.
2. Restart Obsidian or reload community plugins.
3. Enable **Plawe AI** under Community plugins.
4. Open Plawe AI settings and add an OpenRouter API key.
5. In any note, type `/open plawe ai` and choose the only suggestion.

## Privacy

The API key is stored in Obsidian's local plugin data. Messages and note
contents used as context are sent to the selected model through OpenRouter.
Plawe AI includes no telemetry.

## Safety

Reading and searching happen automatically. Creating, editing, moving, or
trashing vault content always requires confirmation in the chat.
