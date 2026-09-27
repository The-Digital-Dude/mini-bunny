import { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ — Mini Bunny",
  description: "Frequently asked questions about orders, baby clothing sizing, shipping, returns, and organic cotton care at Mini Bunny.",
}

const faqs = [
  {
    category: "Orders & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bKash, Nagad, Rocket, all major credit & debit cards (Visa, Mastercard), and Cash on Delivery (COD) across Bangladesh.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement. Contact us immediately at support@minibunny.com or via our WhatsApp support.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes — COD is available for all orders across Bangladesh with reliable door-to-door delivery.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Dhaka metropolitan: 1–2 business days. Outside Dhaka: 2–4 business days. All baby garments are packed in sterile, sealed protective bags.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free delivery across Bangladesh on all orders above ৳2,000.",
      },
      {
        q: "How do I track my order?",
        a: "Once your parcel is handed over to our courier partner (Pathao / Steadfast), you will receive an SMS and email with your tracking link.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is your size exchange policy?",
        a: "We offer a 7-day hassle-free size exchange guarantee for unwashed, unworn baby garments with tags attached.",
      },
      {
        q: "How do I initiate an exchange?",
        a: "Email support@minibunny.com with your order number and desired replacement size, or contact us through our website chat.",
      },
    ],
  },
  {
    category: "Product, Fabric & Care",
    items: [
      {
        q: "How do I choose the right baby size?",
        a: "Check our Size Guide and try our interactive Size Finder quiz. Because babies grow quickly, we generally suggest sizing up if your baby is between measurements.",
      },
      {
        q: "How should I wash Mini Bunny baby clothes?",
        a: "Machine wash cold or 30°C on a gentle cycle using mild baby-friendly detergent. Avoid harsh chlorine bleaches. Tumble dry on low or line dry in the shade.",
      },
      {
        q: "Are the fabrics safe for newborn sensitive skin?",
        a: "Yes! 100% of our babywear is crafted from GOTS certified organic cotton, dyed with non-toxic infant-safe dyes, and crafted with nickel-free snaps and flat seams.",
      },
    ],
  },
]

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  }

  return (
    <div className="animate-in fade-in duration-500">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* Hero */}
      <div className="bg-stone-900 text-white py-20 px-4 text-center">
        <p className="text-amber-300 font-bold tracking-[0.2em] text-xs uppercase mb-4">Support & FAQ</p>
        <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base">
          Everything you need to know about shopping with Mini Bunny — from sizing and organic cotton care to delivery and exchanges.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-14">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-6 pb-2 border-b border-bunny-border">
              {section.category}
            </h2>
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.q} className="space-y-2">
                  <h3 className="font-bold text-bunny-navy text-sm">{item.q}</h3>
                  <p className="text-sm text-bunny-text-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-8 text-center space-y-3">
          <p className="font-bold text-bunny-navy">Still have questions?</p>
          <p className="text-sm text-bunny-text-muted">Our customer care team is here to assist you every day from 9 AM – 9 PM.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="mailto:support@minibunny.com" className="px-6 py-3 bg-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-600 transition-colors shadow-sm">
              Email Us
            </a>
            <a href="/contact" className="px-6 py-3 border border-amber-200 bg-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-50 transition-colors">
              Contact Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
