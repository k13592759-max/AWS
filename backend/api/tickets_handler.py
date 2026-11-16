"""
CampusFix AI - Tickets API Lambda Handler
Handles:
- GET  /health
- GET  /tickets
- POST /tickets
- GET  /tickets/{ticketId}
- PATCH /tickets/{ticketId}

Integrates with Amazon DynamoDB and AWS Step Functions (for automated SLA escalation).
"""

import json
import os
import uuid
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError

# Configuration from Environment Variables
TABLE_NAME = os.environ.get("TICKETS_TABLE", "CampusFixTickets")
STATE_MACHINE_ARN = os.environ.get("STATE_MACHINE_ARN", "")
AWS_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
DEFAULT_SLA_SECONDS = int(os.environ.get("DEFAULT_SLA_SECONDS", "60"))

# Initialize AWS clients
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)
sfn_client = boto3.client("stepfunctions", region_name=AWS_REGION)

# Allowed Enum Values for Validation
VALID_CATEGORIES = {
    "ELECTRICAL", "PLUMBING", "WIFI_IT", "FURNITURE",
    "HVAC", "CLEANLINESS", "SAFETY_STRUCTURAL", "OTHER"
}
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
VALID_STATUSES = {"PENDING", "IN_PROGRESS", "RESOLVED", "ESCALATED"}


