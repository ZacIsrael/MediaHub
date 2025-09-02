# MediaHub Pro

MediaHub Pro is a full-stack application designed to help creators and freelancers organize their work.  
Version 1 provides a **personal hub** to manage:

- **Clients** — store client details for gigs or collaborations  
- **Bookings** — keep track of schedules and photography sessions  
- **Videos** — log published or upcoming video projects  
- **Social Posts** — organize social media content  

Future iterations will expand MediaHub into a **multi-user platform** with role-based access and collaborative features.

---

## 🚀 Features (v1)

- **Authentication** — secure login with JWT-based session handling  
- **Clients Module** — add, view, and manage client information  
- **Bookings Module** — schedule, edit, and track gigs  
- **Videos Module** — track video projects with metadata (title, tags, views, published date)  
- **Social Posts Module** — record posts and related details  
- **Protected Dashboard** — React Router guards ensure only logged-in users can access data  

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite  
- React Router  
- TanStack Query  
- TypeScript  

**Backend**
- Node.js + Express  
- TypeScript  
- PostgreSQL (`pg`) — structured data (clients & bookings)  
- MongoDB + Mongoose — unstructured content (videos & posts)  
- JWT authentication  

**DevOps**
- Dockerized (Postgres, Mongo, API, and frontend containers)  
- Environment variable management  
- Ready for deployment to Railway, Render, or Fly.io  

---

## 📂 Project Structure
/backend → RESTful API (Express, TypeScript, PostgreSQL, MongoDB)
/frontend → React app (Vite, TypeScript, React Router, TanStack Query)
