#!/bin/bash

echo "⏳ Inicializando recursos no LocalStack..."

# Criar bucket S3
awslocal s3 mb s3://techfinance-lastdance

# Verificar se a tabela já existe
if ! awslocal dynamodb describe-table --table-name products 2>/dev/null; then
  echo "⏳ Criando tabela DynamoDB..."
  awslocal dynamodb create-table \
    --table-name products \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
  echo "✅ Tabela criada com sucesso!"
else
  echo "✅ Tabela já existe!"
fi
