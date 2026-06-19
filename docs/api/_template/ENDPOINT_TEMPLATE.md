# {{Endpoint Title}}

{{One-line description of what this endpoint does.}}

---

## Endpoint

```http
{{METHOD}} {{/api/version/resource/action}}
```

---

## Access

| Property       | Value                                                   |
| -------------- | ------------------------------------------------------- |
| Route Type     | {{Public / Private}}                                    |
| Authentication | {{Required / Not Required}}                             |
| Authorization  | {{Anyone / Any authenticated user / Admin only / etc.}} |

> **What does this mean?**
> {{Plain-language explanation of who can call this and what they need.}}

{{If relevant, add a note here about any Bruno/Postman auth mismatch, e.g. "auth: inherit" not actually being enforced.}}

---

## Headers

| Header        | Required   | Example            | Description               |
| ------------- | ---------- | ------------------ | ------------------------- |
| Content-Type  | {{Yes/No}} | `application/json` | Request body format       |
| Authorization | {{Yes/No}} | `Bearer <token>`   | {{Only if auth required}} |

---

# Request Body

Send the following JSON in the request body.

| Field     | Type     | Required   | Description     | Example       |
| --------- | -------- | ---------- | --------------- | ------------- |
| {{field}} | {{type}} | {{Yes/No}} | {{description}} | `{{example}}` |

{{If applicable: note whether the schema is strict (rejects unknown fields) or lenient.}}

---

# Behavior

{{Describe anything non-obvious about how this endpoint behaves — e.g.:

- Does it always return success regardless of input, for security reasons (enumeration prevention)?
- Does it trigger side effects (emails, webhooks, other DB writes)?
- Is it idempotent? What happens if called twice with the same input?
- Does the response differ based on hidden conditions a contributor wouldn't guess from the request alone?

If there's nothing unusual, delete this section.}}

---

# How It Works

{{Numbered, step-by-step internal flow — what the backend actually does, in order. This is different from "Behavior" above: Behavior covers externally-observable quirks (what the caller sees), this section covers the internal logic (what happens on the server). Pull this from the actual route handler / controller, don't guess.

Example steps:

1. Request hits the route and is validated against the schema.
2. {{Check step, e.g. "Check if a user with this email/handle already exists."}}
3. {{Branch step, e.g. "If new: hash the password, save the record, generate a verification token, send the verification email."}}
4. {{Branch step, e.g. "If existing: skip account creation and email, but still proceed to the same response."}}
5. {{Final step, e.g. "Apply the enforced delay, then respond with the same success message regardless of branch."}}
   }}

## Flow Diagram

{{Insert a flowchart here (e.g. using Mermaid, or describe verbally if diagrams aren't supported in your docs renderer) showing the request lifecycle: entry → validation → branching logic → side effects → response.}}

{{If there's no meaningful internal logic beyond "validate then save" (i.e. a simple CRUD endpoint), this section can be shortened to a one-line description instead of a full diagram.}}

---

| Property | Value                                                             |
| -------- | ----------------------------------------------------------------- |
| Enabled  | {{Yes/No}}                                                        |
| Limit    | {{e.g. 700ms enforced delay per request, or 100 requests/min/IP}} |

{{If there's no rate limiting, delete this section.}}

---

# Validation Rules

| Field     | Rules                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| {{field}} | {{exact validation rule, e.g. "Required. 8-100 chars. Must include 1 uppercase, 1 lowercase, 1 number, 1 special char."}} |

---

# Errors

| Status | Cause                                                                          |
| ------ | ------------------------------------------------------------------------------ |
| 400    | {{e.g. validation failed}}                                                     |
| 401    | {{e.g. missing/invalid token}}                                                 |
| 403    | {{e.g. authenticated but not authorized}}                                      |
| 404    | {{e.g. resource not found}}                                                    |
| 409    | {{e.g. duplicate resource — ONLY include if this status is actually returned}} |
| 422    | {{e.g. semantic validation failure}}                                           |
| 429    | {{e.g. rate limit exceeded}}                                                   |
| 500    | Unexpected server error                                                        |

> Delete any status code row above that this endpoint does not actually return. Do not guess — confirm against the code.

{{If there's a deliberate "always returns success" pattern like enumeration prevention, explicitly call it out here, e.g.: "Note: there is no 409 for a duplicate X. See Behavior above."}}

---

# Response Fields

| Field     | Type     | Description     |
| --------- | -------- | --------------- |
| {{field}} | {{type}} | {{description}} |

{{Only fill this in if you ARE documenting response bodies in this file. If response examples are managed separately (e.g. in Bruno/Postman), delete this section and the request/response example sections below.}}

---

# Notes

- {{Any operational notes a new contributor should know — gotchas, expected latency, things that look like bugs but aren't.}}

---

# Version History

| Date           | Author            | Description                            |
| -------------- | ----------------- | -------------------------------------- |
| {{YYYY-MM-DD}} | {{github_handle}} | {{What was added/changed in this doc}} |

> Contributors: add a new row each time you change this endpoint's behavior, request/response shape, or validation rules — newest entry at the top.

---

# Quick Summary

| Item            | Value                              |
| --------------- | ---------------------------------- |
| Endpoint        | `{{/api/version/resource/action}}` |
| Method          | `{{METHOD}}`                       |
| Route Type      | {{Public/Private}}                 |
| Authentication  | {{Required/Not Required}}          |
| Content-Type    | `application/json`                 |
| Success Status  | `{{status code}}`                  |
| Rate Limit      | {{if applicable}}                  |
| Response Format | JSON                               |
