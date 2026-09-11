Invoice Generator — Backend
API
Node.js + Express + MongoDB backend for the
Invoice Generator app.
Setup
npm install
cp .env.example .env
# then fill in MONGO_URI and JWT_SECRET in 
.env
npm run dev
Get a free MongoDB database at
https://www.mongodb.com/cloud/atlas (Atlas free
tier is enough to launch).
Auth
All routes except 
/api/auth/register and
/api/auth/login require a header:
Authorization: Bearer <token>
Token is returned by register/login.
Endpoints
Auth
POST /api/auth/register — { name, email,
password, businessName?, businessAddress? }
POST /api/auth/login — { email, password }
GET /api/auth/me — current user (auth required)
Clients
GET /api/clients
POST /api/clients — { name, email?, address? }
PUT /api/clients/:id
DELETE /api/clients/:id
Invoices
GET /api/invoices
GET /api/invoices/:id
POST /api/invoices — { client, invoiceNumber,
invoiceDate, items: [{description, qty, rate}],
taxRate?, discountRate?, dueDate?, notes?,
currency? }
PUT /api/invoices/:id
DELETE /api/invoices/:id
Totals (
subtotal , 
total ) are calculated server-side
and included in every invoice response — never trust
totals sent from the frontend.
Connecting the existing frontend
In 
script.js , after login, store the returned token
(e.g. in a JS variable or 
sessionStorage in your own
hosting environment — not in Claude artifacts) and
send it as a Bearer token on invoice/client requests
instead of only rendering locally.
Deployment
Free options: Render, Railway, or Cyclic for the
API; MongoDB Atlas free tier for the database.
Set 
CLIENT_ORIGIN in 
frontend URL once live.
.env to your deployed