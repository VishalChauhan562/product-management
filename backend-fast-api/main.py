from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.product import router as product_router
from middleware.rate_limiter import limiter
from slowapi import Limiter 
from slowapi.util import get_remote_address
from dotenv import load_dotenv
import os
import multiprocessing

load_dotenv()
PORT = int(os.getenv("PORT", 5000))


limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(product_router)

def run_server(cluster_type: str):
    os.environ["CLUSTER_TYPE"] = cluster_type
    import uvicorn
    print(f"{cluster_type} API worker {os.getpid()} started")
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="info")

if __name__ == "__main__":
    processes = [
        multiprocessing.Process(target=run_server, args=("PRODUCT",)),
        multiprocessing.Process(target=run_server, args=("AUTH",)),
    ]
    for p in processes:
        p.start()
    for p in processes:
        p.join()