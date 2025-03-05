# Project Setup Guide

This guide provides step-by-step instructions on how to set up and run the **Frontend**, **Backend (Node.js)**, and **Backend-FastAPI** locally.

---

# Demo video

https://drive.google.com/file/d/14mWp6kEGP7P33isQfu2Gjisy-D0IpVFk/view?usp=sharing

## Prerequisites to run in local
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **Python 3.8+**
- **pip** (Python package manager)
- **MongoDB** (if used in the backend)
- **Virtual Environment (venv) or (conda)**  for Python (optional but recommended)

---

## 1. Setting up Backend (Node.js)
### Steps:
1. Navigate to the backend directory:
```sh
cd backend
```

2. Install dependencies:

```
npm install
```

3. Set up environment variables:

Create a .env file in the backend directory.
Add required environment variables (modify as needed):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/product-management
JWT_SECRET=your_secret_key
```

4. Start the backend server:

```
npm run dev   
```

Backend will run on http://localhost:5000

## 2. Setting up Backend-FastAPI

Steps:

1. Navigate to the FastAPI backend directory:

```
cd backend-fast-api
```

2. Create and activate a virtual environment (recommended):

For macOS/Linux:
```
python3 -m venv venv
source venv/bin/activate
```

For Windows (Command Prompt):
```
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies from requirements.txt:

```
pip install -r requirements.txt

```

4. Run the FastAPI server:

```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

```

FastAPI will run on http://localhost:8000

## 3. Setting up Frontend (Next.js)

Steps:

1. Navigate to the frontend directory:

```
cd frontend
```
2. Install dependencies:

```
npm install
```


## To test Node.js backend (backend)

Just load the file MOCK_DATA.json via mongo compass in product collection 
if you want good number of products.

To test node js backend

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

To test FastAPI backend (backend-fast-api)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the frontend:

```
npm run dev
```

Frontend will run on http://localhost:3000
