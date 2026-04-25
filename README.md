# ScamShield AI

## Problem Statement
Thousands of people across India receive fraudulent SMS, email, and WhatsApp messages daily impersonating banks, government agencies, and delivery services. Most victims — especially elderly and non-tech-savvy users — cannot identify these scams in time, resulting in financial loss and identity theft. There is no simple, accessible tool that lets an ordinary person instantly verify whether a message is a scam and report it to authorities in one click.

## Project Description
ScamShield AI is a browser-based scam detection app where users paste any suspicious message and receive an instant AI-powered verdict — Scam, Suspicious, or Safe — along with a 0–100% risk score, plain-language explanation, and a breakdown of threat tactics such as phishing URLs, urgency manipulation, and identity impersonation. If a scam is detected, the app auto-generates a formal cyber crime report and lets the user file it directly with Kerala Cyber Cell, call helpline 1930, or submit to the national NCRP portal. The app fully supports Malayalam, making it accessible to regional users, and includes a live threat dashboard tracking all analysis history.

## Google AI Usage
### Tools / Models Used
Gemini 2.0 Flash (via Google AI Studio API)

### How Google AI Was Used
Each user-submitted message is sent to the Gemini API with a structured prompt that instructs the model to classify the message as Scam, Suspicious, or Safe, assign a risk score from 0–100, explain its reasoning in plain language, and list specific threat tactics detected. Gemini's multilingual capability handles Malayalam-language scam messages natively without any preprocessing. The structured response from Gemini powers all seven pages of the app — the live analyzer, forensic deep scan, auto-generated cyber crime report, and JSON evidence export.

## Proof of Google AI Usage
Attach screenshots in a `/proof` folder:

![AI Proof](./proof/screenshot1.png)

---

## Screenshots and Demovideo
https://drive.google.com/drive/folders/17br5ky2S3cGqXqOHj-H_tKaG4ZsCOV4t?usp=drive_link

