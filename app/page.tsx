import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 bg-[#1B4332] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-black text-2xl">S</span>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4">Sylo Social Posts</h1>
        <p className="text-lg text-gray-500 mb-10">
          Design, customize, and export beautiful social media posts for your brand.
        </p>
        <Link
          href="/design"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg"
        >
          Open Design Studio
        </Link>
      </div>
    </div>
  );
}
