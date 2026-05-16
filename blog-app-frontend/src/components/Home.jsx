import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  pageWrapper,
  pageTitleClass,
  bodyText,
  articleGrid,
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  tagClass,
  ghostBtn,
  loadingClass,
  emptyStateClass,
} from "../styles/common";

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/user-api/articles`,
          { credentials: "include" },
        );
        const data = await response.json();
        setArticles(data.payload || []);
      } catch (error) {
        console.error(error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className={pageWrapper}>
      {/* HERO */}
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0066cc] mb-4">
          Welcome to MyBlog
        </p>
        <h1 className={`${pageTitleClass} text-center`}>
          Ideas worth reading.
        </h1>
        <p className={`${bodyText} mt-4 max-w-xl mx-auto text-base`}>
          Discover articles on technology, programming, AI, and web
          development — written by passionate authors for curious minds.
        </p>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-[#e8e8ed] mb-12" />

      {/* ARTICLES */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#a1a1a6] mb-6">
        Latest Articles
      </h2>

      {loading && <p className={loadingClass}>Loading articles...</p>}

      {!loading && articles.length === 0 && (
        <p className={emptyStateClass}>No articles yet. Check back soon.</p>
      )}

      {!loading && articles.length > 0 && (
        <div className={articleGrid}>
          {articles.map((article) => (
            <div key={article._id} className={`${articleCardClass} flex flex-col gap-2.5`}>
              <p className={tagClass}>{article.category}</p>
              <p className={articleTitle}>{article.title}</p>
              <p className={articleExcerpt}>{article.content.slice(0, 100)}...</p>
              <p className={articleMeta}>
                {new Date(article.createdAt).toLocaleDateString("en-IN", {
                  dateStyle: "medium",
                })}
              </p>
              <Link
                to={`/article/${article._id}`}
                state={article}
                className={`${ghostBtn} mt-auto`}
              >
                Read Article →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
