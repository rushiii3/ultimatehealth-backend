# backend_ultimatehealth

The repository is  the core engine powering the UltimateHealth platform. This backend service provides secure, and efficient APIs to support a seamless experience for users accessing trustable health resources and expert insights, built with Node js  and Express.✅💡. It uses MongoDB for data storage and JWT for secure authentication. 



---

## 🚀 Features

- 
  ### ✅ Article CRUD with edit request workflows 

  Managing content at scale requires a clear and controlled workflow to ensure quality, accuracy, and accountability. 
  This system outlines how articles are created, reviewed, and improved over time using a structured CRUD (Create, Read, Update, Delete) approach — enriched by an edit request mechanism, inspired by proven         practices at platforms like **GeeksforGeeks**.

    (a) Submit Article for Review Process
        To maintain content quality, all newly created articles must go through a structured review process before publication.

    (b) Review Article Management Flow
        Editors or reviewers assess submitted articles, provide feedback, and approve or reject them based on content standards and accuracy.

    (c) Contributor Edit Requests
       After publication, any contributor can propose edits to an article. With the consent of the Admin team, contributors are allowed to begin work on those changes.

    (d) Edit Request Review Management Flow
      Once submitted, edit requests undergo a separate review process where they are evaluated, approved, or rejected by the review team to ensure continued content quality.

  
   
- ### ✅ Podcast CRUD And Review Workflows
    (a) Submit Podcast audio for Review Process
        To maintain content quality, all newly created podcasts must go through a structured review process before publication.

- ### ✅ Reporting & Moderation System

    A robust reporting system plays a critical role in preserving the integrity of the UltimateHealth platform by identifying violations, abusive behavior, and misuse of features.

    **Bidirectional Monitoring**

     The system is not one-sided — it's not just users reporting others. The admin and moderation team actively monitor the platform.
     If users are found misusing the reporting feature itself, those instances are also tracked and counted against them.

   **Temporary Blocking via Active Reports**

     If a user accumulates more than 3 active reports, they will be temporarily blocked.
     The block remains in effect until all active reports are resolved.
     During this time, the user will be restricted from accessing the app entirely.

  **Strike System & Permanent Ban**

    If a user is issued a strike due to policy violations:
    Upon receiving 3 strikes, the user's account will be permanently blocked.
    A permanently blocked user will no longer be able to contribute or access the platform.

   **Tracking Admin & Moderator Contributions**

  Every action by admins and moderators is also tracked. No contribution is ignored — whether it's reviewing reports, moderating content, or managing user behavior.
   Even though this is an open-source project, the system is designed to ensure visibility into meaningful contributions. In a commercial (e-commerce) context, such contributions could be tied to a reward or        recognition system.
  
- ### ✅ JWT-protected routes
    JWT Protection across two layer (admin and user)

- ### ✅ Admin analytics (monthly/yearly contributions)

  
  Admin and moderator actions are **logged and recognized** within the system to ensure every effort is valued.

  ### Tracked Contributions:

  1.  **Report Resolution**  
     Resolving user reports (spam, abuse, policy violations).

  2.  **Article Review & Publication**  
   Collaborating with users to improve and publish articles.

  3.  **Article Improvement Review & Publication**  
   Collaborating with users to improve and publish articles.

  4.  **Podcast Review & Publication**  
   Reviewing and publishing user-submitted podcasts.

> While UltimateHealth is an open-source project, this tracking system lays the foundation for a **potential future rewards or recognition system**.


- ### ✅ User Analytics (Read/write activity tracking)


    User analytics in **UltimateHealth** is focused on understanding how users engage with the platform.
   These insights help us improve user experience, content delivery, and foster a healthier, more informed    community.

  **Key Objective:**

  **Track user engagement patterns**  
  Understand how frequently users interact with content (articles, podcasts, comments, etc.).
  

- ### ✅ Swagger UI for API documentation  
  

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JSON Web Token (JWT)
- Swagger (OpenAPI 3)
- dotenv

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=YOUR_PORT_HERE

MONGODB_URL= YOUR_DATABASE_URL_HERE
BASE_URL = SERVER_BASE_URL_HERE
JWT_SECRET= JWT_SECRET_KEY
EMAIL= EMAIL_ID
PASSWORD= MAIL_PASSWORD
SMTP_HOST= YOUR_MAIL_HOST
EMAIL_USER= YOUR_MAIL_ID
EMAIL_PASS= YOUR_MAIL_PASSWORD
BUCKET_NAME = 'YOUR_AWS_BUCKET_NAME';
ENDPOINT_URL = 'YOUR_ENDPOINT_URL';

```

## 🧑‍💻 Getting Started

1. Clone the repository
   
```
git clone https://github.com/SB2318/backend_ultimatehealth.git
cd your-backend-repo
```
2. Install dependencies
   
```
npm install
````

3. Run the server

```
 npm start
```

## 📚 API Documentation (Swagger)

### Swagger UI is available at:

```
http://localhost:8082/docs

```

### All protected routes require a Bearer token in the Authorization header.

```
Authorization: Bearer <your_jwt_token>

```

## Contributors
Available soon
