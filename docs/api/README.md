# API Documentation

This folder contains documentation for every API endpoint, organized by resource.

## How this is organized

```
docs/api/
├── README.md          ← you are here
├── admin/
│   ├── register.md
│   └── ...
├── articles/
│   └── ...
└── ...
```

Each resource (e.g. `admin`, `articles`, `users`) gets its own folder. Each endpoint inside that resource gets its own `.md` file, named after the action (e.g. `register.md`, `login.md`, `create.md`, `update.md`).

## How to read an endpoint doc

Every endpoint doc follows the same structure, top to bottom:

1. **Endpoint** — method + URL
2. **Access** — Public or Private, and what that means
3. **Headers** — what to send
4. **Request Body** — fields, types, examples
5. **Validation Rules** — exact rules the backend enforces
6. **Success Response** — status code + body shape
7. **Error Responses** — every error you might hit, with example bodies
8. **Example requests** — cURL, Fetch, Axios
9. **Version History** — who changed what, and when
10. **Quick Summary** — table for a fast glance

## Endpoints

### Version 3

| Resource | Endpoint                                     | Method | Auth    | Doc                                                          |
| -------- | -------------------------------------------- | ------ | ------- | ------------------------------------------------------------ |
| Admin    | `/api/v3/admin/register`                     | POST   | Public  | [admin/v3/register.md](./admin/v3/register.md)               |
| Admin    | `/api/v3/admin/signature`                    | GET    | Public  | [admin/v3/signature.md](./admin/v3/signature.md)             |
| Admin    | `/api/v3/admin/agreement`                    | POST   | Public  | [admin/v3/agreement.md](./admin/v3/agreement.md)             |
| Admin    | `/api/v3/admin/agreements/:id/agreement.pdf` | GET    | Private | [admin/v3/get-agreement-pdf.md](./admin/v3/get-agreement-pdf.md) |
| Admin    | `/api/v3/admin/login`                        | POST   | Public  | [admin/v3/login.md](./admin/v3/login.md)                     |
| Admin    | `/api/v3/admin/logout`                       | POST   | Private | [admin/v3/logout.md](./admin/v3/logout.md)                   |
| Admin    | `/api/v3/admin/getprofile`                   | GET    | Private | [admin/v3/getprofile.md](./admin/v3/getprofile.md)           |
| Admin    | `/api/v3/admin/update-password`              | PUT    | Private | [admin/v3/update-password.md](./admin/v3/update-password.md) |
| Admin    | `/api/v3/admin/update-profile`               | PUT    | Private | [admin/v3/update-profile.md](./admin/v3/update-profile.md)   |
| Admin    | `/api/v3/admin/delete`                       | DELETE | Private | [admin/v3/delete.md](./admin/v3/delete.md)                   |



## Adding a new endpoint doc

1. Create a new `.md` file under the matching resource folder (e.g. `docs/api/admin/login.md`). If the resource folder doesn't exist yet, create it.
2. Copy the structure from an existing doc (e.g. `admin/register.md`) and fill in the new endpoint's details.
3. Add a row for it in the **Endpoints** table above.
4. Add yourself to the **Version History** table inside that endpoint's doc, with the date and a short description of what you added or changed.

> When editing an existing endpoint doc (not just creating one), always add a new row to its Version History table — don't just edit the content silently.
