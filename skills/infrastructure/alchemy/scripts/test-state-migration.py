#!/usr/bin/env python3
"""uv run --with 'moto[server]==5.1.18' python scripts/test-state-migration.py"""
import os
import subprocess
import tempfile
from pathlib import Path

import boto3
from moto.server import ThreadedMotoServer

if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    server = ThreadedMotoServer(ip_address="127.0.0.1", port=0, verbose=False)
    server.start()
    try:
        host, port = server.get_host_and_port()
        endpoint = f"http://{host}:{port}"
        options = dict(endpoint_url=endpoint, region_name="us-east-1",
                       aws_access_key_id="fixture", aws_secret_access_key="fixture")
        s3 = boto3.client("s3", **options)
        for name in ["legacy-fixture", "overflow-fixture"]:
            s3.create_bucket(Bucket=name)
            s3.put_bucket_encryption(Bucket=name, ServerSideEncryptionConfiguration={
                "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]})
            s3.put_public_access_block(Bucket=name, PublicAccessBlockConfiguration={
                k: True for k in ["BlockPublicAcls","IgnorePublicAcls","BlockPublicPolicy","RestrictPublicBuckets"]})
            s3.put_bucket_ownership_controls(Bucket=name, OwnershipControls={
                "Rules": [{"ObjectOwnership": "BucketOwnerEnforced"}]})
        boto3.client("dynamodb", **options).create_table(TableName="state-fixture",
            KeySchema=[{"AttributeName":"PK","KeyType":"HASH"},{"AttributeName":"SK","KeyType":"RANGE"}],
            AttributeDefinitions=[{"AttributeName":k,"AttributeType":"S"} for k in ["PK","SK"]],
            BillingMode="PAY_PER_REQUEST")
        with tempfile.TemporaryDirectory() as profile:
            subprocess.run(["bun", root/"assets/examples/aws-state/rehearse.mjs", endpoint], check=True,
                           env={"PATH":os.environ["PATH"], "USER":"fixture", "ALCHEMY_HOME":profile})
    finally:
        server.stop()
