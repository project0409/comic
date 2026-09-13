export type TourType = "home" | "comic" | "reader" | "profile";

export interface TourStep {
  target: string;
  title: string;
  content: string;
}

export interface PageTour {
  type: TourType;
  title: string;
  welcomeHeading: string;
  welcomeDescription: string;
  steps: TourStep[];
}

export const HOME_TOUR_STEPS: TourStep[] = [
  {
    target: "#tour-navbar",
    title: "Navigation Bar",
    content: "Explore the platform using these navigation links. Jump back to the Home feed, discover new titles, view all series, or open your Vault.",
  },
  {
    target: "#tour-search-bar",
    title: "Search Bar",
    content: "Looking for something specific? Search for your favorite comic series, writers, or tags instantly.",
  },
  {
    target: "#tour-genres",
    title: "Categories & Genres",
    content: "Filter comics by genre! Click on Action, Fantasy, Sci-Fi, Romance, or Horror to find exactly what you like.",
  },
  {
    target: ".sf-comic-card",
    title: "Comic Cards",
    content: "Explore our rich catalog. Each card shows the series title, chapter count, and custom genre badges.",
  },
  {
    target: ".sf-comic-card",
    title: "How to Open a Comic",
    content: "Click on any comic card to view details, chapters, read reviews, and start reading your favorite episodes.",
  },
  {
    target: ".sf-comic-card",
    title: "Immersive Reader Controls",
    content: "Inside the reader, you can switch between vertical scroll or panel-by-panel modes, adjust zoom, and toggle ambient music.",
  },
  {
    target: "#tour-reader-hub",
    title: "Bookmarks & Saved Stories",
    content: "Keep track of your reading progress! Access your bookmarks and favorite series inside the Reader Hub.",
  },
  {
    target: "#tour-profile-menu",
    title: "Profile Section",
    content: "Manage your user profile. Open this menu to view details, check your email, or check out dashboard tools if you are a creator.",
  },
  {
    target: "#tour-profile-menu",
    title: "Settings Section",
    content: "Inside the profile dropdown, you'll find the Settings option to edit credentials, change names, and manage account preferences.",
  },
  {
    target: "#tour-theme-toggle",
    title: "Theme Switcher",
    content: "Prefer a dark UI or comfortable reading at night? Switch between Dark, Light, or System themes instantly.",
  },
];

export const COMIC_TOUR_STEPS: TourStep[] = [
  {
    target: "#tour-comic-cover",
    title: "Comic Cover",
    content: "View the official series cover art and quickly verify the selected comic edition.",
  },
  {
    target: "#tour-comic-info",
    title: "Comic Information",
    content: "Check key series details including author credits, total readers, community star ratings, and synopsis.",
  },
  {
    target: "#tour-comic-save",
    title: "Bookmark / Favorite",
    content: "Save this comic to your personal playlist or library to receive notifications and continue reading later.",
  },
  {
    target: "#tour-comic-chapters",
    title: "Chapter Selection",
    content: "Browse all released chapters, check dates, and see community ratings for individual episodes.",
  },
  {
    target: "#tour-comic-read",
    title: "Start Reading",
    content: "Click 'Read Now' on any chapter to launch our distraction-free, high-resolution immersive comic reader.",
  },
];

export const READER_TOUR_STEPS: TourStep[] = [
  {
    target: "#tour-reader-canvas",
    title: "Comic Reading Area",
    content: "This is your main reading canvas. Enjoy high-resolution panel rendering with full interactive touch or mouse navigation.",
  },
  {
    target: "#tour-reader-controls",
    title: "Reading & Audio Controls",
    content: "Toggle between 3D Flip and Scroll modes, turn on panel Guided View, manage ambient background music, or consult the Lore Master AI.",
  },
  {
    target: "#tour-reader-page-nav",
    title: "Page Navigation",
    content: "Quickly flip forward and backward between pages, or seamlessly advance to the next chapter upon completion.",
  },
  {
    target: "#tour-reader-exit",
    title: "Exit Comic",
    content: "Click 'Exit Comic' anytime to return directly to the series details or your library.",
  },
];

export const PROFILE_TOUR_STEPS: TourStep[] = [
  {
    target: "#tour-profile-info",
    title: "Profile Information",
    content: "View your user avatar, display name, account email, and role badge (Reader, Writer, or Admin).",
  },
  {
    target: "#tour-profile-stats",
    title: "Reading Statistics & Points",
    content: "Track your lifetime comics read, accumulated reader points, and total saved stories in one dashboard.",
  },
  {
    target: "#tour-profile-actions",
    title: "Account Controls & Shortcuts",
    content: "Jump to your personal Library, edit your user profile, manage security settings, or view your saved stories.",
  },
  {
    target: "#tour-profile-features",
    title: "Role Features & Access",
    content: "Discover permissions and features tied to your role, including creator upload tools or vault reading privileges.",
  },
];

export const PAGE_TOURS: Record<TourType, PageTour> = {
  home: {
    type: "home",
    title: "Home Page Tour",
    welcomeHeading: "Welcome to FYP Comics! 📚✨",
    welcomeDescription: "We are thrilled to have you join our platform! Let's take a quick 2-minute tour to help you get the most out of your premium comic reading experience.",
    steps: HOME_TOUR_STEPS,
  },
  comic: {
    type: "comic",
    title: "Comic Details Tour",
    welcomeHeading: "Explore Comic Series! 📖",
    welcomeDescription: "Discover how to browse chapters, check author details, and bookmark your favorite series.",
    steps: COMIC_TOUR_STEPS,
  },
  reader: {
    type: "reader",
    title: "Immersive Reader Tour",
    welcomeHeading: "Master the Comic Reader! 🎨",
    welcomeDescription: "Learn how to use flip/scroll reading modes, panel zoom, ambient soundtrack, and page navigation.",
    steps: READER_TOUR_STEPS,
  },
  profile: {
    type: "profile",
    title: "Profile & Library Tour",
    welcomeHeading: "Your Reading Hub! 👤",
    welcomeDescription: "Explore your reading statistics, earned points, saved bookmarks, and role features.",
    steps: PROFILE_TOUR_STEPS,
  },
};

/**
 * Determines which tour applies to the given pathname.
 * Returns null if the page is not one of the 4 supported tour pages.
 */
export function getCurrentPageTourType(pathname?: string | null): TourType | null {
  if (!pathname) return null;

  // 1. Home Page: "/" or "/home"
  if (pathname === "/" || pathname === "/home") {
    return "home";
  }

  // 2. Comic Details Page: "/series/[id]" (not "/series" catalog and not "/series/[id]/chapters")
  if (/^\/series\/[^/]+$/.test(pathname)) {
    return "comic";
  }

  // 3. Chapter / Reader Page: "/read/[chapterId]"
  if (/^\/read\/[^/]+$/.test(pathname)) {
    return "reader";
  }

  // 4. Profile Page: "/profile" (not "/profile/edit")
  if (pathname === "/profile") {
    return "profile";
  }

  return null;
}

export function getCurrentPageTour(pathname?: string | null): PageTour | null {
  const type = getCurrentPageTourType(pathname);
  if (!type) return null;
  return PAGE_TOURS[type] ?? null;
}
