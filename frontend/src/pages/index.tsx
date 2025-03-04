import { GetServerSideProps } from "next";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

export default function Home({
  initialData,
}: {
  initialData: {
    products: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [productsData, setProductsData] = useState(initialData);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const cookieToken = Cookies.get("token");
    setToken(cookieToken || null);

    const { editMode, page } = router.query;
    if (editMode === "true" && cookieToken) {
      setIsEditMode(true);
    }
    if (page) {
      fetchProducts(Number(page));
    }
  }, [router.query]);

  const fetchProducts = async (page: number = 1) => {
    try {
      const response = await axios.get(API_URL, {
        params: { page, limit: productsData.limit },
      });
      setProductsData(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
      setProductsData({ ...productsData, products: [] });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= productsData.totalPages) {
      fetchProducts(newPage);
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, page: newPage },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to add or edit products.");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, { headers });
        toast.success("Product updated successfully!");
      } else {
        await axios.post(API_URL, form, { headers });
        toast.success("Product added successfully!");
      }
      await fetchProducts(productsData.page);
      setForm({ name: "", description: "", price: "", category: "" });
      setEditingId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.error("You must be logged in to delete products.");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/${id}`, { headers });
      toast.success("Product deleted successfully!");
      await fetchProducts(productsData.page);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
    });
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  const handleEditModeToggle = () => {
    if (!token) {
      router.push(`/login?returnUrl=${encodeURIComponent("/?editMode=true")}`);
      return;
    }
    setIsEditMode(!isEditMode);
    const newQuery = { ...router.query };
    if (!isEditMode) {
      newQuery.editMode = "true";
    } else {
      delete newQuery.editMode;
    }
    router.push({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setToken(null);
    setIsEditMode(false);
    router.push({ pathname: router.pathname, query: {} });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="bottom-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
      />
      <nav className="bg-gray-800 p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
        <h1 className="text-white text-xl font-bold">Product Management</h1>
        <div className="flex space-x-4">
          {isEditMode && (
            <button
              onClick={() => {
                setForm({ name: "", description: "", price: "", category: "" });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-150"
            >
              Add New Product
            </button>
          )}
          <button
            onClick={handleEditModeToggle}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-150"
          >
            {isEditMode ? "View Mode" : "Edit Mode"}
          </button>
          {isClient &&
            (token ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition duration-150"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition duration-150"
              >
                Login
              </button>
            ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 mt-20">
        {isModalOpen && isEditMode && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="w-full p-2 border rounded-lg"
                  step="0.01"
                  min="0"
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Category"
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingId ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(productsData.products) &&
          productsData.products.length > 0 ? (
            productsData.products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <div className="text-gray-600 h-20 overflow-y-auto">
                    {product.description}
                  </div>
                  <p className="text-indigo-600 font-bold text-lg">
                    ${product.price}
                  </p>
                  <p className="text-gray-500">Category: {product.category}</p>
                </div>
                {isEditMode && (
                  <div className="bg-gray-50 px-4 py-3 border-t flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No products available.</p>
          )}
        </div>

        {productsData.totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={() => handlePageChange(productsData.page - 1)}
              disabled={productsData.page === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {productsData.page} of {productsData.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(productsData.page + 1)}
              disabled={productsData.page === productsData.totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const page = Number(context.query.page) || 1;
    const limit = 10;
    const response = await axios.get(API_URL, {
      params: { page, limit },
    });

    const {
      products,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
    } = response.data;
    return {
      props: {
        initialData: {
          products,
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        initialData: {
          products: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    };
  }
};
