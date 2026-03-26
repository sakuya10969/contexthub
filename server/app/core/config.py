from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_default_region: str = "ap-northeast-1"
    aws_s3_bucket: str = ""

    opensearch_url: str = "http://localhost:9200"
    opensearch_index: str = "rag-documents"

    bedrock_region: str = "us-east-1"
    bedrock_embed_model_id: str = "amazon.titan-embed-text-v2:0"
    bedrock_chat_model_id: str = "us.amazon.nova-micro-v1:0"


settings = Settings()
