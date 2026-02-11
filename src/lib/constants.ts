export const APP_NAME = "Juli Smart Susu";
export const APP_TAGLINE = "Your Savings, Our Priority";
export const APP_DESCRIPTION =
  "Join trusted susu groups in Ghana. Daily contributions, guaranteed payouts. Save together, prosper together with Juli Smart Susu.";
export const APP_URL = "https://julismartsusu.com";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Plans", href: "/plans" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Plans & Pricing", href: "/plans" },
    { label: "Group Rules", href: "/group-rules" },
    { label: "Testimonials", href: "/testimonials" },
  ],
  company: [
    { label: "About Us", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/privacy" },
  ],
} as const;

export const APP_NAV_ITEMS = [
  { label: "Home", href: "/app/dashboard", icon: "home" },
  { label: "Groups", href: "/app/groups", icon: "users" },
  { label: "Pay", href: "/app/pay", icon: "circle-dollar-sign" },
  { label: "Wallet", href: "/app/wallet", icon: "wallet" },
  { label: "Profile", href: "/app/profile", icon: "user" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "layout-dashboard" },
  { label: "Groups", href: "/admin/groups", icon: "users" },
  { label: "Members", href: "/admin/users", icon: "user-check" },
  { label: "Payouts", href: "/admin/payouts", icon: "banknote" },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: "arrow-down-to-line" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
  { label: "Audit Log", href: "/admin/audit", icon: "scroll-text" },
  { label: "SMS", href: "/admin/sms", icon: "message-square" },
] as const;

export const GROUP_TYPES = {
  public: { label: "Public", description: "Anyone can join instantly" },
  request: { label: "Request", description: "Admin approval required to join" },
  paid: { label: "Paid", description: "Join fee required" },
} as const;

export const GROUP_STATUSES = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  open: { label: "Open", color: "bg-green-100 text-green-700" },
  active: { label: "Active", color: "bg-blue-100 text-blue-700" },
  paused: { label: "Paused", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-purple-100 text-purple-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
} as const;
