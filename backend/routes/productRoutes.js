const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
} = require("../controllers/productController");
const {
  publicApiLimiter,
  authApiLimiter,
  authLimiter,
} = require("../middleware/rateLimiter");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(publicApiLimiter, getProducts);
router.route("/").post(protect, authApiLimiter, createProduct);
router.route("/search").get(publicApiLimiter, searchProducts);

router
  .route("/:id")
  .get(publicApiLimiter, getProductById)
  .put(protect, authApiLimiter, updateProduct)
  .delete(protect, authApiLimiter, deleteProduct);


module.exports = router;
