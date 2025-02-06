const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
    <div className="text-center text-white">
      <svg
        className="w-16 h-16 mx-auto animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <h2 className="mt-4 text-xl font-semibold">Loading CHATBOT</h2>
      <p className="mt-2 text-sm opacity-75">
        Please wait while we set things up...
      </p>
    </div>
  </div>
);

export default LoadingScreen;
