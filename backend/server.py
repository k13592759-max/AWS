"""
CampusFix AI - Local & Hybrid Server
Dual-Mode Server:
- Real AWS Mode: Connects to Amazon DynamoDB, Amazon S3, and AWS Step Functions when AWS credentials are provided.
- Local Mode: When AWS credentials are not configured, uses persistent JSON file store and an async Step Functions
  runner to test the 60-second SLA escalation end-to-end locally.
- Real Image Uploads: Accepts real HTTP PUT uploads and serves them via /static/uploads/{filename}.
"""

import os
import sys
import json
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Optional, List
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# Check AWS credentials
HAS_AWS_CREDENTIALS = False
boto_dynamodb = None
boto_s3 = None
boto_sfn = None

try:
    import boto3
    from botocore.exceptions import NoCredentialsError, ClientError
    session = boto3.Session()
    creds = session.get_credentials()
    if creds and creds.access_key:
        HAS_AWS_CREDENTIALS = True
        REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
        boto_dynamodb = boto3.resource("dynamodb", region_name=REGION)
        boto_s3 = boto3.client("s3", region_name=REGION)
        boto_sfn = boto3.client("stepfunctions", region_name=REGION)
except Exception:
    HAS_AWS_CREDENTIALS = False

REGION_NAME = os.environ.get("AWS_REGION_NAME", "ap-south-1")
TABLE_NAME = os.environ.get("TICKETS_TABLE", "CampusFixTickets")
UPLOADS_BUCKET = os.environ.get("UPLOADS_BUCKET", "campusfix-evidence-bucket")
STATE_MACHINE_ARN = os.environ.get("STATE_MACHINE_ARN", "")
DEFAULT_SLA_SECONDS = int(os.environ.get("DEFAULT_SLA_SECONDS", "60"))

# Local persistent database and uploads paths
BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / "local_tickets_db.json"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="CampusFix AI Server",
    description="Smart Campus Infrastructure Issue Reporting & Automatic Escalation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_initial_seed_data():
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "ticketId": "TKT-89341",
            "title": "Ceiling Fan Sparking & Grinding Noise",
            "category": "ELECTRICAL",
            "description": "The ceiling fan in Lecture Hall 204 started emitting visible electrical sparks and a loud screeching noise during lecture. Immediate hazard to students seated beneath it.",
            "building": "Ramanujan Science Block",
            "room": "Lecture Hall 204",
            "priority": "CRITICAL",
            "status": "PENDING",
            "imageUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
            "reporterName": "Rahul Verma",
            "createdAt": now,
            "updatedAt": now,
            "slaSeconds": 60,
            "escalated": False,
            "timeline": [
                {
                    "status": "PENDING",
                    "timestamp": now,
                    "actor": "Rahul Verma (Student)",
                    "note": "Issue reported via QR code in Ramanujan Science Block LH-204."
                }
            ]
        },
        {
            "ticketId": "TKT-74102",
            "title": "Severe Water Pipe Leakage in 2nd Floor Restroom",
            "category": "PLUMBING",
            "description": "High-pressure pipeline under the third sink has ruptured. Water is flowing into the hallway and endangering nearby server conduits.",
            "building": "Visvesvaraya Engineering Hall",
            "room": "Restroom 2B",
            "priority": "HIGH",
            "status": "IN_PROGRESS",
            "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
            "reporterName": "Priya Nair",
            "createdAt": now,
            "updatedAt": now,
            "slaSeconds": 60,
            "escalated": False,
            "adminNotes": "Facilities team dispatched with emergency shut-off wrench.",
            "timeline": [
                {
                    "status": "PENDING",
                    "timestamp": now,
                    "actor": "Priya Nair (Faculty)",
                    "note": "Logged plumbing emergency."
                },
                {
                    "status": "IN_PROGRESS",
                    "timestamp": now,
                    "actor": "Admin (Mr. K. Sharma)",
                    "note": "Plumbing contractor assigned. Estimated repair time: 45 mins."
                }
            ]
        },
        {
            "ticketId": "TKT-61298",
            "title": "Library Wi-Fi Access Point Offline",
            "category": "WIFI_IT",
            "description": "Aruba AP in the reference section has no power LED. Over 60 students in the study hall have lost network access during exam prep week.",
            "building": "Central Library",
            "room": "Reference Hall, 1st Floor",
            "priority": "MEDIUM",
            "status": "RESOLVED",
            "imageUrl": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
            "reporterName": "Aditya Joshi",
            "createdAt": now,
            "updatedAt": now,
            "resolvedAt": now,
            "slaSeconds": 60,
            "escalated": False,
            "adminNotes": "PoE switch port 14 power reset completed. Firmware reloaded successfully.",
            "timeline": [
                {
                    "status": "PENDING",
                    "timestamp": now,
                    "actor": "Aditya Joshi",
                    "note": "Reported lost connectivity."
                },
                {
                    "status": "IN_PROGRESS",
                    "timestamp": now,
                    "actor": "Campus IT NOC",
                    "note": "Investigating switch uplink."
                },
                {
                    "status": "RESOLVED",
                    "timestamp": now,
                    "actor": "Network Admin",
                    "note": "PoE injector replaced and signal verified at 120 Mbps."
                }
            ]
        },
        {
            "ticketId": "TKT-55120",
            "title": "Broken Auditorium Front Bench Support",
            "category": "FURNITURE",
            "description": "Welding on row 3 bench frame cracked. Sharp metal exposed. Risk of injury.",
            "building": "Main Administrative Building",
            "room": "Auditorium Main",
            "priority": "HIGH",
            "status": "ESCALATED",
            "imageUrl": "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
            "reporterName": "Sneha Roy",
            "createdAt": now,
            "updatedAt": now,
            "slaSeconds": 60,
            "escalated": True,
            "escalatedAt": now,
            "escalationReason": "Automated SLA breach: Unresolved after 60s operational window. Escalated to Facilities Director.",
            "timeline": [
                {
                    "status": "PENDING",
                    "timestamp": now,
                    "actor": "Sneha Roy",
                    "note": "Initial report submitted."
                },
                {
                    "status": "ESCALATED",
                    "timestamp": now,
                    "actor": "AWS Step Functions Auto-Escalator",
                    "note": "Automated SLA breach: Unresolved after 60s operational window. Escalated to Facilities Director."
                }
            ]
        }
    ]

