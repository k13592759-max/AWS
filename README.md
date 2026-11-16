# CampusFix AI — Report it. Track it. Fix it.

> **Next-Generation Smart Campus Infrastructure Issue Reporting & Automated AWS Step Functions Escalation Platform**  
> *Target AWS Region: `ap-south-1` (Mumbai)*

---

## 1. Executive Summary & Project Vision

Campus maintenance in traditional universities suffers from fragmented paper registers, misplaced complaints, lack of visual photographic evidence, and zero operational accountability. When an electrical fan sparks or a high-pressure water pipe ruptures, students are left in the dark while maintenance crews delay repairs indefinitely.

**CampusFix AI** revolutionizes campus facilities management:
- **Instant QR Code Reporting**: Students scan dynamic QR codes affixed to classroom, laboratory, and hostel doors. Geographic metadata (Building & Room number) is automatically prefilled.
- **S3 Presigned Evidence Uploads**: Students attach photographic evidence directly to Amazon S3 via temporary presigned PUT URLs with least-privilege IAM policies.
- **Automated SLA Escalation System**: Powered by an **AWS Step Functions state machine**, every complaint initiates an SLA timer (configurable; default **60 seconds** in live demonstration mode). If facilities administration does not resolve the work order within the SLA, the state machine automatically escalates the ticket to `ESCALATED` status, notifying the Facilities Directorate.
- **Transparent Public Tracking**: Real-time status timeline and countdown clock keep students informed at every stage from submission to resolution.
- **Executive Campus Health Analytics**: Real-time KPI dashboards track resolution velocity, incident heatmaps by building, and category breakdowns.

---

## 2. Serverless Cloud Architecture (ap-south-1 Mumbai)

```
                            [ Student Mobile / Web Browser ]
                                      |          |
                      Scan Location QR|          | Direct Report
                                      v          v
                       +-----------------------------------+
                       |    React 18 + Vite + TypeScript   |
                       |       Tailwind CSS UI Client      |
                       +-----------------------------------+
                                         |
             +---------------------------+--------------------------+
             | REST Requests                                        | Secure Presigned PUT
             v                                                      v
+-----------------------------+                           +-----------------------+
|  Amazon API Gateway (v2)    |                           |    Amazon S3 Bucket   |
|   HTTP API (CORS Enabled)   |                           | Photographic Evidence |
+-----------------------------+                           +-----------------------+
             |
             +-----------------------+----------------------+
             |                       |                      |
             v                       v                      v
+-------------------------+ +-------------------+ +---------------------+
|   TicketsApiFunction    | |PresignUploadFn    | |CheckStatusFunction  |
|      (Python 3.12)      | |   (Python 3.12)   | |    (Python 3.12)    |
+-------------------------+ +-------------------+ +---------------------+
             |                       |                      ^
             | Put/Get/Update        | Presign URL          | Read Status
             v                       v                      |
+-------------------------------------------------+         |
|             Amazon DynamoDB Table               |         |
|             (CampusFixTickets)                  |         |
+-------------------------------------------------+         |
             |                                              |
             | Kicks off Execution                          |
             v                                              |
+-----------------------------------------------------------+---------------------+
|                  AWS Step Functions State Machine                               |
|                  (CampusFix-EscalationWorkflow)                                 |
|                                                                                 |
|   [ Start ] --> [ WaitForSLA: 60s ] --> [ CheckTicketStatus (Lambda) ]          |
|                                                     |                           |
|                                                     v                           |
|                                        < Ticket Resolved? >                     |
|                                          /              \                       |
|                                    [Yes]/                \[No]                  |
|                                        v                  v                     |
|                           [ TicketResolved ]     [ EscalateTicket (Lambda) ]    |
|                              (Succeed)                    |                     |
|                                                           v                     |
|                                                  [ EscalationComplete ]         |
|                                                         (Succeed)               |
+---------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS | Enterprise SaaS interface, Lucide React icons, Canvas Confetti |
| **Backend Compute** | Python 3.12 on AWS Lambda | Event-driven micro-functions with strict typing and input validation |
| **API Layer** | Amazon API Gateway (HTTP API v2) | Low latency, built-in CORS, RESTful routes |
| **Primary Database** | Amazon DynamoDB | On-Demand (PAY_PER_REQUEST), Single-Table Design, GSIs on `status` & `building` |
| **Storage** | Amazon S3 | Server-side encrypted, presigned PUT URLs, restricted MIME types (max 5MB) |
| **Workflow Automation** | AWS Step Functions (ASL) | Automatic SLA breach escalation state machine with configurable SLA window |
| **Infrastructure as Code** | AWS SAM (Serverless Application Model) | Declarative `template.yaml` for one-click deployment to `ap-south-1` |

---

## 4. DynamoDB Schema Design

### Table Name: `CampusFixTickets`
- **Partition Key (PK)**: `ticketId` (String, e.g. `TKT-89341`)
- **Billing Mode**: `PAY_PER_REQUEST`

### Attributes:
| Attribute | Type | Description |
|---|---|---|
| `ticketId` | String | Unique human-friendly ID (e.g. `TKT-89341`) |
| `title` | String | Brief title of the issue |
| `description` | String | Detailed description of the problem |
| `category` | String | `ELECTRICAL`, `PLUMBING`, `WIFI_IT`, `FURNITURE`, `HVAC`, `CLEANLINESS`, `SAFETY_STRUCTURAL`, `OTHER` |
| `building` | String | Campus facility (e.g. `Ramanujan Science Block`) |
| `room` | String | Room / Laboratory (e.g. `Physics Lab 304`) |
| `priority` | String | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | String | `PENDING`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED` |
| `imageUrl` | String | Public or S3 URL of photographic evidence |
| `reporterName` | String | Submitting student/faculty name |
| `createdAt` | String | ISO 8601 UTC timestamp |
| `updatedAt` | String | ISO 8601 UTC timestamp |
| `resolvedAt` | String | ISO 8601 UTC timestamp (when closed) |
| `slaSeconds` | Number | Configured SLA timeout (default 60s) |
| `escalated` | Boolean | True if SLA expired without resolution |
| `escalatedAt` | String | ISO 8601 UTC timestamp of escalation |
| `escalationReason`| String | Reason for automated escalation |
| `adminNotes` | String | Dispatch or vendor notes logged by staff |
| `timeline` | List | Chronological log of status changes and actors |

