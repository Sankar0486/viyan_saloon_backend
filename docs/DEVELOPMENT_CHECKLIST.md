# V2 Development and Postman Verification Checklist

## Before starting

- [ ] Back up V1 source and PostgreSQL database.
- [ ] Keep existing `.env`.
- [ ] Run `npm install`.
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run db:seed`.
- [ ] Run `npm test`.
- [ ] Start with `node index.js`.
- [ ] Confirm `/health` and `/api-docs`.

## Super Admin workflow

- [ ] Login as existing Super Admin.
- [ ] Create a company with a unique code.
- [ ] List companies and verify the created company.
- [ ] Update company details.
- [ ] Create a salon under that company.
- [ ] List salons and verify company relationship.
- [ ] Create a Company Admin for the company.
- [ ] Create a Salon Owner for the salon.
- [ ] Create a Manager and Staff account for the salon.
- [ ] Confirm API responses never contain passwordHash.

## Company Admin workflow

Login as the Company Admin created above and replace Postman accessToken with its access token.

- [ ] `GET /salons` returns only their company's salons.
- [ ] Create a salon without sending companyId; server assigns the authenticated companyId.
- [ ] Create a Salon Owner under a salon in their company.
- [ ] Create Manager and Staff under a salon in their company.
- [ ] Attempt to read another company's salon; expect 404.
- [ ] Attempt to create a user under another company's salon; expect 404.
- [ ] Attempt `POST /companies`; expect 403.

## Salon Owner workflow

Login as the Salon Owner and replace Postman accessToken with its access token.

- [ ] `GET /salons` returns only the assigned salon.
- [ ] Create Manager in the assigned salon.
- [ ] Create Staff in the assigned salon.
- [ ] Attempt to create Staff in another salon; expect 403.
- [ ] Attempt to update a salon; expect 403.
- [ ] Attempt to create a Company Admin; expect 403.
- [ ] User listing returns only users in the assigned salon.

## Tenant lifecycle

- [ ] Deactivate a user; verify their refresh token is revoked and future login is blocked.
- [ ] Reactivate the user.
- [ ] Deactivate a salon; verify assigned salon users cannot authenticate.
- [ ] Reactivate the salon using Company Admin or Super Admin.
- [ ] Deactivate a company; verify all tenant users in that company cannot authenticate.
- [ ] Reactivate the company using Super Admin.

## Security checks

- [ ] No endpoint accepts a role field for user provisioning.
- [ ] No profile endpoint accepts companyId, salonId, role, passwordHash or isActive.
- [ ] Duplicate company code returns 409.
- [ ] Duplicate salon code within the same company returns 409.
- [ ] Duplicate user email returns 409.
- [ ] Invalid UUID returns 400.
- [ ] Unauthenticated protected request returns 401.
- [ ] Wrong role returns 403.
- [ ] Cross-tenant record lookup returns 404.
- [ ] Inactive tenant login/authentication is blocked.

## Notes

V2 reuses the V1 Prisma schema and does not add a migration. This checklist is a manual API integration plan; run it against a non-production database before deployment.
