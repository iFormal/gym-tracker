import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4 z-[100]">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
            <span className="text-5xl">🏋️</span>
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-slate-600 mb-8">
            Looks like you've wandered off the workout path. Let's get you back
            on track!
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
