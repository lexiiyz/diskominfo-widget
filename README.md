# Diskominfo Chat Widget

A floating chat widget built with React, Vite, and Tailwind CSS. It connects to Supabase for user authentication (Google Login) and uses an external webhook (e.g., N8N) to process and reply to chat messages.

## Features

- 💬 **Interactive Chat Interface**: Beautiful floating widget with slide-up animations and a premium UI (olive & gold theme).
- 🔐 **Supabase Authentication**: Built-in Google OAuth login flow before users can send messages.
- 🤖 **Webhook Integration**: Forwards user messages to any specified webhook URL and renders the bot's JSON response.
- 📝 **Markdown Parsing**: Supports displaying markdown links, bold text, and HTML tables from the bot response.
- 📦 **NPM Ready**: Built as a module (`es` and `umd`) for easy use across different websites.

## Installation & Usage

Please see the [USAGE.md](./USAGE.md) file for detailed instructions on how to use this widget in:

1. **React Projects** (via `npm install`)
2. **Plain HTML Websites** (via `<script>` CDNs)

## Development Setup

If you want to modify the widget's source code:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build the library (outputs to /dist)
npm run build:lib
```

## Environment Variables

If you are developing locally, create a `.env` file referencing your Supabase project and Webhook URL:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
VITE_WEBHOOK_URL=https://n8n.your-domain.com/webhook/chat
```
