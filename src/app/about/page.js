export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in text-gray-900">About Nestio</h1>
        
        <div className="space-y-6">
          <section className="animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              At Nestio, we&apos;re dedicated to making hotel booking simple, transparent, and affordable. 
              We believe everyone deserves to find their perfect stay without the hassle of complex booking processes.
            </p>
          </section>

          <section className="animate-slide-up [animation-delay:200ms]">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Wide selection of hotels across various locations</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Detailed hotel information and reviews</li>
              <li>Easy-to-use booking interface</li>
              <li>24/7 customer support</li>
            </ul>
          </section>

          <section className="animate-slide-up [animation-delay:400ms]">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Best Price Guarantee</h3>
                <p className="text-gray-700">We offer competitive rates and price matching to ensure you get the best deal.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Verified Reviews</h3>
                <p className="text-gray-700">All our reviews are from verified guests, helping you make informed decisions.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Secure Booking</h3>
                <p className="text-gray-700">Your booking is secure with our encrypted payment system.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Customer Support</h3>
                <p className="text-gray-700">Our dedicated team is here to help you 24/7.</p>
              </div>
            </div>
          </section>

          <section className="animate-slide-up [animation-delay:600ms]">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              Founded in 2024, Nestio emerged from a simple idea: make hotel booking accessible to everyone. 
              We&apos;ve grown from a small startup to a trusted platform, serving thousands of travelers worldwide. 
              Our commitment to customer satisfaction and innovation continues to drive us forward.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 