"use client";

import { createContext, useContext, useState } from "react";
import type { BlogPost } from "@/lib/queries/public";

interface BlogSearchState {
  query: string;
  setQuery: (q: string) => void;
  filtered: BlogPost[];
}

const BlogSearchContext = createContext<BlogSearchState>({
  query: "",
  setQuery: () => {},
  filtered: [],
});

export function BlogSearchProvider({
  posts,
  children,
}: {
  posts: BlogPost[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? posts
      : posts.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <BlogSearchContext.Provider value={{ query, setQuery, filtered }}>
      {children}
    </BlogSearchContext.Provider>
  );
}

export function useBlogSearch() {
  return useContext(BlogSearchContext);
}
