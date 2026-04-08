# ENEWS Backend (Express + MongoDB)

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Make sure MongoDB is running locally.

3. Copy `.env.example` to `.env` and adjust if needed:
   ```
   MONGO_URI=mongodb://localhost:27017/Enews_73
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ADMIN_EMAIL=krishna2005@gmail.com
   ADMIN_PASSWORD=krishna2005
   ```

4. Start:
   ```bash
   npm run dev    # if you have nodemon installed (devDependency)
   # or
   npm start
   ```

On first run the admin user `krishna2005@gmail.com` / `krishna2005` will be created automatically if not already present.
API root: http://localhost:5000/api
