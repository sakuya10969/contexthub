import json
import boto3
from app.core.config import settings


class BedrockClient:
    def __init__(self) -> None:
        self._runtime = boto3.client(
            "bedrock-runtime",
            region_name=settings.bedrock_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

    def embed(self, text: str) -> list[float]:
        body = json.dumps(
            {
                "inputText": text,
                "dimensions": 1024,
                "normalize": True,
            }
        )
        response = self._runtime.invoke_model(
            modelId=settings.bedrock_embed_model_id,
            body=body,
            contentType="application/json",
            accept="application/json",
        )
        result = json.loads(response["body"].read())
        return result["embedding"]

    def chat(self, prompt: str, max_tokens: int = 2048) -> str:
        response = self._runtime.converse(
            modelId=settings.bedrock_chat_model_id,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": max_tokens},
        )
        return response["output"]["message"]["content"][0]["text"]


bedrock_client = BedrockClient()
