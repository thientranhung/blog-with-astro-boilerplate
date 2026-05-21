import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.thientranhung.dev",
    title: "Trần Hưng Thiện",
    description: "Fullstack developer & AI Engineer. Ghi lại những gì tôi nghiên cứu, khám phá về công nghệ và kinh doanh.",
    author: "Trần Hưng Thiện",
    profile: "https://github.com/thientranhung",
    ogImage: "default-og.jpg",
    lang: "vi",
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
    { name: "github",   url: "https://github.com/thientranhung" },
    { name: "x",        url: "https://x.com/hungthien87" },
    { name: "linkedin", url: "https://www.linkedin.com/in/tran-thien-a264334b" },
  ],
  shareLinks: [
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});