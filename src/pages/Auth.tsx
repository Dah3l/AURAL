import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { AuralLogo } from '../components/shared/AuralLogo';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error);
        } else {
          toast.success('¡Bienvenido de vuelta!');
          navigate('/');
        }
      } else {
        if (!username.trim()) {
          toast.error('El nombre de usuario es obligatorio');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, username);
        if (error) {
          toast.error(error);
        } else {
          toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast.error('Algo se desafinó. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080C] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AuralLogo size={64} animated />
          </div>
          <h1 className="text-3xl font-bold text-[#F5F5F7] tracking-tight">aural</h1>
          <p className="text-[#8B8B96] mt-1">El sonido, sin ruido.</p>
        </div>

        {/* Form */}
        <div className="bg-[#131318] border border-[#2A2A35] rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-[#F5F5F7] mb-6">
            {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu_usuario"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-aura-glow text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#8B8B96]">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              {' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#A78BFA] hover:text-[#7C3AED] font-medium transition-colors"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#8B8B96]/50 mt-6">
          Sin anuncios · Sin límites · Solo música
        </p>
      </motion.div>
    </div>
  );
}
