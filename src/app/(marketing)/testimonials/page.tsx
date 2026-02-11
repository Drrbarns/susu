import { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Hear from real users about their experience with JuliSmart Susu.",
};

const testimonials = [
  { name: "Ama Serwaa", location: "Osu, Accra", text: "JuliSmart Susu helped me save enough to stock my provisions shop. The daily reminders kept me accountable, and the MoMo payments are so convenient. I've now completed 3 cycles!", rating: 5, saved: "GHS 4,500" },
  { name: "Kwame Boateng", location: "Adum, Kumasi", text: "As a taxi driver, I used to struggle saving money. With Juli, I contribute GHS 20 daily and my group is like a family. I trust this system completely.", rating: 5, saved: "GHS 3,000" },
  { name: "Efua Mensah", location: "Takoradi", text: "The MoMo integration is seamless. I pay every morning before work. My payout helped me pay my children's school fees on time.", rating: 5, saved: "GHS 6,000" },
  { name: "Yaw Asante", location: "Tamale", text: "I created a group for my market women association. 25 of us contribute GHS 10 daily. It's transformed how we save together.", rating: 5, saved: "GHS 7,500" },
  { name: "Akosua Darko", location: "Cape Coast", text: "I was skeptical about digital susu at first, but the transparency won me over. I can see every contribution in real-time. No more disputes!", rating: 5, saved: "GHS 2,500" },
  { name: "Kofi Amponsah", location: "Tema", text: "Used my first payout as seed money for my small business. Now I'm in my second group with a higher daily amount. This platform is a game-changer.", rating: 5, saved: "GHS 9,000" },
];

export default function TestimonialsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-navy-50 to-white dark:from-navy-950 dark:to-navy-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">What Our Savers Say</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real Ghanaians who are building their financial future with JuliSmart Susu.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <Quote className="h-8 w-8 text-gold-300 mb-4" />
                <p className="text-foreground leading-relaxed flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Total Saved</div>
                    <div className="font-bold text-gold-600">{t.saved}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
