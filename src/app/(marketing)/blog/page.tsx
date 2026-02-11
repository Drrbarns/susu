import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Financial literacy tips and susu savings advice from JuliSmart Susu.",
};

const posts = [
  {
    title: "5 Ways Susu Can Help You Save for Business",
    excerpt: "Learn how traditional susu savings can fuel your entrepreneurial dreams in modern Ghana.",
    category: "Savings Tips",
    date: "Feb 10, 2026",
    readTime: "4 min read",
    slug: "#",
  },
  {
    title: "Understanding the Digital Susu Revolution",
    excerpt: "How technology is transforming the centuries-old susu system into a powerful financial tool.",
    category: "Industry",
    date: "Feb 5, 2026",
    readTime: "6 min read",
    slug: "#",
  },
  {
    title: "How to Choose the Right Susu Group",
    excerpt: "Tips for selecting a savings group that matches your financial goals and earning patterns.",
    category: "Guide",
    date: "Jan 28, 2026",
    readTime: "5 min read",
    slug: "#",
  },
  {
    title: "Mobile Money and Financial Inclusion in Ghana",
    excerpt: "How MoMo is breaking barriers to financial services for millions of Ghanaians.",
    category: "Industry",
    date: "Jan 20, 2026",
    readTime: "7 min read",
    slug: "#",
  },
  {
    title: "Setting Savings Goals That Stick",
    excerpt: "Practical strategies for setting and achieving your financial targets through consistent saving.",
    category: "Savings Tips",
    date: "Jan 15, 2026",
    readTime: "4 min read",
    slug: "#",
  },
  {
    title: "The History of Susu in West Africa",
    excerpt: "Exploring the rich tradition of rotating savings and credit associations across the region.",
    category: "Culture",
    date: "Jan 8, 2026",
    readTime: "8 min read",
    slug: "#",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Financial literacy tips, savings strategies, and susu culture.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.title} href={post.slug}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 flex flex-col h-full">
                  <Badge variant="secondary" className="self-start mb-3">{post.category}</Badge>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-gold-600 transition-colors">{post.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                    <span>{post.date}</span>
                  </div>
                  <div className="mt-3 text-gold-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