### Global Secondary Indexes (GSIs):
1. **`StatusIndex`**: `status` (HASH) + `createdAt` (RANGE)
2. **`BuildingIndex`**: `building` (HASH) + `createdAt` (RANGE)

---

## 5. Automatic Escalation System (AWS Step Functions)

The automated escalation engine ensures zero complaints fall through administrative cracks:

1. **Step 1 — Initiation**: When a ticket is submitted via `POST /tickets`, the Lambda handler invokes `sfn_client.start_execution` passing `ticketId`, `slaSeconds`, priority, and building context.
2. **Step 2 — WaitForSLA**: The state machine enters a `Wait` state pausing for `$.slaSeconds` (default: **60 seconds** for demonstration).
3. **Step 3 — CheckTicketStatus**: Invokes `CheckStatusFunction` Lambda to query DynamoDB.
4. **Step 4 — Choice State (`EvaluateTicketStatus`)**:
   - If `status == "RESOLVED"`, the workflow branches to `TicketAlreadyResolved` (Succeed).
   - If `status == "ESCALATED"`, branches to `TicketAlreadyEscalated` (Succeed).
   - Otherwise (ticket is still `PENDING` or `IN_PROGRESS`), branches to `TriggerEscalation`.
5. **Step 5 — TriggerEscalation**: Invokes `EscalateFunction` Lambda, which:
   - Updates DynamoDB ticket `status` to `ESCALATED`.
   - Sets `escalated = true` and `escalatedAt = ISO 8601`.
   - Records `escalationReason = "Automated SLA breach: Unresolved after 60s operational window."`.
   - Appends an audit log to `timeline` with actor `"AWS Step Functions Auto-Escalator"`.
   - Notifies the campus facility director and department heads.

---

## 6. API Reference

All requests accept and return JSON. CORS headers are returned on all endpoints.

### `GET /health`
Returns deployment health and AWS configuration status.
```json
{
  "status": "healthy",
  "service": "CampusFix AI Serverless API",
  "region": "ap-south-1",
  "table": "CampusFixTickets",
  "timestamp": "2026-11-16T11:45:00Z"
}
```

