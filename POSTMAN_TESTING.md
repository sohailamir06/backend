# MediStock API Postman Testing Guide

## 1. Start The Server

Create `server/.env` from `server/.env.sample`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/medistock
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Make sure MongoDB is running, then start the API:

```bash
cd server
npm run dev
```

Base URL:

```text
http://localhost:5000
```

## 2. Health Check

Request:

```http
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "environment": "development",
  "timestamp": "2026-07-09T00:00:00.000Z"
}
```

## 3. Register Company

Request:

```http
POST http://localhost:5000/api/auth/register-company
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "companyName": "MediStock Pharmacy",
  "industry": "Healthcare",
  "country": "United States",
  "firstName": "John",
  "lastName": "Admin",
  "email": "admin@medistock.com",
  "phoneNumber": "+1 555 123 4567",
  "password": "Admin@12345",
  "confirmPassword": "Admin@12345",
  "termsAccepted": true,
  "newsletterSubscribed": false
}
```

Expected response:

```json
{
  "status": "success",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "USER_ID",
      "companyId": "CMP-20260709-A1B2C3",
      "firstName": "John",
      "lastName": "Admin",
      "email": "admin@medistock.com",
      "phoneNumber": "+1 555 123 4567",
      "role": "company_admin",
      "newsletterSubscribed": false,
      "isActive": true
    },
    "company": {
      "id": "COMPANY_OBJECT_ID",
      "companyId": "CMP-20260709-A1B2C3",
      "companyName": "MediStock Pharmacy",
      "industry": "Healthcare",
      "country": "United States",
      "status": "active"
    }
  }
}
```

Copy `data.token`. You will use it for protected routes.

Registration also seeds the new company with the same starter data currently used by the frontend:

- 8 medicines
- 8 categories
- 3 storage locations
- 2 prescriptions
- recent activity entries

## 4. Login

Request:

```http
POST http://localhost:5000/api/auth/login
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@medistock.com",
  "password": "Admin@12345"
}
```

Expected response:

```json
{
  "status": "success",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "user": {
      "companyId": "CMP-20260709-A1B2C3",
      "email": "admin@medistock.com",
      "role": "company_admin"
    },
    "company": {
      "companyId": "CMP-20260709-A1B2C3",
      "companyName": "MediStock Pharmacy"
    }
  }
}
```

## 5. Get Current User

Request:

```http
GET http://localhost:5000/api/auth/me
```

Postman Authorization tab:

```text
Type: Bearer Token
Token: paste_the_token_here
```

Or add this header manually:

```text
Authorization: Bearer paste_the_token_here
```

Expected response:

```json
{
  "status": "success",
  "data": {
    "user": {
      "companyId": "CMP-20260709-A1B2C3",
      "email": "admin@medistock.com",
      "role": "company_admin"
    },
    "company": {
      "companyId": "CMP-20260709-A1B2C3",
      "companyName": "MediStock Pharmacy"
    }
  }
}
```

## 6. Negative Tests

### Duplicate Email

Send the same registration request again.

Expected status:

```text
409 Conflict
```

### Terms Not Accepted

Use:

```json
{
  "termsAccepted": false
}
```

Expected status:

```text
400 Bad Request
```

### Password Mismatch

Use:

```json
{
  "password": "Admin@12345",
  "confirmPassword": "Wrong@12345"
}
```

Expected status:

```text
400 Bad Request
```

### Invalid Login

Request:

```http
POST http://localhost:5000/api/auth/login
```

Body:

```json
{
  "email": "admin@medistock.com",
  "password": "WrongPassword"
}
```

Expected status:

```text
401 Unauthorized
```

### Missing Token

Request:

```http
GET http://localhost:5000/api/auth/me
```

Do not send the Authorization header.

Expected status:

```text
401 Unauthorized
```

## 7. Postman Environment Variables

Recommended variables:

```text
baseUrl = http://localhost:5000
token = paste_token_after_login
```

Then use:

```text
{{baseUrl}}/api/health
{{baseUrl}}/api/auth/register-company
{{baseUrl}}/api/auth/login
{{baseUrl}}/api/auth/me
```

For protected routes, set Authorization to:

```text
Bearer {{token}}
```

## 8. Feature API Endpoints

All endpoints below require:

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

### Full App State

Use this to get the backend equivalent of the frontend localStorage state:

```http
GET {{baseUrl}}/api/state
```

Returns:

```json
{
  "status": "success",
  "data": {
    "company": {},
    "medicines": [],
    "categories": [],
    "storageLocations": [],
    "prescriptions": [],
    "settings": {},
    "activities": []
  }
}
```

### Medicines

List medicines:

```http
GET {{baseUrl}}/api/medicines
```

Optional query params:

```text
search=amoxicillin
category=Antibiotics
status=low-stock
sortBy=name
order=asc
page=1
limit=50
```

Create medicine:

```http
POST {{baseUrl}}/api/medicines
```

