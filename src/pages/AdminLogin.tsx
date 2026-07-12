import { useState } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Check
} from 'lucide-react';
import { SEO } from '@/components/SEO';

interface AdminLoginProps {
  onLogin?: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Demo admin credentials (in production, this would be backend authenticated)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'peplab2026',
    role: 'full-admin' as const,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (credentials.username === ADMIN_CREDENTIALS.username && 
        credentials.password === ADMIN_CREDENTIALS.password) {
      
      // For demo, skip 2FA or show it
      if (show2FA) {
        // Verify 2FA code (demo: any 6 digits)
        if (twoFactorCode.length === 6) {
          completeLogin();
        } else {
          setError('Invalid 2FA code');
          setIsLoading(false);
        }
      } else {
        // Show 2FA prompt (optional in demo)
        setShow2FA(true);
        setIsLoading(false);
      }
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  const completeLogin = () => {
    // Store admin session
    localStorage.setItem('peplab_admin_logged_in', 'true');
    localStorage.setItem('peplab_admin_role', ADMIN_CREDENTIALS.role);
    localStorage.setItem('peplab_admin_username', ADMIN_CREDENTIALS.username);
    
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <>
      <SEO title="Admin sign in | PEPLAB" noIndex />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex flex-col items-start">
            <span className="text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
              PEPLAB
            </span>
            <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
              PEPTIDES AUSTRALIA
            </span>
          </a>
          <a
            href="/login"
            className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User Login
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          {/* Admin Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
              <Shield className="w-5 h-5 text-[#EF4444]" />
              <span className="text-sm font-medium text-[#EF4444]">Admin Portal</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F6FA] mb-2">
                Admin <span className="gradient-text">Login</span>
              </h1>
              <p className="text-[#A9B3C7]">
                {show2FA ? 'Enter 2FA code to continue' : 'Sign in to access the admin dashboard'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
                <span className="text-sm text-[#EF4444]">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!show2FA ? (
                <>
                  {/* Username */}
                  <div>
                    <label className="block text-sm text-[#A9B3C7] mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                      <input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#EF4444] transition-colors"
                        placeholder="Enter admin username"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-[#A9B3C7] mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        required
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#EF4444] transition-colors"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A9B3C7] hover:text-[#F4F6FA]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* 2FA Code */
                <div>
                  <label className="block text-sm text-[#A9B3C7] mb-2">2FA Code</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#EF4444] transition-colors text-center tracking-[0.5em] text-lg"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-xs text-[#A9B3C7] mt-2 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#EF4444] text-white font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : show2FA ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Verify & Login</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Login as Admin</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
              <p className="text-xs text-[#F59E0B] font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-[#A9B3C7]">Username: <span className="text-[#F4F6FA]">admin</span></p>
              <p className="text-xs text-[#A9B3C7]">Password: <span className="text-[#F4F6FA]">peplab2026</span></p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-[#A9B3C7]">
            © 2026 PEPLAB Admin Portal. Authorized personnel only.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
