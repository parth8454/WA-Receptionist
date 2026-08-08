# Multitenant WhatsApp Auto Assistant (SaaS Architecture)

A scalable, multitenant backend service that allows multiple users (shops or businesses) to connect their individual WhatsApp accounts and deploy automated assistants simultaneously. Built with Node.js and Baileys, this architecture isolates user sessions, manages concurrent WebSockets, and organizes data using a clean MVC (Model-View-Controller) pattern.

## Core Features

* **Multi-Session Management:** Dynamically creates, stores, and restores multiple independent WhatsApp sessions on a single Node.js instance.
* **Tenant Data Isolation:** Ensures that chat histories, customer leads, and shop configurations are strictly isolated per user within the database.
* **Structured Data Models:** Uses dedicated models to track Customers, Leads, Messages, Products, and Shop configurations.
* **Dynamic QR Code Routing:** Streams unique authentication QR codes to the frontend dashboard based on the specific shop or user authenticating.
* **Secure Authentication:** Implements OTP-based signup and middleware validation to protect tenant routes and webhooks.

## Architecture & Directory Structure

The project is divided into a frontend client and a comprehensive backend API (`whatsapp-auto`). The backend follows a structured MVC design pattern:

* **`/frontend`** - Contains the client-side application and user dashboard UI.
* **`/whatsapp-auto`** - The core backend Node.js application directory.
  * **`/controllers`** - Contains the core execution logic for the application.
    * `authController.js`, `Signup_otp.js` - Manages user authentication and OTP generation.
    * `shopController.js` - Manages shop-specific settings and provisioning.
    * `webhookController.js` - Processes incoming WhatsApp messages and triggers the AI/Auto-reply logic.
  * **`/Middle`** - Houses middleware functions to protect routes.
    * `/SingupValidation` - Validates incoming user registration data.
    * `auth.js` - Verifies user tokens/sessions before allowing route access.
  * **`/models`** - Defines the database schemas.
    * `Customer.js`, `Lead.js` - Tracks users interacting with the bots.
    * `Message.js` - Stores conversation histories.
    * `Product.js`, `Shop.js` - Manages tenant-specific inventory and store configurations.
    * `otp.js` - Manages temporary authentication codes.
  * **`/routes`** - Defines the Express API endpoints.
    * `authRoutes.js`, `shopRoutes.js`, `webhookRoutes.js` - Maps endpoints to their respective controllers.
  * **`/Services`** - Houses the core background services, such as the WhatsApp socket initialization (Baileys) and API integrations.
  * **`/sessions`** - Automatically generated directory where the encrypted WhatsApp authentication keys are stored per tenant.

## Prerequisites

To run this architecture, you must have the following installed:

* Node.js (v18 or higher recommended)
* A supported Database (e.g., MongoDB, given the typical Model structure)
* npm or yarn

## Installation

1. Clone the repository to your local machine or server:
   \`\`\`bash
   git clone https://github.com/YourUsername/whatsapp-auto-saas.git
   \`\`\`

2. Navigate into the backend directory and install dependencies:
   \`\`\`bash
   cd whatsapp-auto
   npm install
   \`\`\`

3. Create a `.env` file in the `whatsapp-auto` directory with your environment variables (Database URIs, API keys, Port configurations).

## Usage

1. Start the Node.js backend:
   \`\`\`bash
   node index.js
   \`\`\`
   *(Note: replace `index.js` with your main entry file if it differs)*

2. **Initialize a Shop/Tenant:**
   Use the frontend or hit the `/routes/authRoutes.js` endpoints to create a new shop account and verify via OTP.

3. **Connect a Device:**
   Request a session creation. The backend will initialize a Baileys socket in the `/Services` folder and save the auth keys into the `/sessions` folder. Scan the resulting QR code on the frontend.

## Troubleshooting

* **Session Conflicts:** If a specific shop's bot stops responding, delete that specific tenant's folder inside `/sessions` and prompt them to re-scan their QR code from the frontend dashboard. 
* **Middleware Blocks:** If endpoints are returning unauthorized errors, verify that `auth.js` is correctly parsing the tokens and that the user's shop ID is correctly attached to the request payload.
