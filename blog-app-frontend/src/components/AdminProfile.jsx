import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import {
  pageWrapper,
  loadingClass,
  errorClass,
  emptyStateClass,
  articleCardClass,
  articleTitle,
  articleMeta,
  articleExcerpt,
  ghostBtn,
  tagClass,
  mutedText,
} from "../styles/common";

const TAB_USERS = "users";
const TAB_ARTICLES = "articles";

function AdminProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TAB_USERS);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin-api/users-authors`,
          { withCredentials: true },
        );
        setUsers(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user-api/articles`,
          { withCredentials: true },
        );
        setArticles(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === TAB_USERS) fetchUsers();
    else fetchArticles();
  }, [activeTab]);

  const tabBtn = (tab) =>
    activeTab === tab
      ? "bg-white px-5 py-2 rounded-full text-[#0066cc] text-sm font-medium shadow-sm"
      : "px-5 py-2 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors";

  const roleBadge = (role) => {
    const colours = {
      USER: "bg-[#34c759]/15 text-[#248a3d]",
      AUTHOR: "bg-[#0066cc]/10 text-[#0066cc]",
      ADMIN: "bg-[#ff9f0a]/15 text-[#b86e00]",
    };
    return `text-[10px] font-semibold px-2 py-0.5 rounded-full ${colours[role] ?? "bg-[#f5f5f7] text-[#6e6e73]"}`;
  };

  return (
    <div className={pageWrapper}>
      {/* PROFILE HEADER */}
      <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#ff9f0a]/15 text-[#b86e00] flex items-center justify-center text-xl font-semibold">
            {currentUser?.firstName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-[#6e6e73]">Admin dashboard</p>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
          </div>
        </div>
        <button
          className="bg-[#ff3b30] text-white text-sm px-5 py-2 rounded-full hover:bg-[#d62c23] transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6 bg-[#f5f5f7] p-2 rounded-full w-fit">
        <button className={tabBtn(TAB_USERS)} onClick={() => setActiveTab(TAB_USERS)}>
          Users &amp; Authors
        </button>
        <button className={tabBtn(TAB_ARTICLES)} onClick={() => setActiveTab(TAB_ARTICLES)}>
          All Articles
        </button>
      </div>

      <div className="border-t border-[#e8e8ed] my-6" />

      {/* CONTENT */}
      {loading && <p className={loadingClass}>Loading...</p>}
      {error && <p className={errorClass}>{error}</p>}

      {!loading && !error && activeTab === TAB_USERS && (
        <UsersTable users={users} setUsers={setUsers} roleBadge={roleBadge} />
      )}

      {!loading && !error && activeTab === TAB_ARTICLES && (
        <ArticlesGrid articles={articles} setArticles={setArticles} navigate={navigate} />
      )}
    </div>
  );
}

function UsersTable({ users, setUsers, roleBadge }) {
  const [togglingEmail, setTogglingEmail] = useState(null);

  const handleToggleBlock = async (email) => {
    setTogglingEmail(email);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin-api/block/${email}`,
        {},
        { withCredentials: true },
      );
      if (res.status === 200) {
        setUsers((prev) =>
          prev.map((u) =>
            u.email === email ? { ...u, isUserActive: res.data.payload.isUserActive } : u,
          ),
        );
      }
    } catch (err) {
      console.error("Toggle block failed:", err);
    } finally {
      setTogglingEmail(null);
    }
  };

  if (users.length === 0)
    return <p className={emptyStateClass}>No users or authors found.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e8e8ed]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f5f5f7] text-left">
            <th className="px-5 py-3 font-medium text-[#6e6e73]">Name</th>
            <th className="px-5 py-3 font-medium text-[#6e6e73]">Email</th>
            <th className="px-5 py-3 font-medium text-[#6e6e73]">Role</th>
            <th className="px-5 py-3 font-medium text-[#6e6e73]">Status</th>
            <th className="px-5 py-3 font-medium text-[#6e6e73]">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="border-t border-[#e8e8ed] hover:bg-[#f5f5f7] transition-colors"
            >
              <td className="px-5 py-3 font-medium text-[#1d1d1f]">
                {user.firstName} {user.lastName}
              </td>
              <td className={`px-5 py-3 ${mutedText}`}>{user.email}</td>
              <td className="px-5 py-3">
                <span className={roleBadge(user.role)}>{user.role}</span>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    user.isUserActive
                      ? "bg-[#34c759]/15 text-[#248a3d]"
                      : "bg-[#ff3b30]/15 text-[#cc2f26]"
                  }`}
                >
                  {user.isUserActive ? "Active" : "Blocked"}
                </span>
              </td>
              <td className="px-5 py-3">
                <button
                  disabled={togglingEmail === user.email}
                  onClick={() => handleToggleBlock(user.email)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition disabled:opacity-50 ${
                    user.isUserActive
                      ? "bg-[#ff3b30]/10 text-[#cc2f26] hover:bg-[#ff3b30]/20"
                      : "bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20"
                  }`}
                >
                  {togglingEmail === user.email
                    ? "..."
                    : user.isUserActive
                    ? "Block"
                    : "Unblock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArticlesGrid({ articles, setArticles, navigate }) {
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleDelete = async (articleId) => {
    setTogglingId(articleId);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin-api/article/${articleId}`,
        {},
        { withCredentials: true },
      );
      if (res.status === 200) {
        setArticles((prev) =>
          prev.map((a) =>
            a._id === articleId
              ? { ...a, isArticleActive: res.data.payload.isArticleActive }
              : a,
          ),
        );
      }
    } catch (err) {
      console.error("Toggle article failed:", err);
    } finally {
      setTogglingId(null);
    }
  };

  if (articles.length === 0)
    return <p className={emptyStateClass}>No articles found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {articles.map((article) => (
        <div key={article._id} className={`${articleCardClass} relative flex flex-col`}>
          <span
            className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full ${
              article.isArticleActive
                ? "bg-[#34c759]/20 text-[#248a3d]"
                : "bg-[#ff3b30]/20 text-[#cc2f26]"
            }`}
          >
            {article.isArticleActive ? "ACTIVE" : "DELETED"}
          </span>

          <div className="flex flex-col gap-2">
            <p className={tagClass}>{article.category}</p>
            <p className={articleTitle}>{article.title}</p>
            <p className={articleExcerpt}>{article.content.slice(0, 80)}...</p>
            <p className={articleMeta}>
              {new Date(article.createdAt).toLocaleDateString("en-IN", {
                dateStyle: "medium",
              })}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">
            <button
              className={ghostBtn}
              onClick={() => navigate(`/article/${article._id}`, { state: article })}
            >
              Read →
            </button>

            <button
              disabled={togglingId === article._id}
              onClick={() => handleToggleDelete(article._id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition disabled:opacity-50 ${
                article.isArticleActive
                  ? "bg-[#ff3b30]/10 text-[#cc2f26] hover:bg-[#ff3b30]/20"
                  : "bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20"
              }`}
            >
              {togglingId === article._id
                ? "..."
                : article.isArticleActive
                ? "Delete"
                : "Restore"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminProfile;
