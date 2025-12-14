@echo off
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d @register.json
