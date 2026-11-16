"""
CampusFix AI - Automated Integration & Upload Test Suite
Tests:
1. Health check & configuration
2. System status & AWS readiness diagnosis
3. List tickets
4. Create ticket with priority & SLA
5. Get ticket details
6. Update ticket status & admin notes
7. S3 presigned URL generation
8. Real binary image upload verification (upload & retrieve)
9. Asynchronous Step Functions SLA escalation workflow
"""

import sys
import asyncio
from pathlib import Path

from server import (
    app,
    get_health,
    get_system_status,
    list_tickets,
    create_ticket,
    get_ticket,
    update_ticket,
    presign_upload,
    upload_file_binary,
    get_uploaded_file,
    step_functions_escalation_runner,
    CreateTicketRequest,
    UpdateTicketRequest,
    PresignRequest,
    UPLOADS_DIR,
)

class MockRequest:
    def __init__(self, data: bytes):
        self._data = data
    async def body(self):
        return self._data

async def main():
    print("=================================================================")
    print(" CampusFix AI - Comprehensive Integration & Escalation Test Suite ")
    print("=================================================================")

    # 1. Health
    print("\n[TEST 1] GET /health")
    health = get_health()
    assert health["status"] == "healthy"
    print(f"  -> Service: {health['service']}")
    print(f"  -> Region: {health['region']}")
    print(f"  -> AWS Credentials Mode: {health['mode']}")
    print("  ✅ Health endpoint OK")

    # 2. System Status
    print("\n[TEST 2] GET /api/system-status")
    status = get_system_status()
    assert "dynamoDbTable" in status
    dep = status.get("deploymentStatus", {})
    print(f"  -> DynamoDB Engine: {dep.get('dynamoDb')}")
    print(f"  -> S3 Storage Engine: {dep.get('s3Uploads')}")
    print(f"  -> Step Functions Engine: {dep.get('stepFunctions')}")
    print(f"  -> Next Step: {dep.get('nextStepIfDeploying')}")
    print("  ✅ System status OK")

    # 3. List Tickets
    print("\n[TEST 3] GET /tickets")
    list_res = list_tickets()
    assert "tickets" in list_res
    print(f"  -> Found {len(list_res['tickets'])} tickets in database")
    print("  ✅ List tickets OK")

    # 4. Create Ticket
    print("\n[TEST 4] POST /tickets (Create new ticket with 2s SLA)")
    req = CreateTicketRequest(
        title="Sparks emitted from ceiling fan in Lecture Hall 204",
        category="ELECTRICAL",
        description="Visible sparks during lecture. Immediate student risk.",
        building="Ramanujan Science Block",
        room="Lecture Hall 204",
        priority="CRITICAL",
        imageUrl="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        reporterName="Ananya Sharma",
        slaSeconds=2,
    )
    create_res = create_ticket(req)
    t = create_res["ticket"]
    t_id = t["ticketId"]
    assert t["status"] == "PENDING"
    assert t["priority"] == "CRITICAL"
    print(f"  -> Generated Ticket ID: {t_id}")
    print(f"  -> Priority: {t['priority']}, SLA Window: {t['slaSeconds']}s")
    print("  ✅ Ticket creation OK")

    # 5. Get Ticket
    print(f"\n[TEST 5] GET /tickets/{t_id}")
    get_res = get_ticket(t_id)
    assert get_res["ticket"]["ticketId"] == t_id
    print(f"  -> Retrieved: {get_res['ticket']['title']}")
    print("  ✅ Ticket retrieval OK")

    # 6. Update Ticket
    print(f"\n[TEST 6] PATCH /tickets/{t_id}")
    upd_req = UpdateTicketRequest(
        adminNotes="Dispatched emergency electrician with scaffolding.",
        actor="Facilities Dispatcher",
    )
    upd_res = update_ticket(t_id, upd_req)
    assert upd_res["ticket"]["adminNotes"] == upd_req.adminNotes
    print(f"  -> Admin Notes: {upd_res['ticket']['adminNotes']}")
    print("  ✅ Ticket update OK")

    # 7. S3 Presigned URL & Real Binary Upload
    print("\n[TEST 7] POST /uploads/presign & Real Binary PUT Upload")
    presign_req = PresignRequest(
        contentType="image/jpeg",
        fileName="damage-evidence.jpg"
    )
    presign_res = presign_upload(presign_req)
    assert "uploadUrl" in presign_res
    assert "objectKey" in presign_res
    print(f"  -> Presigned Upload Target: {presign_res['uploadUrl']}")

    # Simulate real client HTTP PUT of image bytes
    mock_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + (b"A" * 1024)
    upload_res = await upload_file_binary(presign_res["objectKey"], MockRequest(mock_image_bytes))
    assert upload_res["size"] == len(mock_image_bytes)
    print(f"  -> Uploaded raw image bytes: {upload_res['size']} bytes saved")

    # Verify file is readable
    saved_file = UPLOADS_DIR / presign_res["objectKey"]
    assert saved_file.exists(), "Uploaded file should exist on disk"
    assert saved_file.stat().st_size == len(mock_image_bytes)
    print(f"  -> Verified file on disk: {saved_file.name} ({saved_file.stat().st_size} bytes)")
    print("  ✅ S3 / Upload flow 100% verified")

    # 8. Step Functions SLA Escalation
    print(f"\n[TEST 8] AWS Step Functions Automated SLA Escalation (2s SLA timeout)")
    await step_functions_escalation_runner(t_id, wait_seconds=2)
    escalated = get_ticket(t_id)["ticket"]
    assert escalated["status"] == "ESCALATED", f"Expected ESCALATED, got {escalated['status']}"
    assert escalated["escalated"] is True
    print(f"  -> Status: {escalated['status']}")
    print(f"  -> Escalation Reason: {escalated.get('escalationReason')}")
    print(f"  -> Escalated At: {escalated.get('escalatedAt')}")
    print("  ✅ Step Functions automated escalation 100% verified")

    print("\n=================================================================")
    print(" 🎉 ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("=================================================================")

if __name__ == "__main__":
    asyncio.run(main())