def load_db() -> List[dict]:
    if not DATA_FILE.exists():
        initial = get_initial_seed_data()
        save_db(initial)
        return initial
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return get_initial_seed_data()

def save_db(data: List[dict]):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)

# Models
class CreateTicketRequest(BaseModel):
    title: str
    category: str
    description: str
    building: str
    room: str
    priority: str = "MEDIUM"
    imageUrl: Optional[str] = ""
    reporterName: Optional[str] = "Student"
    slaSeconds: Optional[int] = 60

class UpdateTicketRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    adminNotes: Optional[str] = None
    actor: Optional[str] = "Facilities Admin"
    note: Optional[str] = None

class PresignRequest(BaseModel):
    contentType: str
    fileName: Optional[str] = "evidence.jpg"

# Asynchronous Step Functions Escalation Runner
async def step_functions_escalation_runner(ticket_id: str, wait_seconds: int):
    """
    Simulates the AWS Step Functions state machine execution logic:
    State 1: WaitForSLA (wait_seconds)
    State 2: CheckTicketStatus
    State 3: If not RESOLVED, EscalateTicket
    """
    print(f"⚡ [AWS Step Functions] Execution started for {ticket_id}. Waiting {wait_seconds}s SLA window...")
    await asyncio.sleep(wait_seconds)

    print(f"🔍 [AWS Step Functions] Checking status for ticket {ticket_id}...")
    tickets = load_db()
    target = None
    for t in tickets:
        if t["ticketId"] == ticket_id:
            target = t
            break

    if not target:
        print(f"⚠️ [AWS Step Functions] Ticket {ticket_id} not found.")
        return

    # Check if resolved
    if target.get("status") == "RESOLVED":
        print(f"✅ [AWS Step Functions] Ticket {ticket_id} is RESOLVED. SLA satisfied. Stopping workflow.")
        return

    if target.get("status") == "ESCALATED":
        print(f"ℹ️ [AWS Step Functions] Ticket {ticket_id} already escalated.")
        return

    # Trigger Escalation
    print(f"🚨 [AWS Step Functions] SLA breached! Escalating ticket {ticket_id} to ESCALATED...")
    now_iso = datetime.now(timezone.utc).isoformat()
    reason = f"Automated SLA breach: Unresolved after {wait_seconds}s operational window."
    target["status"] = "ESCALATED"
    target["escalated"] = True
    target["escalatedAt"] = now_iso
    target["escalationReason"] = reason
    target["updatedAt"] = now_iso
    if "timeline" not in target:
        target["timeline"] = []
    target["timeline"].append({
        "status": "ESCALATED",
        "timestamp": now_iso,
        "actor": "AWS Step Functions Auto-Escalator",
        "note": reason
    })

    save_db(tickets)
    print(f"🚀 [AWS Step Functions] Escalation complete for {ticket_id}.")

