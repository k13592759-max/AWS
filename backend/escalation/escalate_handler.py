"""
CampusFix AI - Step Functions Escalation Handler
Invoked by the Step Functions State Machine when the SLA window expires and ticket is unresolved.
Updates ticket status to ESCALATED, records timestamp and reason, and appends timeline log.
"""

import os
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError

TABLE_NAME = os.environ.get("TICKETS_TABLE", "CampusFixTickets")
AWS_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event: dict, context=None) -> dict:
    ticket_id = event.get("ticketId")
    if not ticket_id:
        raise ValueError("Missing 'ticketId' in Step Functions event")

    sla_seconds = event.get("slaSeconds", 60)
    now_iso = datetime.now(timezone.utc).isoformat()
    escalation_reason = f"Automated SLA breach: Unresolved after {sla_seconds}s operational window."

    try:
        # Fetch current ticket to verify and grab timeline
        get_res = table.get_item(Key={"ticketId": ticket_id})
        item = get_res.get("Item")
        if not item:
            return {"error": "NotFound", "ticketId": ticket_id}

        # If already resolved in race condition, do not overwrite
        if item.get("status") == "RESOLVED":
            return {
                "ticketId": ticket_id,
                "status": "RESOLVED",
                "escalated": False,
                "note": "Ticket was marked resolved just before escalation execution."
            }

        timeline = item.get("timeline", [])
        timeline.append({
            "status": "ESCALATED",
            "timestamp": now_iso,
            "actor": "AWS Step Functions Auto-Escalator",
            "note": escalation_reason
        })

        update_res = table.update_item(
            Key={"ticketId": ticket_id},
            UpdateExpression=(
                "SET #st = :st, escalated = :esc, escalatedAt = :escTime, "
                "escalationReason = :reason, timeline = :tl, #updatedAt = :now"
            ),
            ExpressionAttributeNames={
                "#st": "status",
                "#updatedAt": "updatedAt"
            },
            ExpressionAttributeValues={
                ":st": "ESCALATED",
                ":esc": True,
                ":escTime": now_iso,
                ":reason": escalation_reason,
                ":tl": timeline,
                ":now": now_iso
            },
            ReturnValues="ALL_NEW"
        )

        updated_attributes = update_res.get("Attributes", {})
        return {
            "ticketId": ticket_id,
            "status": "ESCALATED",
            "escalatedAt": now_iso,
            "escalationReason": escalation_reason,
            "updatedAttributes": updated_attributes
        }

    except ClientError as e:
        raise RuntimeError(f"DynamoDB escalation update failed for ticket {ticket_id}: {e.response['Error']['Message']}")
