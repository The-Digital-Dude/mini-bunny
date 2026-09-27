import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Returns & Exchanges — Mini Bunny",
  description: "Our hassle-free size exchange and return policy. Shop with confidence at Mini Bunny.",
}

export default function ReturnsPage() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-20 px-4 text-center">
        <p className="text-amber-300 font-bold tracking-[0.2em] text-xs uppercase mb-4">Customer Care</p>
        <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">Returns & Size Exchanges</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base">
          Shop with total peace of mind. We make baby size exchanges and returns easy and straightforward.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl space-y-10">

        {/* At a glance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Exchange Window", value: "7 Days", note: "from date of delivery" },
            { label: "Quality Guarantee", value: "30 Days", note: "manufacturing defects" },
            { label: "Exchange Dispatch", value: "24–48h", note: "upon receiving return" },
          ].map((stat) => (
            <div key={stat.label} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">{stat.label}</p>
              <p className="text-3xl font-heading font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.note}</p>
            </div>
          ))}
        </div>

        {/* Eligibility */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 pb-2 border-b border-bunny-border">Exchange Eligibility</h2>
          <ul className="space-y-2 text-sm text-bunny-text-muted">
            <li className="flex gap-3"><span className="text-green-600 font-bold mt-0.5">✓</span> Item is unused, unworn, and unwashed</li>
            <li className="flex gap-3"><span className="text-green-600 font-bold mt-0.5">✓</span> Original brand tags and packaging intact</li>
            <li className="flex gap-3"><span className="text-green-600 font-bold mt-0.5">✓</span> Exchange initiated within 7 days of delivery</li>
            <li className="flex gap-3"><span className="text-red-500 font-bold mt-0.5">✗</span> Baby pacifiers, teethers, or personalized gift items cannot be returned for hygiene reasons</li>
            <li className="flex gap-3"><span className="text-red-500 font-bold mt-0.5">✗</span> Items washed with strong chemical detergents cannot be exchanged</li>
          </ul>
        </div>

        {/* How to Exchange */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 pb-2 border-b border-bunny-border">How to Exchange a Size</h2>
          <ol className="space-y-4">
            {[
              { step: "01", title: "Contact our team", desc: "Email support@minibunny.com or message our customer care with your Order Number and requested new size." },
              { step: "02", title: "Doorstep Pickup", desc: "Our courier partner will arrange pickup of the original unwashed item from your address." },
              { step: "03", title: "New Size Dispatched", desc: "As soon as the returned garment is received, we ship your replacement size immediately." },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <span className="text-3xl font-heading font-bold text-amber-300 leading-none shrink-0">{item.step}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-8 text-center space-y-3">
          <p className="font-bold text-gray-900">Need assistance with an exchange?</p>
          <p className="text-sm text-gray-600">Our customer team is available Sunday–Saturday, 9 AM – 9 PM BST.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/account" className="px-6 py-3 bg-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-600 transition-colors shadow-sm">
              View My Orders
            </Link>
            <a href="mailto:support@minibunny.com" className="px-6 py-3 border border-amber-200 bg-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-50 transition-colors">
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
