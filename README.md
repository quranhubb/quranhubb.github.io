# Academy Connect Hub

Act as a Senior Full-Stack React Developer. Build a React-based Web Application (styled with Tailwind CSS) cloned pixel-for-pixel from Microsoft Teams Desktop UI for an Academy Management System. 

Incorporate the following strict functional, UI, security, and state management specifications:

---

### 1. CLEAN TRANSPARENT ANIMATED SPLASH SCREEN

- **Visual Design**: REMOVE any white square card box, background shadows, progress bars, and loading spinners entirely.

- **Logo Presentation**: Display ONLY the clean, transparent Academy Logo centered perfectly on the screen (<img src="academy-logo.png" alt="Academy Logo" className="w-32 h-32 object-contain animate-pulse" />).

- **Animation**: Apply a smooth, subtle pulse/scale animation (animate-pulse or CSS scale keyframes) directly to the logo.

- **Dynamic Text Sequence**: Render ONLY the status text directly below the transparent logo (no extra headings or LMS subtitles) with exact 1-second interval transitions:

  * 0s - 1s: "We are setting things up for you..."

  * 1s - 2s: "Just another minute..."

  * 2s - 3s: "Here you go.."

- **Smooth Transition**: After the 3-second sequence completes, seamlessly fade out the splash screen and reveal the isolated Authentication Screen.

---

### 2. AUTHENTICATION & ZERO PRE-LOADED DATA

- **Isolated Auth Page**: Do NOT render any home screen, background preview, or default dashboard behind the login form. Show ONLY the isolated Sign In / Sign Up form.

- **Dynamic Registration Only**: WIPE OUT all fake/mock users (e.g., Academy Admin, Ahmed Khan, Fatima Ali, Hassan Raza, Aisha Noor) from the system state and database arrays.

- **Empty States**:

  - The "Start a new chat" user list must start at strictly 0 users.

  - The Admin Panel Users tab count must start at 0.

  - Display clear empty state messages ("No registered users found") until real accounts are created via the Sign-Up form.

---

### 3. STRICT ADMIN PANEL SECURITY (mahnoorfatima123)

- **Access Control**: Hide or lock the Admin Panel access completely from regular Student and Teacher role views.

- **Master Password Verification**: Anyone attempting to access the Admin Panel or Owner Dashboard MUST be prompted with a modal asking for the master password.

- **Strict Enforcement**: Grant access ONLY if the user enters mahnoorfatima123. Reject any incorrect attempt immediately with a security alert banner.

---

### 4. PLAYABLE VIDEO & AUDIO RECORDINGS

- **Auto-Record Trigger**: Automatically log and trigger cloud recording whenever an active video/audio class session starts.

- **Interactive Player**: In the Admin "Recordings" tab, add a functional "Play / View Video Recording" button for each logged class session.

- **Media Playback**: Clicking "Play" must open an embedded video/audio player modal with controls to preview the class session (including teacher and student audio tracks).

- **Metadata**: Display session details alongside the player (Class ID, Date/Time, Duration, and Participant System IDs).

---

### 5. PRIVACY & REAL-TIME SECURITY (DLP)

- **Data Anonymization**: Tutors/Teachers cannot see student phone numbers or personal emails, and vice versa. Show only assigned System IDs (e.g., "Student #1042").

- **DLP Engine**: Continuously scan chat messages and call audio transcripts for phone numbers, email addresses, or social links.

- **Violation Action**: Block offending messages instantly, trigger a Red Alert notification in the Owner Admin Panel, and generate an Incident Log.

Please apply all of these updates cleanly across the codebase now.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://quranhubbb.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f818639d-f61d-4256-a36e-0cb6ae953dcd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
