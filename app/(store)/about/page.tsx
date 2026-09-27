export const metadata = {
  title: "About Us — Mini Bunny",
  description: "The story behind Mini Bunny — premium organic baby and kids clothing in Bangladesh.",
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 prose prose-sm">
      <h1>About Mini Bunny</h1>

      <p className="lead">
        Mini Bunny is a Bangladesh-based baby and kids brand dedicated to crafting ultra-soft, safe, and breathable clothing for your little ones.
      </p>

      <h2>Our Story</h2>
      <p>
        Founded by parents who wanted only the purest, most comfortable fabrics for their newborn, Mini Bunny was born out of love. We believe that everyday baby essentials should feel heavenly, look adorable, and make parenting just a little easier.
      </p>

      <h2>Our Fabric & Safety Promise</h2>
      <p>
        A baby's skin is ultra-sensitive. That's why every Mini Bunny piece is crafted from 100% GOTS certified organic cotton, dyed with non-toxic infant-safe colors, and finished with smooth flat-lock seams and nickel-free snap buttons.
      </p>

      <h2>Our Values</h2>
      <ul>
        <li><strong>Pure & Gentle</strong> — only 100% organic, breathable, and hypoallergenic cotton.</li>
        <li><strong>Designed for Milestones</strong> — easy-dressing features like 2-way zippers and expandable necklines.</li>
        <li><strong>Made in Bangladesh</strong> — crafted with care by skilled local artisans adhering to strict ethical standards.</li>
      </ul>

      <h2>Get in Touch</h2>
      <p>
        Have questions or need assistance picking the right size? Visit our <a href="/contact">contact page</a> or email us at{" "}
        <a href="mailto:support@minibunny.com">support@minibunny.com</a>.
      </p>
    </div>
  )
}
