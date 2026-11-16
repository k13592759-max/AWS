"""
CampusFix AI - Step Functions Check Ticket Status Handler
Invoked by the Step Functions State Machine to check whether the ticket was resolved within the SLA window.
"""

import os
import boto3
from botocore.exceptions import ClientError

TABLE_NAME = os.environ.get("TICKETS_TABLE", "CampusFixTickets")
AWS_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event: dict, context=None) -> dict:
    """Checks the current status of the ticket in DynamoDB."""
    ticket_id = event.get("ticketId")
    if not ticket_id:
        raise ValueError("Missing 'ticketId' in Step Functions state payload")

    try:
        response = table.get_item(Key={"ticketId": ticket_id})
        item = response.get("Item")
        if not item:
            return {
                "ticketId": ticket_id,
                "status": "NOT_FOUND",
                "resolved": False
            }

        current_status = item.get("status", "PENDING")
        return {
            "ticketId": ticket_id,
            "status": current_status,
            "resolved": current_status == "RESOLVED",
            "priority": item.get("priority", "MEDIUM"),
            "category": item.get("category", "OTHER"),
            "building": item.get("building", ""),
        }

    except ClientError as e:
        raise RuntimeError(f"DynamoDB check failed for ticket {ticket_id}: {e.response['Error']['Message']}")
