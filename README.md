# Pomodoro Tracker
This repository contains my completed solution to the [Pomodoro Tracker](https://roadmap.sh/projects/pomodoro-timer) challenge on roadmap.sh.

## Project Details
The objective of this project is to learn and practice frontend development skills by building a Pomodoro Timer, a productivity tool based on the Pomodoro Technique. The Pomodoro Technique is a time management method that uses a timer to break work into intervals (typically 25 minutes) separated by short breaks.

## Requirements Met
- **Flexible Clock Lifecycle Engines:** Smoothly handles Starting, Stopping, and Resuming countdown states without UI drift.
- **Customizable Interval Pipelines:** Configures custom session lengths for work sequences, short breaks, and automatic 15-minute long breaks after 4 completed work sessions.
- **Synthesized Audio Warning Triggers:** Synthesizes notification alerts instantly using the native Web Audio API, removing dependencies on heavy external asset files.
- **Automated Mode Routings:** Tracks cumulative cycle data and handles structural view switches dynamically.
- **Responsive Layout Card:** Fully structured grid setups optimized for consistent display across mobile devices, tablets, and desktop displays.

## File Structure

```text
pomodoro-timer/
├── src/
│   ├── App.jsx                # Core timer logic loops, states & audio synthesis pipelines
│   └── index.css              # Custom Tailwind directives & monochrome theme values
├── package.json               # Development dependency structures & script manifests
├── vite.config.js             # Asset building configuration presets
└── README.md                  # Comprehensive architectural project documentation
```

## Setup & Preview
To pull down the project and run the assessment platform locally:
- Clone the repository and enter the workspace root:
```bash
cd pomodoro-tracker-rm
```
- Install the required runtime package dependencies:
```bash
npm install
```
- Boot up the Vite build development server pipeline:
```bash
npm run dev
```
- Launch the platform in your browser window:
Navigate to http://localhost:5173/ to interact with the quiz app interface.