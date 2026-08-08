# WA-Receptionist
# Multitenant WhatsApp AI Assistant (SaaS Architecture)

A scalable, multitenant backend service that allows multiple users to connect their individual WhatsApp accounts and deploy custom AI assistants simultaneously. Built with Node.js, Baileys, and Redis, this architecture isolates user sessions, manages concurrent WebSockets, and scales conversational memory efficiently.

## Core Features

* **Multi-Session Management:** Dynamically creates, stores, and restores multiple independent WhatsApp sessions (via the Baileys library) on a single Node.js instance.
* **Tenant Data Isolation:** Ensures that chat histories, system prompts, and AI contexts are strictly isolated per user and per phone number.
* **Distributed In-Memory Caching:** Utilizes Redis for high-performance conversation history storage, implementing automatic Time-To-Live (TTL) cleanup without blocking the main thread.
* **Dynamic QR Code Routing:** Uses Server-Sent Events (SSE) to stream unique authentication QR codes to specific tenant dashboards based on user IDs.
* **API Rate Limit Handling:** Implements asynchronous queuing to prevent mass-message delivery upon server restarts from triggering third-party API rate limits.

## Architecture Overview

Unlike a single-tenant setup, this architecture separates the connection logic from the AI processing logic. 
1. A user requests a new session via an HTTP endpoint.
2. The server initializes a dedicated Baileys socket for that tenant and streams the QR code.
3. Upon authentication, the session keys are saved to a designated directory tied to the tenant ID.
4. Incoming messages are routed through a central webhook manager, which fetches the specific tenant's configuration and AI prompt before querying the LLM.

## Prerequisites

To run this architecture, you must have the following installed in your environment:

* Node.js (v18 or higher)
* Redis Server (for scalable session memory)
* npm or yarn
* An active LLM API Key (e.g., Groq)

## Installation

1. Clone the repository to your server:
   \`\`\`bash
   git clone https://github.com/YourUsername/whatsapp-multitenant-saas.git
   \`\`\`

2. Navigate into the directory and install dependencies:
   \`\`\`bash
   cd whatsapp-multitenant-saas
   npm install
   \`\`\`

3. Create a `.env` file in the root directory to define your environment variables:
   \`\`\`text
   PORT=3000
   REDIS_URL=redis://127.0.0.1:6379
   DEFAULT_GROQ_API_KEY=your_api_key_here
   SESSION_DIRECTORY=./tenant_sessions
   \`\`\`

## Usage

1. Start your local Redis server. (If using Linux, you can typically run `sudo systemctl start redis`).

2. Start the Node.js backend:
   \`\`\`bash
   node server.js
   \`\`\`

3. **Initialize a New Tenant:**
   Send a POST request to `/api/sessions/create` with a unique tenant ID to generate a new WhatsApp connection instance.

4. **Connect a Device:**
   Listen to the SSE stream at `/api/sessions/qr/:tenantId` to render the QR code on your frontend application.

## Directory Structure

* `/controllers` - Contains the logic for HTTP endpoints and tenant provisioning.
* `/services` - Houses the core logic for WhatsApp sockets (Baileys) and LLM API integrations.
* `/config` - Database and Redis connection setups.
* `/tenant_sessions` - Automatically generated folder where encrypted authentication keys are stored per tenant.

## Troubleshooting

* **Redis Connection Errors:** Ensure your Redis instance is running locally on port 6379 or update the `REDIS_URL` in your environment variables to match your hosted Redis cluster.
* **Session Conflicts:** If a specific tenant's bot stops responding but others remain active, delete that specific tenant's folder inside `/tenant_sessions` and prompt them to re-scan their QR code. This resolves localized MAC decryption errors without resetting the entire server.
