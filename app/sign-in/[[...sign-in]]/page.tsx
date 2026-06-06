import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#4338ca 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            P
          </div>
          <h1 className="text-3xl font-bold text-white">PersonalHub</h1>
          <p className="text-indigo-300 mt-2 text-sm">Sign in to access your dashboard</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
