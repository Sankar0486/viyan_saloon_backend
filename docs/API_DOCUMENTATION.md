# Premium Salon OS – Backend API Documentation (V2)

## 1. Base URLs

- Local API: `http://localhost:3000/api/v1`
- Health: `GET http://localhost:3000/health`
- Swagger: `http://localhost:3000/api-docs`

All request and response bodies use JSON. Protected endpoints require:
`Authorization: Bearer ACCESS_TOKEN`

## 2. Standard response format

Success:
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {},
  "meta": null
}
```

Paginated success:
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Error:
```json
{
  "success": false,
  "message": "A salon with this code already exists in the company",
  "error": { "code": "SALON_CODE_EXISTS", "details": null }
}
```

## 3. Roles and account scope

- `SUPER_ADMIN`: no company or salon assignment; manages all companies and salons.
- `COMPANY_ADMIN`: must have `companyId`; must not have `salonId`.
- `SALON_OWNER`, `SALON_MANAGER`, `SALON_STAFF`: must have both `companyId` and `salonId`; the salon must belong to that company.

The API derives tenant scope from the authenticated user's database record. `companyId` and `salonId` in request bodies are never accepted as proof of authorization.

## 4. Role access matrix

| Capability | Super Admin | Company Admin | Salon Owner | Manager | Staff |
|---|---:|---:|---:|---:|---:|
| Create/list/manage companies | Yes | No | No | No | No |
| Create salons | Any company | Own company | No | No | No |
| List/view salons | All | Own company | Own salon | Own salon | Own salon |
| Update/deactivate salons | Any | Own company | No | No | No |
| Create Company Admin | Yes | No | No | No | No |
| Create Salon Owner | Yes | Own company | No | No | No |
| Create Manager/Staff | Yes | Own company | Own salon | No | No |
| List/view users | All | Own company | Own salon | Own salon | No |
| Update user profile/status | All except protected restrictions | Own company | Own salon | No | No |

## 5. Authentication APIs (V1 – preserved)

### POST `/auth/login`
Request:
```json
{ "email": "admin@yourdomain.com", "password": "YourStrongPassword!" }
```
Returns user, accessToken and refreshToken.

### POST `/auth/refresh`
Request:
```json
{ "refreshToken": "CURRENT_REFRESH_TOKEN" }
```
Returns a new access token and rotated refresh token. Do not reuse the previous refresh token.

### POST `/auth/logout`
Requires Bearer token.
```json
{ "refreshToken": "CURRENT_REFRESH_TOKEN" }
```

### GET `/auth/me`
Requires Bearer token. Returns the current user's public profile.

### POST `/auth/change-password`
Requires Bearer token.
```json
{ "currentPassword": "CurrentPassword!", "newPassword": "NewStrongPassword123!" }
```

## 6. Company management (Super Admin only)

### POST `/companies`
Create a company.

Request:
```json
{
  "name": "Viyan Salon Group",
  "code": "VIYAN-GROUP",
  "email": "admin@viyansalon.com",
  "phone": "+919876543210"
}
```
`name` and `code` are required. Code is normalized to uppercase and must be unique.

Success: `201 Created`, returns company details and counts.

Errors:
- `400 VALIDATION_ERROR`: invalid fields.
- `401 AUTH_TOKEN_REQUIRED` / `AUTH_TOKEN_INVALID`: missing or invalid token.
- `403 FORBIDDEN`: caller is not Super Admin.
- `409 COMPANY_CODE_EXISTS`: company code already exists.

### GET `/companies`
List companies. Optional query parameters: `page`, `limit` (max 100), `search`, `isActive=true|false`.

Example:
`GET /companies?page=1&limit=20&search=viyan&isActive=true`

### GET `/companies/:companyId`
Get one company by UUID.

### PATCH `/companies/:companyId`
Update only supplied fields:
```json
{ "name": "Viyan Salon Group India", "phone": "+919876543210" }
```
At least one field is required. Company code must remain unique.

### PATCH `/companies/:companyId/status`
Activate/deactivate:
```json
{ "isActive": false }
```
Deactivating a company blocks authentication for its Company Admins and all salon users under that company. Existing data is retained. A Super Admin can reactivate it.

## 7. Salon management

### POST `/salons`
Roles: Super Admin, Company Admin.

Super Admin request (companyId required):
```json
{
  "companyId": "COMPANY_UUID",
  "name": "Viyan Peelamedu",
  "code": "PEELAMEDU",
  "email": "peelamedu@viyansalon.com",
  "phone": "+919876543210",
  "address": "Peelamedu, Coimbatore",
  "timezone": "Asia/Kolkata"
}
```

Company Admin request (companyId is derived from their account; do not send it):
```json
{
  "name": "Viyan RS Puram",
  "code": "RSPURAM",
  "email": "rspuram@viyansalon.com",
  "phone": "+919876543211",
  "address": "RS Puram, Coimbatore",
  "timezone": "Asia/Kolkata"
}
```

Errors include `400 COMPANY_ID_REQUIRED`, `403 TENANT_ACCESS_DENIED`, `404 COMPANY_NOT_FOUND`, `409 COMPANY_INACTIVE`, and `409 SALON_CODE_EXISTS`.

### GET `/salons`
Returns only salons in the caller's permitted scope:
- Super Admin: all salons; may filter by `companyId`.
- Company Admin: salons under their own company. A supplied companyId cannot expand this scope.
- Salon Owner/Manager/Staff: their assigned salon only.

Supports `page`, `limit`, `search`, `isActive`, and (Super Admin only) `companyId`.

### GET `/salons/:salonId`
Returns salon details only if it is within the caller's scope. Out-of-scope IDs return `404 SALON_NOT_FOUND`.

### PATCH `/salons/:salonId`
Roles: Super Admin or owning Company Admin.
Allowed fields: `name`, `code`, `email`, `phone`, `address`, `timezone`.
Company ownership cannot be changed through this endpoint.

### PATCH `/salons/:salonId/status`
Roles: Super Admin or owning Company Admin.
```json
{ "isActive": false }
```
Deactivating a salon blocks login for users assigned to that salon. The salon and its data are retained.

## 8. User management

All created passwords must contain at least 12 characters, including lowercase, uppercase, number, and special character. Passwords are bcrypt-hashed. Email addresses are unique.

### POST `/users/company-admins`
Super Admin only. Creates a Company Admin assigned to a company.

```json
{
  "companyId": "COMPANY_UUID",
  "name": "Company Administrator",
  "email": "company.admin@viyansalon.com",
  "phone": "+919876543210",
  "password": "StrongPassword123!"
}
```
The new Company Admin has `companyId` and `salonId: null`.

### POST `/users/salon-owners`
Super Admin or Company Admin.

```json
{
  "salonId": "SALON_UUID",
  "name": "Salon Owner",
  "email": "owner@viyansalon.com",
  "phone": "+919876543212",
  "password": "StrongPassword123!"
}
```
Super Admin may optionally include `companyId`; when supplied it must match the salon's actual company. Company Admin's company scope is always derived from their account.

### POST `/users/managers`
Super Admin, Company Admin, or Salon Owner.

```json
{
  "salonId": "SALON_UUID",
  "name": "Salon Manager",
  "email": "manager@viyansalon.com",
  "phone": "+919876543213",
  "password": "StrongPassword123!"
}
```

### POST `/users/staff`
Super Admin, Company Admin, or Salon Owner. Same request shape as manager.

For Company Admin, the salon must belong to their company. For Salon Owner, `salonId` must equal their own assigned salon. The API assigns the role based on the endpoint; clients cannot submit a `role` field.

### GET `/users`
Roles: Super Admin, Company Admin, Salon Owner, Salon Manager.
Optional query: `page`, `limit`, `search`, `role`, `isActive`.
The results are scoped to all users, the caller's company, or the caller's salon according to role.

### GET `/users/:userId`
Returns a user only if the user is in the caller's permitted scope. Out-of-scope users return `404 USER_NOT_FOUND`.

### PATCH `/users/:userId`
Roles: Super Admin, Company Admin, Salon Owner.
Allowed fields: `name`, `email`, `phone`. Role, companyId, salonId, passwordHash and isActive cannot be changed here.

```json
{ "name": "Updated Staff Name", "phone": "+919876543214" }
```

### PATCH `/users/:userId/status`
Roles: Super Admin, Company Admin, Salon Owner.
```json
{ "isActive": false }
```
Deactivation revokes that user's active refresh tokens. A user cannot deactivate their own account through this endpoint.

## 9. Tenant isolation and security behavior

- Company Admin list/get/update operations are filtered by their authenticated `companyId`.
- Salon Owner/Manager/Staff salon access is filtered by their authenticated `salonId`.
- User list/get/update/status operations are scoped in the database query, not only by route middleware.
- A Salon must belong to the selected Company before a salon-level user can be created.
- Company Admin cannot create users in another company's salon.
- Salon Owner cannot create users in another salon.
- The API does not provide public registration or role editing.
- Company and salon deactivation block subsequent login/authenticated requests for affected tenant users.
- Cross-tenant user/salon lookups return 404 to avoid confirming the existence of another tenant's records.

## 10. Common error codes

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, query, or path parameter |
| 400 | `COMPANY_ID_REQUIRED` | Super Admin salon creation requires companyId |
| 400 | `COMPANY_SALON_MISMATCH` | Provided company does not own the salon |
| 401 | `AUTH_TOKEN_REQUIRED` | Bearer token missing |
| 401 | `AUTH_TOKEN_INVALID` | Access token invalid or expired |
| 403 | `FORBIDDEN` | Role cannot perform this operation |
| 403 | `TENANT_ACCESS_DENIED` | Tenant scope violation |
| 404 | `COMPANY_NOT_FOUND` | Company does not exist |
| 404 | `SALON_NOT_FOUND` | Salon does not exist in permitted scope |
| 404 | `USER_NOT_FOUND` | User does not exist in permitted scope |
| 409 | `COMPANY_CODE_EXISTS` | Duplicate company code |
| 409 | `SALON_CODE_EXISTS` | Duplicate salon code in the company |
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 409 | `COMPANY_INACTIVE` | Company is inactive |
| 409 | `TENANT_INACTIVE` | Company or salon is inactive |

## 11. Setup and upgrade from V1

V1 already contains the `Company`, `Salon`, and `User` Prisma models and the required relations. V2 reuses them and adds API/service/validation layers, so this V2 package does not introduce a Prisma schema migration.

From the project directory:
```bash
npm install
npx prisma generate
npm run db:seed
node index.js
```

Keep your existing `.env` and database. Do not run `admin:create` again if your Super Admin already exists.

## 12. V2 scope and deferred work

Included: company CRUD/status, salon CRUD/status, Company Admin/Salon Owner/Manager/Staff provisioning, scoped user listing/profile/status, tenant access enforcement.

Not included yet: deleting companies/salons/users, password reset delivery, invitations/email verification, granular per-company custom roles, subscriptions, billing, CRM, appointments, WhatsApp, attendance and reports.
