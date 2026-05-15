import React, { useState, useEffect } from "react";
import { Link } from "react-router";

function Home() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/articles`,
        );
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div>
      <h1>Latest Articles</h1>
      <div>
        {articles.map((article) => (
          <div key={article.id}>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <Link to={`/article/${article.id}`}>Read More</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