def build_response(status_code: int, body: dict) -> dict:
    """Build standardized HTTP API Gateway response with CORS headers."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        },
        "body": json.dumps(body, default=str),
    }


def generate_ticket_id() -> str:
    """Generate a clean, professional ticket ID."""
    prefix = "TKT"
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{unique_suffix}"


def lambda_handler(event: dict, context=None) -> dict:
    """Main routing entry point for API Gateway HTTP API."""
    try:
        http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "GET")
        raw_path = event.get("rawPath") or event.get("path") or ""

        # Preflight CORS support
        if http_method == "OPTIONS":
            return build_response(200, {"message": "CORS preflight OK"})

        # Route: GET /health
        if http_method == "GET" and (raw_path == "/health" or raw_path.endswith("/health")):
            return handle_health()

        # Route: POST /tickets
        if http_method == "POST" and (raw_path == "/tickets" or raw_path.endswith("/tickets")):
            return handle_create_ticket(event)

        # Route: GET /tickets (list)
        if http_method == "GET" and (raw_path == "/tickets" or raw_path.endswith("/tickets")):
            return handle_list_tickets(event)

        # Routes with {ticketId}: /tickets/{ticketId}
        path_parameters = event.get("pathParameters") or {}
        ticket_id = path_parameters.get("ticketId")

        # Fallback path extraction if not in pathParameters
        if not ticket_id and "/tickets/" in raw_path:
            ticket_id = raw_path.split("/tickets/")[1].split("/")[0]

        if ticket_id:
            if http_method == "GET":
                return handle_get_ticket(ticket_id)
            elif http_method == "PATCH":
                return handle_update_ticket(ticket_id, event)

        return build_response(404, {"error": "Not Found", "message": f"Resource {raw_path} not found"})

    except Exception as exc:
        return build_response(500, {
            "error": "InternalServerError",
            "message": str(exc),
        })


def handle_health() -> dict:
    """Health check endpoint providing deployment metadata."""
    return build_response(200, {
        "status": "healthy",
        "service": "CampusFix AI Serverless API",
        "region": AWS_REGION,
        "table": TABLE_NAME,
        "stateMachineConfigured": bool(STATE_MACHINE_ARN),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


def handle_create_ticket(event: dict) -> dict:
    """Create a new ticket in DynamoDB and kick off Step Functions escalation workflow."""
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return build_response(400, {"error": "BadRequest", "message": "Invalid JSON payload in request body"})

    # Validate required fields
    title = (body.get("title") or "").strip()
    category = (body.get("category") or "").upper().strip()
    description = (body.get("description") or "").strip()
    building = (body.get("building") or "").strip()
    room = (body.get("room") or "").strip()
    priority = (body.get("priority") or "MEDIUM").upper().strip()
    image_url = body.get("imageUrl") or ""
    reporter_name = (body.get("reporterName") or "Campus Student").strip()

    if not title:
        return build_response(400, {"error": "ValidationError", "message": "Field 'title' is required"})
    if not description:
        return build_response(400, {"error": "ValidationError", "message": "Field 'description' is required"})
    if not building:
        return build_response(400, {"error": "ValidationError", "message": "Field 'building' is required"})
    if not room:
        return build_response(400, {"error": "ValidationError", "message": "Field 'room' is required"})
    if category not in VALID_CATEGORIES:
        return build_response(400, {
            "error": "ValidationError",
            "message": f"Invalid category '{category}'. Must be one of: {sorted(VALID_CATEGORIES)}"
        })
    if priority not in VALID_PRIORITIES:
        return build_response(400, {
            "error": "ValidationError",
            "message": f"Invalid priority '{priority}'. Must be one of: {sorted(VALID_PRIORITIES)}"
        })

    ticket_id = generate_ticket_id()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Determine SLA based on priority (demonstration SLA in seconds)
    # Higher priorities get tighter SLA, default configurable
    sla_map = {
        "CRITICAL": 30,
        "HIGH": 45,
        "MEDIUM": DEFAULT_SLA_SECONDS,
        "LOW": 90,
    }
    sla_seconds = body.get("slaSeconds") or sla_map.get(priority, DEFAULT_SLA_SECONDS)

    initial_item = {
        "ticketId": ticket_id,
        "title": title,
        "category": category,
        "description": description,
        "building": building,
        "room": room,
        "priority": priority,
        "status": "PENDING",
        "imageUrl": image_url,
        "reporterName": reporter_name,
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "slaSeconds": sla_seconds,
        "escalated": False,
        "timeline": [
            {
                "status": "PENDING",
                "timestamp": now_iso,
                "actor": reporter_name,
                "note": "Issue submitted via CampusFix portal and logged into DynamoDB."
            }
        ]
    }

    # Put item in DynamoDB
    try:
        table.put_item(Item=initial_item)
    except ClientError as e:
        return build_response(500, {
            "error": "DynamoDBError",
            "message": f"Failed to persist ticket: {e.response['Error']['Message']}"
        })

    # Start AWS Step Functions SLA Escalation Execution if configured
    step_execution_arn = None
    if STATE_MACHINE_ARN:
        try:
            exec_name = f"{ticket_id}-{uuid.uuid4().hex[:6]}"
            sfn_input = {
                "ticketId": ticket_id,
                "slaSeconds": sla_seconds,
                "createdAt": now_iso,
                "priority": priority,
                "category": category,
                "building": building,
            }
            exec_response = sfn_client.start_execution(
                stateMachineArn=STATE_MACHINE_ARN,
                name=exec_name,
                input=json.dumps(sfn_input)
            )
            step_execution_arn = exec_response.get("executionArn")

            # Update ticket record with the Step Functions execution ARN
            table.update_item(
                Key={"ticketId": ticket_id},
                UpdateExpression="SET stepFunctionsExecutionArn = :arn",
                ExpressionAttributeValues={":arn": step_execution_arn}
            )
            initial_item["stepFunctionsExecutionArn"] = step_execution_arn

        except ClientError as e:
            # We don't fail ticket creation if SFN start fails, but record error in timeline
            initial_item["timeline"].append({
                "status": "SFN_WARNING",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actor": "System",
                "note": f"Step Functions escalation trigger notice: {e.response['Error']['Message']}"
            })

    return build_response(201, {
        "message": "Ticket created successfully",
        "ticket": initial_item
    })


def handle_list_tickets(event: dict) -> dict:
    """List all tickets with optional filtering by status, category, or building."""
    query_params = event.get("queryStringParameters") or {}
    status_filter = query_params.get("status")
    category_filter = query_params.get("category")
    building_filter = query_params.get("building")

    try:
        # Full scan with filter expressions for flexibility
        response = table.scan()
        items = response.get("Items", [])

        # Continue scan if paginated
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        # Filter in memory
        filtered = items
        if status_filter:
            filtered = [t for t in filtered if t.get("status") == status_filter.upper()]
        if category_filter:
            filtered = [t for t in filtered if t.get("category") == category_filter.upper()]
        if building_filter:
            filtered = [t for t in filtered if building_filter.lower() in (t.get("building") or "").lower()]

        # Sort by createdAt descending
        filtered.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

        return build_response(200, {
            "total": len(filtered),
            "tickets": filtered
        })

    except ClientError as e:
        return build_response(500, {
            "error": "DynamoDBScanError",
            "message": e.response["Error"]["Message"]
        })


def handle_get_ticket(ticket_id: str) -> dict:
    """Retrieve details of a single ticket by ticketId."""
    try:
        response = table.get_item(Key={"ticketId": ticket_id})
        item = response.get("Item")
        if not item:
            return build_response(404, {
                "error": "NotFound",
                "message": f"Ticket with ID '{ticket_id}' not found"
            })
        return build_response(200, {"ticket": item})
    except ClientError as e:
        return build_response(500, {
            "error": "DynamoDBGetError",
            "message": e.response["Error"]["Message"]
        })


def handle_update_ticket(ticket_id: str, event: dict) -> dict:
    """Update ticket status, admin notes, priority, or resolution note."""
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return build_response(400, {"error": "BadRequest", "message": "Invalid JSON body"})

    new_status = body.get("status")
    new_priority = body.get("priority")
    admin_notes = body.get("adminNotes")
    actor = body.get("actor") or "Facilities Administrator"
    timeline_note = body.get("note")

    # Fetch existing item first
    try:
        get_res = table.get_item(Key={"ticketId": ticket_id})
        item = get_res.get("Item")
        if not item:
            return build_response(404, {"error": "NotFound", "message": f"Ticket '{ticket_id}' not found"})
    except ClientError as e:
        return build_response(500, {"error": "DynamoDBError", "message": e.response["Error"]["Message"]})

    now_iso = datetime.now(timezone.utc).isoformat()
    timeline = item.get("timeline", [])

    update_expr_parts = ["#updatedAt = :now"]
    expr_names = {"#updatedAt": "updatedAt"}
    expr_vals = {":now": now_iso}

    if new_status:
        new_status = new_status.upper().strip()
        if new_status not in VALID_STATUSES:
            return build_response(400, {
                "error": "ValidationError",
                "message": f"Invalid status '{new_status}'. Must be one of: {sorted(VALID_STATUSES)}"
            })
        update_expr_parts.append("#status = :st")
        expr_names["#status"] = "status"
        expr_vals[":st"] = new_status

        note_text = timeline_note or f"Status changed from {item.get('status')} to {new_status}"
        timeline.append({
            "status": new_status,
            "timestamp": now_iso,
            "actor": actor,
            "note": note_text
        })

        if new_status == "RESOLVED":
            update_expr_parts.append("resolvedAt = :resTime")
            expr_vals[":resTime"] = now_iso

    if new_priority:
        new_priority = new_priority.upper().strip()
        if new_priority in VALID_PRIORITIES:
            update_expr_parts.append("#priority = :prio")
            expr_names["#priority"] = "priority"
            expr_vals[":prio"] = new_priority

    if admin_notes is not None:
        update_expr_parts.append("adminNotes = :notes")
        expr_vals[":notes"] = admin_notes

    update_expr_parts.append("timeline = :tl")
    expr_vals[":tl"] = timeline

    update_expression = "SET " + ", ".join(update_expr_parts)

    try:
        update_res = table.update_item(
            Key={"ticketId": ticket_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expr_names if expr_names else None,
            ExpressionAttributeValues=expr_vals,
            ReturnValues="ALL_NEW"
        )
        return build_response(200, {
            "message": "Ticket updated successfully",
            "ticket": update_res.get("Attributes")
        })
    except ClientError as e:
        return build_response(500, {
            "error": "DynamoDBUpdateError",
            "message": e.response["Error"]["Message"]
        })
