import {
  CreditCard,
  QrCode,
  FileText,
  Link2,
  BarChart3,
  Gift,
  Sparkles,
  Store,
  GraduationCap,
  Briefcase,
  Palette,
  Building2,
  BookOpen,
  Users,
  Award,
  Zap,
  TrendingUp,
  Lightbulb,
  Clock,
  Rocket,
  Target,
  Megaphone,
} from "lucide-react";

// The ClickCard web app is a separate application (own deploy/origin).
// The landing site deep-links into it. Override per environment via env.
export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001";
export const WEBAPP_URL = `${WEB_URL}/signup`;
export const LOGIN_URL = `${WEB_URL}/login`;
export const PLANS_URL = `${WEB_URL}/billing`;

export const featuresBySegment = {
  Students: [
    {
      icon: CreditCard,
      title: "Student Profile",
      desc: "Showcase your projects, skills & achievements in one beautiful link.",
      tint: "linear-gradient(135deg, #06b6d4, #0891b2)",
    },
    {
      icon: BookOpen,
      title: "Portfolio Builder",
      desc: "Display your coursework, assignments & academic achievements beautifully.",
      tint: "linear-gradient(135deg, #0891b2, #0ea5e9)",
    },
    {
      icon: Award,
      title: "Certifications",
      desc: "Showcase all your certificates, badges & achievements in one place.",
      tint: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
    },
    {
      icon: Zap,
      title: "Quick Links",
      desc: "Share GitHub, portfolio, resume, social media with one link.",
      tint: "linear-gradient(135deg, #06b6d4, #10b981)",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      desc: "See who views your profile and what they engage with most.",
      tint: "linear-gradient(135deg, #10b981, #0891b2)",
    },
    {
      icon: Lightbulb,
      title: "Interview Ready",
      desc: "Impress recruiters with your polished digital presence.",
      tint: "linear-gradient(135deg, #0ea5e9, #10b981)",
    },
  ],
  Professionals: [
    {
      icon: Briefcase,
      title: "Executive Profile",
      desc: "A premium digital presence for career advancement and networking.",
      tint: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    },
    {
      icon: FileText,
      title: "Resume + Portfolio",
      desc: "Recruiter-ready resume with portfolio links in one tap.",
      tint: "linear-gradient(135deg, #6d28d9, #7c3aed)",
    },
    {
      icon: Users,
      title: "Network Showcase",
      desc: "Share your professional network and endorsements beautifully.",
      tint: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    },
    {
      icon: Target,
      title: "Job Search Ready",
      desc: "Highlight your experience, skills & achievements for opportunities.",
      tint: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    },
    {
      icon: Megaphone,
      title: "Thought Leadership",
      desc: "Share your articles, talks & expertise to establish authority.",
      tint: "linear-gradient(135deg, #6d28d9, #a78bfa)",
    },
    {
      icon: Clock,
      title: "Availability Status",
      desc: "Show your availability for projects, consulting & opportunities.",
      tint: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    },
  ],
  Businesses: [
    {
      icon: Store,
      title: "Shop Storefront",
      desc: "Showcase your products with images, prices & inventory in one link.",
      tint: "linear-gradient(135deg, #ec4899, #f43f5e)",
    },
    {
      icon: Sparkles,
      title: "Services Directory",
      desc: "List all your services with descriptions, pricing & booking links.",
      tint: "linear-gradient(135deg, #f43f5e, #fb923c)",
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      desc: "Track clicks, conversions & customer engagement in real-time.",
      tint: "linear-gradient(135deg, #fb923c, #ec4899)",
    },
    {
      icon: Link2,
      title: "Customer Links",
      desc: "Share booking, payment, review & contact links all in one place.",
      tint: "linear-gradient(135deg, #f87171, #f43f5e)",
    },
    {
      icon: QrCode,
      title: "Offline to Online",
      desc: "Print QR codes for stores, ads & materials to drive traffic.",
      tint: "linear-gradient(135deg, #ec4899, #f87171)",
    },
    {
      icon: Gift,
      title: "Loyalty Programs",
      desc: "Reward customers with referral codes and exclusive offers.",
      tint: "linear-gradient(135deg, #fb923c, #ec4899)",
    },
  ],
  Creators: [
    {
      icon: Megaphone,
      title: "Fan Hub",
      desc: "All your content, socials & shop links for fans in one place.",
      tint: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      icon: Palette,
      title: "Brand Showcase",
      desc: "Display your best work, collaborations & creative achievements.",
      tint: "linear-gradient(135deg, #d97706, #f59e0b)",
    },
    {
      icon: Rocket,
      title: "Monetization Hub",
      desc: "Sell courses, digital products, merch & subscriptions.",
      tint: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
    {
      icon: TrendingUp,
      title: "Performance Stats",
      desc: "See which content drives engagement and monetization.",
      tint: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    },
    {
      icon: Users,
      title: "Community Tools",
      desc: "Engage fans with polls, updates, exclusive content & more.",
      tint: "linear-gradient(135deg, #d97706, #fbbf24)",
    },
    {
      icon: Award,
      title: "Creator Collab",
      desc: "Showcase partnerships, sponsorships & brand collaborations.",
      tint: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
  ],
};

export const features = [
  {
    icon: CreditCard,
    title: "Digital Profile",
    desc: "One rich page for your identity — contact, work, education, business & links.",
    tint: "linear-gradient(135deg, #7c3aed, #ff5db1)",
  },
  {
    icon: Sparkles,
    title: "Card Studio",
    desc: "Build branded business cards, resumes & flyers from gorgeous templates.",
    tint: "linear-gradient(135deg, #ff5db1, #ff9d4d)",
  },
  {
    icon: Link2,
    title: "Smart Short Link",
    desc: "Claim clickcard.app/you — your single link to share everywhere.",
    tint: "linear-gradient(135deg, #22d3ee, #7c3aed)",
  },
  {
    icon: QrCode,
    title: "Dynamic QR",
    desc: "Auto-generated QR for every profile & card. Print it, scan it, done.",
    tint: "linear-gradient(135deg, #6d28d9, #22d3ee)",
  },
  {
    icon: FileText,
    title: "PDF Resume",
    desc: "Export a clean, recruiter-ready PDF of your profile in one tap.",
    tint: "linear-gradient(135deg, #ff9d4d, #ff5db1)",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "See views, clicks & scans. Know exactly what's working.",
    tint: "linear-gradient(135deg, #0ea5a3, #7c3aed)",
  },
  {
    icon: Gift,
    title: "Referrals & Rewards",
    desc: "Share your code, grow your network and unlock premium perks.",
    tint: "linear-gradient(135deg, #ff5db1, #7c3aed)",
  },
  {
    icon: Store,
    title: "Products & Catalogue",
    desc: "Showcase products, services & a storefront — perfect for businesses.",
    tint: "linear-gradient(135deg, #7c3aed, #a3e635)",
  },
];

export const segments = [
  { icon: GraduationCap, label: "Students", color: "bg-cyan-500" },
  { icon: Briefcase, label: "Professionals", color: "bg-purple-600" },
  { icon: Building2, label: "Businesses", color: "bg-pink-500" },
  { icon: Palette, label: "Creators", color: "bg-amber-500" },
];

export type TemplateKind = "Visiting Card" | "Resume" | "Profile" | "QR Poster";
export type TemplateCard = {
  id: string;
  name: string;
  kind: TemplateKind;
  gradient: string;
  accent: string;
  person: string;
  role: string;
  handle: string;
  avatar: string;
  initials: string;
  meta: string[]; // small per-design detail chips / lines
  premium?: boolean;
};

const avatar = (n: number) => `https://i.pravatar.cc/160?img=${n}`;

export const templates: TemplateCard[] = [
  {
    id: "aurora", name: "Aurora", kind: "Visiting Card",
    gradient: "linear-gradient(135deg,#7c3aed,#22d3ee)", accent: "#22d3ee",
    person: "Aarav Mehta", role: "Product Designer", handle: "clickcard.app/aarav",
    avatar: avatar(12), initials: "AM", meta: ["+91 98765 43210", "aarav@studio.co"],
  },
  {
    id: "sunset", name: "Sunset", kind: "Resume",
    gradient: "linear-gradient(135deg,#ff5db1,#ff9d4d)", accent: "#ff9d4d",
    person: "Sara Khan", role: "Frontend Engineer", handle: "clickcard.app/sara",
    avatar: avatar(45), initials: "SK", meta: ["React", "TypeScript", "Node", "Figma"],
  },
  {
    id: "mint", name: "Mint", kind: "Profile",
    gradient: "linear-gradient(135deg,#10b981,#22d3ee)", accent: "#10b981",
    person: "Diego Ruiz", role: "Music Producer", handle: "clickcard.app/diego",
    avatar: avatar(15), initials: "DR", meta: ["Spotify", "YouTube", "Book a session"],
  },
  {
    id: "grape", name: "Grape", kind: "Visiting Card",
    gradient: "linear-gradient(135deg,#6d28d9,#ff5db1)", accent: "#7c3aed",
    person: "Priya Nair", role: "Founder · Bloom Co.", handle: "clickcard.app/priya",
    avatar: avatar(31), initials: "PN", meta: ["bloom.co", "+91 90000 12345"], premium: true,
  },
  {
    id: "coral", name: "Coral", kind: "QR Poster",
    gradient: "linear-gradient(135deg,#ff9d4d,#ffd84d)", accent: "#ff9d4d",
    person: "Café Lumière", role: "Scan our menu", handle: "clickcard.app/lumiere",
    avatar: avatar(20), initials: "CL", meta: ["Open · 8am–10pm"],
  },
  {
    id: "ocean", name: "Ocean", kind: "Resume",
    gradient: "linear-gradient(135deg,#22d3ee,#6d28d9)", accent: "#22d3ee",
    person: "Liam Foster", role: "Data Scientist", handle: "clickcard.app/liam",
    avatar: avatar(33), initials: "LF", meta: ["Python", "ML", "SQL", "AWS"], premium: true,
  },
  {
    id: "bubblegum", name: "Bubblegum", kind: "Profile",
    gradient: "linear-gradient(135deg,#ff5db1,#9a73ff)", accent: "#ff5db1",
    person: "Mia Chen", role: "Content Creator", handle: "clickcard.app/mia",
    avatar: avatar(47), initials: "MC", meta: ["Instagram", "TikTok", "Shop"],
  },
];

export const steps = [
  {
    n: "01",
    title: "Create your profile",
    desc: "Sign up in seconds with email OTP, claim clickcard.app/you and add your details.",
    tint: "linear-gradient(135deg, #7c3aed, #22d3ee)",
  },
  {
    n: "02",
    title: "Design in the Studio",
    desc: "Pick a template and generate a branded card, resume or QR — fully yours in minutes.",
    tint: "linear-gradient(135deg, #ff5db1, #ff9d4d)",
  },
  {
    n: "03",
    title: "Share everywhere",
    desc: "Drop your link in a bio, tap an NFC card or let people scan your QR. You're connected.",
    tint: "linear-gradient(135deg, #a3e635, #22d3ee)",
  },
];

export const testimonials = [
  { name: "Aarav Mehta", role: "Product Designer", quote: "Replaced my paper cards entirely. People scan my QR and instantly have everything.", avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Sara Khan", role: "Frontend Engineer", quote: "Built a recruiter-ready resume in 4 minutes. The PDF export is gorgeous.", avatar: "https://i.pravatar.cc/80?img=45" },
  { name: "Priya Nair", role: "Founder, Bloom Co.", quote: "My whole storefront in one link — products, hours, maps. Customers love it.", avatar: "https://i.pravatar.cc/80?img=31" },
  { name: "Diego Ruiz", role: "Music Producer", quote: "All my links, Spotify and booking in one beautiful page. Pure magic.", avatar: "https://i.pravatar.cc/80?img=15" },
  { name: "Mia Chen", role: "Content Creator", quote: "The analytics tell me exactly what my audience clicks. Game changer.", avatar: "https://i.pravatar.cc/80?img=47" },
  { name: "Liam Foster", role: "Data Scientist", quote: "Clean, fast and professional. The referral rewards got me three free months.", avatar: "https://i.pravatar.cc/80?img=33" },
];

export const heroAvatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=45",
  "https://i.pravatar.cc/80?img=33",
  "https://i.pravatar.cc/80?img=47",
];

export const pricing = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlight: false,
    tagline: "For students & first-timers",
    features: ["1 digital profile", "5 links", "Standard QR", "1 card template", "Basic analytics"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/mo",
    highlight: true,
    tagline: "For professionals & creators",
    features: ["Everything in Free", "Unlimited links", "All Studio templates", "PDF resume export", "Custom QR & analytics", "Referral rewards"],
    cta: "Go Pro",
  },
  {
    name: "Business",
    price: "₹599",
    period: "/mo",
    highlight: false,
    tagline: "For teams & storefronts",
    features: ["Everything in Pro", "Product catalogue", "Business hours & maps", "Priority support", "Team profiles"],
    cta: "Scale up",
  },
];

export const stats = [
  { value: "50K+", label: "Profiles created" },
  { value: "1.2M+", label: "Link taps" },
  { value: "120+", label: "Templates" },
  { value: "4.9★", label: "User rating" },
];