### `POST /tickets`
Submits a new infrastructure issue and begins Step Functions escalation execution.
**Payload:**
```json
{
  "title": "Ceiling Fan Sparking in Hall 204",
  "category": "ELECTRICAL",
  "description": "Visible sparks emitted during lecture.",
  "building": "Ramanujan Science Block",
  "room": "Lecture Hall 204",
  "priority": "CRITICAL",
  "imageUrl": "https://s3.ap-south-1.amazonaws.com/evidence/fan.jpg",
  "reporterName": "Rahul Verma",
  "slaSeconds": 60
}
```
**Response (201 Created):** Returns created ticket with generated `ticketId` (e.g. `TKT-89341`).

### `GET /tickets`
Lists tickets with optional query parameter filtering.
- `GET /tickets?status=ESCALATED`
- `GET /tickets?category=ELECTRICAL`
- `GET /tickets?building=Science`

### `GET /tickets/{ticketId}`
Retrieves full details and timeline for a specific ticket.

### `PATCH /tickets/{ticketId}`
Updates status, priority, or adds admin dispatch notes.
```json
{
  "status": "IN_PROGRESS",
  "adminNotes": "Electrician dispatched with spare regulator.",
  "actor": "Facilities Supervisor"
}
```

### `POST /uploads/presign`
Generates a secure S3 presigned PUT URL for photo uploads.
```json
{
  "contentType": "image/jpeg",
  "fileName": "evidence.jpg"
}
```
**Response:**
```json
{
  "uploadUrl": "https://campusfix-evidence-bucket.s3.ap-south-1.amazonaws.com/evidence/...",
  "objectKey": "evidence/9f4a1b-photo.jpg",
  "fileUrl": "https://campusfix-evidence-bucket.s3.ap-south-1.amazonaws.com/evidence/9f4a1b-photo.jpg",
  "expiresIn": 300
}
```

---

## 7. Project Directory Structure

```
campusfix-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArchitectureModal.tsx     # Interactive AWS Serverless visualizer
│   │   │   ├── CategoryIcon.tsx          # Infrastructure category pills & icons
│   │   │   ├── Footer.tsx                # Enterprise footer
│   │   │   ├── Navbar.tsx                # Navigation bar & mode switcher
│   │   │   ├── PriorityBadge.tsx         # Color-coded urgency badges
│   │   │   ├── QRCodeGenerator.tsx       # Vector SVG QR code generator
│   │   │   └── StatusBadge.tsx           # Status indicators with animations
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx        # Management console & triage table
│   │   │   ├── AnalyticsPage.tsx         # Live data charts & building heatmaps
│   │   │   ├── EscalationPage.tsx        # SLA escalation control room
│   │   │   ├── LandingPage.tsx           # High-converting SaaS landing page
│   │   │   ├── QRCodeHubPage.tsx         # Printable signage & scan simulator
│   │   │   ├── ReportIssuePage.tsx       # Issue report form with photo upload
│   │   │   ├── StudentDashboard.tsx      # Student KPI cards & recent issues
│   │   │   └── TicketTrackingPage.tsx    # Live SLA countdown ring & audit trail
│   │   ├── hooks/
│   │   │   └── useTickets.ts             # Live polling hook for real-time updates
│   │   ├── services/
│   │   │   └── api.ts                    # REST client with offline fallback cache
│   │   ├── types/
│   │   │   └── ticket.ts                 # Full TypeScript definitions
│   │   ├── App.tsx                       # Core root coordinator
│   │   ├── main.tsx                      # Vite React entry point
│   │   └── index.css                     # Tailwind design system
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── api/
│   │   ├── tickets_handler.py            # Lambda handler for /health & /tickets
│   │   └── uploads_handler.py            # Lambda handler for S3 presigned URLs
│   ├── escalation/
│   │   ├── check_status_handler.py       # Step Functions SLA check Lambda
│   │   └── escalate_handler.py           # Step Functions SLA escalation Lambda
│   ├── server.py                         # Local development server & SFN simulator
│   └── requirements.txt
├── infrastructure/
│   ├── template.yaml                     # AWS SAM Template (Region: ap-south-1)
│   └── state-machine.asl.json            # Step Functions ASL State Machine
├── README.md
└── .gitignore
```

---

