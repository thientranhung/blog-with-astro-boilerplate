import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.example.com", // Replace with your production domain
    title: "Astro Obsidian Blog",   // Replace with your blog title
    description: "A professional boilerplate for creating a personal blog with Astro (AstroPaper theme) and syncing content from Obsidian.", // Replace with your blog description
    author: "Your Name",            // Replace with your name
    profile: "https://github.com/your-username", // Replace with your personal profile link
    ogImage: "default-og.jpg",
    lang: "vi",                     // Default language ("vi" or "en")
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
  },
  posts: {
    perPage: 5,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/your-username" }, // Replace with your profiles
    { name: "x",        url: "https://x.com/your-username" },
    { name: "linkedin", url: "https://www.linkedin.com/in/your-username" },
  ],
  shareLinks: [
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});