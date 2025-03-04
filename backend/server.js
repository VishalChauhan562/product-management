require("dotenv").config();
const cluster = require("cluster");
const os = require("os");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  // With below code we can evenly distribute our Clustre process
  // but for this project I chose to turn on two clustres 

  // for (let i = 0; i < numCPUs; i++) {
  //   if (i % 2 === 0) {
  //     cluster.fork({ CLUSTER_TYPE: "PRODUCT" });
  //   } else {
  //     cluster.fork({ CLUSTER_TYPE: "AUTH" });
  //   }
  // }

  cluster.fork({ CLUSTER_TYPE: "PRODUCT" });
  cluster.fork({ CLUSTER_TYPE: "AUTH" });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    const newWorkerType = worker.process.env.CLUSTER_TYPE;

    if (newWorkerType === "PRODUCT") {
      cluster.fork({ CLUSTER_TYPE: "PRODUCT" });
    } else {
      cluster.fork({ CLUSTER_TYPE: "AUTH" });
    }
  });
} else {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  connectDB();

  if (process.env.CLUSTER_TYPE === "PRODUCT") {
    app.use("/api/products", productRoutes);
    console.log(`Product API worker ${process.pid} started`);
  } else {
    app.use("/api/auth", authRoutes);
    console.log(`Auth API worker ${process.pid} started`);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });
}
