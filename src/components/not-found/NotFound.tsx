import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Main Icon Container */}
        <div className="relative mb-6 inline-block">
          <div className="relative bg-white rounded-full p-8 shadow-soft-hover">
            <div className="relative">
              <Search size={56} className="text-primary-500" strokeWidth={1.5} />
              <div className="absolute -top-4 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                !
              </div>
            </div>
          </div>

          {/* Floating dots */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-4 left-0 w-2 h-2 bg-primary-300 rounded-full opacity-30"></div>
          <div className="absolute top-8 left-4 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-40"></div>
        </div>

        {/* 404 Text */}
        <div className="mb-3">
          <h1 className="text-6xl font-bold text-slate-800 mb-2 tracking-tight">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-sm font-medium uppercase tracking-wider">Page Not Found</span>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Oops! You are lost
        </h2>

        {/* Description */}
        <p className="text-slate-600 text-base mb-2 leading-relaxed">
          The page you’re trying to access doesn’t exist or has been moved.
        </p>
        <p className="text-slate-500 text-sm mb-6">
          Don't worry, check the URL carefully
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold shadow-soft hover:shadow-soft-hover transition-all duration-200 text-sm"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Home size={18} />
            <span>Back to Dashboard</span>
          </button>
          
          <button 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-full font-semibold shadow-soft hover:shadow-soft transition-all duration-200 border border-slate-200 text-sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Help text */}
        <p className="mt-6 text-slate-500 text-xs">
          Need help? Contact Support
        </p>
      </div>
    </div>
  );
}