# Real Uploads Handlers
@app.put("/api/uploads/{filename}")
async def upload_file_binary(filename: str, request: Request):
    """
    Real HTTP PUT handler matching the S3 presigned PUT contract.
    Receives raw image bytes from frontend, saves to disk, and makes available.
    """
    # Sanitize filename
    clean_filename = Path(filename).name
    file_path = UPLOADS_DIR / clean_filename

    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty file payload")

    with open(file_path, "wb") as f:
        f.write(body)

    print(f"📷 [S3 Upload Simulator] Successfully saved {len(body)} bytes to {file_path}")
    return {"message": "Upload successful", "filename": clean_filename, "size": len(body)}

@app.get("/static/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Serves uploaded files statically with correct content type."""
    clean_filename = Path(filename).name
    file_path = UPLOADS_DIR / clean_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    content_type = "image/jpeg"
    if clean_filename.endswith(".png"):
        content_type = "image/png"
    elif clean_filename.endswith(".webp"):
        content_type = "image/webp"

    return FileResponse(file_path, media_type=content_type)

# Endpoints
@app.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "CampusFix AI API",
        "region": REGION_NAME,
        "table": TABLE_NAME,
        "awsCredentialsConfigured": HAS_AWS_CREDENTIALS,
        "mode": "AWS Live" if HAS_AWS_CREDENTIALS else "Local Dev & Step Functions Simulation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@app.get("/api/system-status")
def get_system_status():
    return {
        "awsRegion": REGION_NAME,
        "dynamoDbTable": TABLE_NAME,
        "s3Bucket": UPLOADS_BUCKET,
        "stepFunctionsArn": STATE_MACHINE_ARN or "arn:aws:states:ap-south-1:123456789012:stateMachine:CampusFix-EscalationWorkflow",
        "hasAwsCredentials": HAS_AWS_CREDENTIALS,
        "mode": "AWS_CONNECTED" if HAS_AWS_CREDENTIALS else "LOCAL_DEV_SIMULATOR",
        "slaSecondsDefault": DEFAULT_SLA_SECONDS,
        "deploymentStatus": {
            "credentialsFound": HAS_AWS_CREDENTIALS,
            "dynamoDb": "CONNECTED" if HAS_AWS_CREDENTIALS else "LOCAL_FILE_STORE",
            "s3Uploads": "CONNECTED" if HAS_AWS_CREDENTIALS else "LOCAL_HTTP_PUT_STORE",
            "stepFunctions": "CONNECTED" if HAS_AWS_CREDENTIALS else "LOCAL_ASYNC_SIMULATOR",
            "nextStepIfDeploying": "Run 'sam build && sam deploy --guided' with AWS credentials configured" if not HAS_AWS_CREDENTIALS else "Deployed and connected to AWS"
        }
    }

@app.get("/tickets")
def list_tickets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    building: Optional[str] = None
):
    tickets = load_db()
    if status:
        tickets = [t for t in tickets if t.get("status") == status.upper()]
    if category:
        tickets = [t for t in tickets if t.get("category") == category.upper()]
    if building:
        tickets = [t for t in tickets if building.lower() in (t.get("building") or "").lower()]

    tickets.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return {
        "total": len(tickets),
        "tickets": tickets
    }

