# Premium Salon OS Backend – V2

Multi-tenant Node.js/Express + PostgreSQL/Prisma backend.

## Included in V2

- Existing V1 authentication: login, refresh-token rotation, logout, current user and change password.
- Super Admin company create/list/read/update/status APIs.
- Super Admin and Company Admin salon create/list/read/update/status APIs with tenant scoping.
- Company Admin provisioning (Super Admin only).
- Salon Owner, Manager and Staff provisioning.
- User listing, profile updates and activation/deactivation within permitted tenant scope.
- Database-derived tenant authorization and active company/salon checks.
- Updated Swagger documentation and Postman collection.

## Requirements

- Node.js 20+
- PostgreSQL
- Existing V1 `.env` configuration

## Upgrade your V1 project

1. Make a backup of your V1 folder and database.
2. Extract this V2 package into a new folder (or replace the V1 source after backing it up).
3. Keep your existing `.env` values. Do not overwrite the real `.env` with `.env.example`.
4. Install and generate Prisma client:

```bash
npm install
npx prisma generate
npm run db:seed
```

V2 reuses the existing Company, Salon and User Prisma models from V1. No schema migration is required by this V2 release. If you have locally modified your V1 Prisma schema, compare it before replacing anything.

5. Start the API:

```bash
node index.js
```

6. Verify:
- `GET http://localhost:3000/health`
- Swagger: `http://localhost:3000/api-docs`

Do not run `npm run admin:create` again if your Super Admin already exists.

## Environment

Required values are documented in `.env.example`. Important:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET` (at least 32 characters)
- `JWT_ACCESS_EXPIRES_IN`
- `REFRESH_TOKEN_DAYS`
- `BCRYPT_ROUNDS`
- `CORS_ORIGINS`

## Recommended Postman sequence

Import `docs/Premium_Salon_OS_V2.postman_collection.json`.

1. Set collection `email` and `password` to your existing Super Admin credentials.
2. Run Authentication → Login. The collection stores access and refresh tokens.
3. Create company. The returned ID is stored in `companyId`.
4. Create salon. The returned ID is stored in `salonId`.
5. Create Company Admin, Salon Owner, Manager and Staff accounts.
6. Log in separately as Company Admin and Salon Owner to test their scoped routes. For the manual isolation folder, replace the role-specific token placeholders with the access tokens returned by those logins.

The sample collection includes a deactivation request. Do not run it until you have finished testing that company/salon because deactivation blocks login for affected tenant users.

## Tenant security rules

- Super Admin is global.
- Company Admin is scoped to the `companyId` stored on their database user.
- Salon Owner, Manager and Staff are scoped to their database `companyId` and `salonId`.
- User provisioning derives scope from the authenticated account and validates salon-company ownership.
- User profile update does not permit role, companyId, salonId, passwordHash or isActive changes.
- User status changes revoke active refresh tokens.
- Deactivating a company or salon blocks subsequent authentication for affected users.

Never use client-supplied tenant IDs as authorization. Every new tenant module must keep its Prisma query scoped to the authenticated user's permitted tenant.

## Tests and verification

Run:
```bash
npm test
```

The included automated test suite covers the V1 security helpers. Perform the V2 API and cross-tenant checks using the Postman collection and checklist in `docs/DEVELOPMENT_CHECKLIST.md`. A live PostgreSQL integration run is required in your environment before production deployment.

## V2 scope exclusions

No delete APIs, subscriptions, billing, CRM, appointments, WhatsApp, attendance, reports, custom tenant role editor, email invitations or password reset delivery are included yet.