## 8. Local Quickstart (Zero-Setup Development)

You can run CampusFix AI completely on your local workstation without requiring active AWS credentials:

### Step 1: Start Backend API & Step Functions Simulator
In a terminal:
```bash
cd backend
python server.py
```
*The server will start on `http://127.0.0.1:8000`. It initializes the persistent JSON database and provides an asynchronous Step Functions SLA escalation simulator.*

### Step 2: Start Frontend Web Application
In a second terminal:
```bash
cd frontend
npm run dev
```
*The Vite development server will start on `http://localhost:5173`. Open this URL in your web browser.*

---

## 9. AWS Cloud Deployment (Region: ap-south-1 Mumbai)

When deploying to your live AWS account using AWS SAM:

### Prerequisites:
- AWS CLI configured (`aws configure` with access to `ap-south-1`)
- AWS SAM CLI installed (`sam --version`)
- Python 3.12

### Step 1: Build SAM Application
```bash
cd infrastructure
sam build
```

### Step 2: Deploy to AWS Mumbai
```bash
sam deploy --guided
```
Prompt values:
- **Stack Name**: `campusfix-ai`
- **AWS Region**: `ap-south-1`
- **Parameter DefaultSlaSeconds**: `60`
- **Confirm changes before deploy**: `y`
- **Allow SAM CLI IAM role creation**: `y`

### Step 3: Connect Frontend to API Gateway
Upon deployment completion, AWS SAM outputs the `ApiEndpoint` URL (e.g. `https://xxxx.execute-api.ap-south-1.amazonaws.com`).
Set this in `frontend/.env`:
```env
VITE_API_BASE_URL=https://xxxx.execute-api.ap-south-1.amazonaws.com
```
Rebuild and host the frontend on AWS S3 + CloudFront, AWS Amplify, or Vercel:
```bash
cd frontend
npm run build
```

---

## 10. Step-by-Step Testing & Verification Guide

### Test 1: Submit an Issue & Observe Automatic Escalation
1. Navigate to the **Report Issue** tab (`/report`).
2. Enter Title: `"Broken water pipe leaking under washbasin"`.
3. Select Category: `"Plumbing & Water"`.
4. Select Building: `"Visvesvaraya Engineering Hall"`, Room: `"Restroom 2B"`.
5. Select Priority: `"High"`.
6. Set SLA Window slider to **60 seconds**.
7. Click **Submit Campus Issue Report**.
8. Note the generated Ticket ID (e.g., `TKT-ABC12`). Click **Track Ticket Status in Real-Time**.
9. **Watch the live SLA Countdown Timer** count down from 60 seconds.
10. **The Moment the SLA expires**: AWS Step Functions executes `TriggerEscalation`. The status badge automatically updates in real time to **`ESCALATED`** with the escalation reason logged in the timeline!

### Test 2: Pre-SLA Resolution Check
1. Submit another report with a 60s SLA.
2. Switch to **Admin Mode** in the top navbar.
3. In the Admin Dashboard, locate the new ticket and click **Resolve**.
4. Navigate to the Ticket Tracker: Notice the SLA countdown ceases and the ticket displays **`SLA Met & Verified`** with green checkmark.
5. In Step Functions, the execution cleanly stops at `TicketAlreadyResolved`.

### Test 3: QR Code Location Flow
1. Navigate to **QR Scan & Codes** tab (`/qr`).
2. Under "Campus Hotspots", find `"Ramanujan Science Block - Physics Lab 304"`.
3. Click **Simulate QR Scan**.
4. Observe that the reporting form instantly opens with **Ramanujan Science Block** and **Physics Lab 304** prefilled automatically!

---

## 11. Security & Quality Guardrails

- **Zero Hardcoded Secrets**: AWS credentials, access keys, or secret tokens are never embedded in the client code.
- **Least-Privilege IAM**: SAM template uses scoped policies: `DynamoDBCrudPolicy`, `S3CrudPolicy`, and `StepFunctionsExecutionPolicy`.
- **Upload Hardening**: Restricts MIME types to `image/jpeg`, `image/png`, and `image/webp` with a strict 5MB limit.
- **CORS Restricted**: API Gateway explicitly specifies allowed methods (`GET`, `POST`, `PATCH`, `OPTIONS`) and safe headers.