```json
{
  "name": "Amoxicillin 500mg",
  "category": "Antibiotics",
  "manufacturer": "Pfizer",
  "quantity": 150,
  "unit": "capsules",
  "minThreshold": 50,
  "expiryDate": "2027-08-15",
  "batchNumber": "AMX2026001",
  "price": 0.75,
  "location": "Shelf A-1",
  "description": "Broad-spectrum antibiotic",
  "prescriptionRequired": true
}
```

Update medicine:

```http
PUT {{baseUrl}}/api/medicines/:id
```

Delete medicine:

```http
DELETE {{baseUrl}}/api/medicines/:id
```

Generate or ensure barcode:

```http
PATCH {{baseUrl}}/api/medicines/:id/barcode
```

Scan barcode:

```http
GET {{baseUrl}}/api/barcodes/MED-001-6001
```

Import medicines:

```http
POST {{baseUrl}}/api/medicines/import
```

```json
{
  "medicines": [
    {
      "name": "Paracetamol 500mg",
      "category": "Pain Relief",
      "manufacturer": "GSK",
      "quantity": 300,
      "unit": "tablets",
      "minThreshold": 100,
      "expiryDate": "2027-12-01",
      "batchNumber": "PAR2026007",
      "price": 0.05,
      "location": "Shelf B-1"
    }
  ]
}
```

Bulk delete or threshold adjustment:

```http
POST {{baseUrl}}/api/medicines/bulk
```

```json
{
  "action": "low-stock",
  "ids": ["med-id-1", "med-id-2"],
  "amount": 10
}
```

Export CSV:

```http
GET {{baseUrl}}/api/medicines/export
```

### Categories

```http
GET {{baseUrl}}/api/categories
POST {{baseUrl}}/api/categories
PUT {{baseUrl}}/api/categories/:id
DELETE {{baseUrl}}/api/categories/:id
```

Create body:

```json
{
  "name": "Antibiotics",
  "description": "Bacterial infection treatments",
  "color": "bg-red-100 text-red-800",
  "requiresPrescription": true
}
```

### Storage Locations

```http
GET {{baseUrl}}/api/storage-locations
POST {{baseUrl}}/api/storage-locations
PUT {{baseUrl}}/api/storage-locations/:id
DELETE {{baseUrl}}/api/storage-locations/:id
```

Create body:

```json
{
  "name": "Main Pharmacy Section A",
  "description": "Primary prescription storage",
  "section": "A",
  "shelf": "A1-A5",
  "temperature": "15-25C",
  "humidity": "45-65%",
  "capacity": 1000,
  "currentOccupancy": 750,
  "isActive": true
}
```

### Prescriptions

```http
GET {{baseUrl}}/api/prescriptions
POST {{baseUrl}}/api/prescriptions
GET {{baseUrl}}/api/prescriptions/:id
PUT {{baseUrl}}/api/prescriptions/:id
POST {{baseUrl}}/api/prescriptions/:id/fill
DELETE {{baseUrl}}/api/prescriptions/:id
```

Create body:

```json
{
  "patientName": "John Smith",
  "patientId": "P001",
  "doctorName": "Dr. Sarah Johnson",
  "medicines": [
    {
      "name": "Amoxicillin 500mg",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "quantity": 21
    }
  ],
  "notes": "Take after food"
}
```

Filling a prescription deducts matching medicine stock by exact medicine name, case-insensitive. If stock is insufficient, the response includes `shortages` and inventory is not changed.

### Settings

```http
GET {{baseUrl}}/api/settings
PUT {{baseUrl}}/api/settings
```

Update body:

```json
{
  "general": {
    "facilityName": "City Medical Center",
    "contactEmail": "admin@citymedical.com",
    "phoneNumber": "+1 555 123 4567",
    "address": "123 Medical Drive"
  },
  "inventory": {
    "defaultLowStockThreshold": 25,
    "expiryWarningDays": 30,
    "autoReorderEnabled": false,
    "barcodeEnabled": true
  },
  "notifications": {
    "emailAlerts": true,
    "smsAlerts": false,
    "pushNotifications": true,
    "dailyReports": true
  },
  "appearance": {
    "theme": "system",
    "language": "en",
    "dateFormat": "MM/DD/YYYY",
    "currency": "USD"
  }
}
```

### Activities

```http
GET {{baseUrl}}/api/activities
POST {{baseUrl}}/api/activities
```

Create body:

```json
{
  "action": "Manual note added",
  "medicine": "System"
}
```

### Dashboard, Alerts, Reports

```http
GET {{baseUrl}}/api/dashboard
GET {{baseUrl}}/api/alerts
GET {{baseUrl}}/api/reports?type=inventory
```

Reports support:

```text
type=inventory
type=expiry
type=usage
type=financial
type=alerts
categories=Antibiotics,Pain Relief
from=2026-07-01
to=2026-07-31
```
