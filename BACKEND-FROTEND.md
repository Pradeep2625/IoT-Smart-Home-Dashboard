# Smart Home Dashboard — Local Setup Guide

This guide explains how to run the **backend** (ASP.NET Core + SignalR + EF Core) and **frontend** (React + Vite + Redux) locally.  
The project supports **JWT-secured real-time notifications** using SignalR.

---

## 🔧 Prerequisites

Before starting, make sure you have:

- **.NET SDK** installed → required to build and run the backend using `dotnet run`.
- **Node.js + npm** installed → required to install frontend dependencies and run the Vite dev server.
- **SQL Server** installed or available → required for the backend database.

---

## 📂 Repository Structure

- `backend/` → ASP.NET Core API, SignalR Hub, EF DbContext, and services.
- `frontend/` → React + Vite application with Redux Toolkit and SignalR JavaScript client.

---

## 🚀 Backend Setup

1. **Configure environment variables**
   - Edit `backend/appsettings.Development.json`:
     - Set your database connection string under `ConnectionStrings:DefaultConnection`.
     - Configure JWT settings:
       - `Jwt:Key` (a strong secret key)
       - `Jwt:Issuer`
       - `Jwt:Audience`
       - `Jwt:ExpiryMinutes`

2. **Check middleware order** (already present in `Program.cs`):

- Ensure JWT Bearer is configured to read `access_token` from the query string for SignalR connections.

3. **Run the backend**
- Open a terminal in `backend/` and run:
  ```bash
  dotnet run
  ```
- If running from the root, specify:
  ```bash
  dotnet run --project backend/backend.csproj
  ```

4. **SignalR notifications**  
- Each user is added to their own group in `OnConnectedAsync`.
- Alerts are sent with:
  ```csharp
  Clients.Group($"user:{userId}")
         .SendAsync("ReceiveAlert", dto);
  ```

---

## 🌐 Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```
2. **Configure environment**
1.Create a file frontend/.env.local with:VITE_API_BASE_URL=http://localhost:5125


3.**Run the frontend**
npm run dev
4. **SignalR client connection**
5.**swagger documentation**
http://localhost:5125/swagger/index.html

6. **To test the bakckend you cal also use file that is in /document and  import that  json document in postman and replace {{baseurl}} with http://localhost:5125 **
