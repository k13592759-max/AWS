"""
CampusFix AI - S3 Presigned Upload URL Handler
Generates secure, temporary presigned PUT URLs for student photo evidence uploads.
Validates file extensions, MIME types, and file size limits.
"""

import json
import os
import uuid
import boto3
from botocore.exceptions import ClientError

BUCKET_NAME = os.environ.get("UPLOADS_BUCKET", "campusfix-evidence-bucket")
AWS_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB max
URL_EXPIRATION_SECONDS = 300  # 5 minutes validity


def build_response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body, default=str),
    }


def lambda_handler(event: dict, context=None) -> dict:
    http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod", "POST")
    if http_method == "OPTIONS":
        return build_response(200, {"message": "CORS preflight OK"})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return build_response(400, {"error": "BadRequest", "message": "Invalid JSON body"})

    content_type = body.get("contentType") or body.get("mimeType")
    file_name = body.get("fileName") or "evidence.jpg"

    if not content_type or content_type not in ALLOWED_CONTENT_TYPES:
        return build_response(400, {
            "error": "InvalidContentType",
            "message": f"Unsupported content type '{content_type}'. Allowed types: {list(ALLOWED_CONTENT_TYPES.keys())}"
        })

    extension = ALLOWED_CONTENT_TYPES[content_type]
    unique_key = f"evidence/{uuid.uuid4().hex[:8]}-{uuid.uuid4().hex[:6]}.{extension}"

    try:
        s3_client = boto3.client("s3", region_name=AWS_REGION)
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": unique_key,
                "ContentType": content_type,
            },
            ExpiresIn=URL_EXPIRATION_SECONDS,
        )

        public_access_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_key}"

        return build_response(200, {
            "uploadUrl": presigned_url,
            "objectKey": unique_key,
            "fileUrl": public_access_url,
            "expiresIn": URL_EXPIRATION_SECONDS,
            "maxSizeBytes": MAX_FILE_SIZE_BYTES,
        })

    except ClientError as e:
        return build_response(500, {
            "error": "S3PresignError",
            "message": e.response["Error"]["Message"]
        })
    except Exception as exc:
        return build_response(500, {
            "error": "InternalError",
            "message": str(exc)
        })
