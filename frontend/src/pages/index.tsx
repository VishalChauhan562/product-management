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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const cookieToken = Cookies.get("token");
    setToken(cookieToken || null);

    const { editMode, page, search } = router.query;
    if (editMode === "true" && cookieToken) {
      setIsEditMode(true);
    }
    if (page || search) {
      fetchProducts(Number(page) || 1, (search as string) || "");
    }
  }, [router.query]);

  const fetchProducts = async (page: number = 1, search: string = "") => {
    try {
      const response = await axios.get(`${API_URL}${search ? "/search" : ""}`, {
        params: {
          page,
          limit: productsData.limit,
          query: search || undefined, // Only include query if searching
        },
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
      fetchProducts(newPage, searchQuery);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, searchQuery); // Reset to first page when searching
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: 1, search: searchQuery },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "search") {
      setSearchQuery(e.target.value);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
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
      await fetchProducts(productsData.page, searchQuery); // Refresh with current search
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
      await fetchProducts(productsData.page, searchQuery); // Refresh with current search
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
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
      <nav className="bg-gradient-to-r from-black to-indigo-700 fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold tracking-tight">
                Product Management
              </h1>
            </div>
            <div className="max-[850px]:hidden flex items-center space-x-4">
              <div className="flex-grow max-w-md mr-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={handleChange}
                    placeholder="Search products..."
                    className="w-full p-2 rounded-full border-2 border-indigo-500 text-white bg-transparent placeholder-gray-300 focus:ring-2 focus:ring-white"
                  />

                  <button
                    type="submit"
                    className="absolute right-0 top-0 mt-1 mr-1 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full transition duration-300 ease-in-out"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </form>
              </div>
              <div className="flex items-center space-x-2">
                {isEditMode && (
                  <button
                    onClick={() => {
                      setForm({
                        name: "",
                        description: "",
                        price: "",
                        category: "",
                      });
                      setEditingId(null);
                      setIsModalOpen(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Add Product
                  </button>
                )}

                <button
                  onClick={handleEditModeToggle}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {isEditMode ? "View Mode" : "Edit Mode"}
                </button>

                {isClient &&
                  (token ? (
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/login")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Login
                    </button>
                  ))}
              </div>
            </div>

            <div className="hidden max-[850px]:flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-white focus:outline-none"
              >
                {!isMobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="hidden max-[850px]:block">
              <div className="px-2 pt-2 pb-3 space-y-2 bg-black/80">
                {/* Search for Mobile */}
                <form onSubmit={handleSearch} className="px-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      value={searchQuery}
                      onChange={handleChange}
                      placeholder="Search products..."
                      className="w-full p-2 rounded-full border-2 border-indigo-500 text-white bg-transparent placeholder-gray-300 focus:ring-2 focus:ring-white"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-0 mt-1 mr-1 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>

                {isEditMode && (
                  <button
                    onClick={() => {
                      setForm({
                        name: "",
                        description: "",
                        price: "",
                        category: "",
                      });
                      setEditingId(null);
                      setIsModalOpen(true);
                      toggleMobileMenu();
                    }}
                    className="w-full text-left px-3 py-2 text-white hover:bg-indigo-600 rounded-lg"
                  >
                    Add Product
                  </button>
                )}

                <button
                  onClick={() => {
                    handleEditModeToggle();
                    toggleMobileMenu();
                  }}
                  className="w-full text-left px-3 py-2 text-white hover:bg-indigo-600 rounded-lg"
                >
                  {isEditMode ? "View Mode" : "Edit Mode"}
                </button>

                {isClient &&
                  (token ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="w-full text-left px-3 py-2 text-white hover:bg-red-600 rounded-lg"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        router.push("/login");
                        toggleMobileMenu();
                      }}
                      className="w-full text-left px-3 py-2 text-white hover:bg-blue-600 rounded-lg"
                    >
                      Login
                    </button>
                  ))}
              </div>
            </div>
          )}
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
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
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
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 cursor-pointer"
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
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span>
              Page {productsData.page} of {productsData.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(productsData.page + 1)}
              disabled={productsData.page === productsData.totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 cursor-pointer"
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
    const search = (context.query.search as string) || "";
    const response = await axios.get(`${API_URL}${search ? "/search" : ""}`, {
      params: { page, limit, query: search || undefined },
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