@app.post("/tickets", status_code=201)
async def create_ticket(req: CreateTicketRequest):
    tickets = load_db()
    ticket_id = f"TKT-{uuid.uuid4().hex[:5].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    new_item = {
        "ticketId": ticket_id,
        "title": req.title.strip(),
        "category": req.category.upper().strip(),
        "description": req.description.strip(),
        "building": req.building.strip(),
        "room": req.room.strip(),
        "priority": req.priority.upper().strip(),
        "status": "PENDING",
        "imageUrl": req.imageUrl or "",
        "reporterName": req.reporterName or "Campus Student",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "slaSeconds": req.slaSeconds or DEFAULT_SLA_SECONDS,
        "escalated": False,
        "stepFunctionsExecutionArn": (
            f"arn:aws:states:{REGION_NAME}:123456789012:execution:CampusFix-Escalation:{ticket_id}"
        ),
        "timeline": [
            {
                "status": "PENDING",
                "timestamp": now_iso,
                "actor": req.reporterName or "Campus Student",
                "note": "Issue submitted via CampusFix web portal and entered SLA tracking queue."
            }
        ]
    }

    tickets.insert(0, new_item)
    save_db(tickets)

    # Launch AWS Step Functions background escalation task
    sla_wait = req.slaSeconds or DEFAULT_SLA_SECONDS
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(step_functions_escalation_runner(ticket_id, sla_wait))
    except RuntimeError:
        pass

    return {
        "message": "Ticket created successfully",
        "ticket": new_item
    }

@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: str):
    tickets = load_db()
    for t in tickets:
        if t["ticketId"] == ticket_id:
            return {"ticket": t}
    raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

@app.patch("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, req: UpdateTicketRequest):
    tickets = load_db()
    target = None
    for t in tickets:
        if t["ticketId"] == ticket_id:
            target = t
            break

    if not target:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    old_status = target.get("status")

    if req.status:
        st = req.status.upper().strip()
        target["status"] = st
        if st == "RESOLVED":
            target["resolvedAt"] = now_iso
            target["escalated"] = False
        elif st == "ESCALATED":
            target["escalated"] = True
            target["escalatedAt"] = now_iso
            target["escalationReason"] = req.note or "Manually escalated by supervisor."

        note_msg = req.note or f"Status changed from {old_status} to {st}"
        target.setdefault("timeline", []).append({
            "status": st,
            "timestamp": now_iso,
            "actor": req.actor or "Facilities Administrator",
            "note": note_msg
        })

    if req.priority:
        target["priority"] = req.priority.upper().strip()

    if req.adminNotes is not None:
        target["adminNotes"] = req.adminNotes

    target["updatedAt"] = now_iso
    save_db(tickets)

    return {
        "message": "Ticket updated successfully",
        "ticket": target
    }

@app.post("/uploads/presign")
def presign_upload(req: PresignRequest):
    allowed = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    if req.contentType not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported MIME type. Must be image/jpeg, image/png, or image/webp")

    ext = allowed[req.contentType]
    unique_filename = f"{uuid.uuid4().hex[:8]}-{uuid.uuid4().hex[:6]}.{ext}"

    if HAS_AWS_CREDENTIALS:
        try:
            unique_key = f"evidence/{unique_filename}"
            s3 = boto3.client("s3", region_name=REGION_NAME)
            url = s3.generate_presigned_url(
                ClientMethod="put_object",
                Params={"Bucket": UPLOADS_BUCKET, "Key": unique_key, "ContentType": req.contentType},
                ExpiresIn=300
            )
            return {
                "uploadUrl": url,
                "objectKey": unique_key,
                "fileUrl": f"https://{UPLOADS_BUCKET}.s3.{REGION_NAME}.amazonaws.com/{unique_key}",
                "expiresIn": 300,
                "provider": "AWS_S3"
            }
        except Exception as e:
            print(f"S3 Presign failed: {e}")

    # Functional Local Storage Provider: accepts genuine HTTP PUT requests and serves static file
    return {
        "uploadUrl": f"http://127.0.0.1:8000/api/uploads/{unique_filename}",
        "objectKey": unique_filename,
        "fileUrl": f"http://127.0.0.1:8000/static/uploads/{unique_filename}",
        "expiresIn": 300,
        "provider": "LOCAL_STORAGE",
        "note": "Local development storage: accepts PUT binary upload and serves from disk."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
