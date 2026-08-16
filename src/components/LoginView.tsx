import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Mail, 
  AlertCircle 
} from 'lucide-react';
import { useStock } from '../context/StockContext';

export const LoginView: React.FC = () => {
  const { users, login } = useStock();

  const [userInput, setUserInput] = useState<string>('eduardo.silva@telefonica.com');
  const [passwordInput, setPasswordInput] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string>('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanInput = userInput.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMessage('Por favor, informe seu usuário ou e-mail.');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage('Por favor, informe sua senha.');
      return;
    }

    // Match by email, name, role or id
    const foundUser = users.find(
      u => u.email.toLowerCase() === cleanInput || 
           u.name.toLowerCase() === cleanInput ||
           u.id.toLowerCase() === cleanInput ||
           u.email.toLowerCase().includes(cleanInput) ||
           u.name.toLowerCase().includes(cleanInput) ||
           (cleanInput.includes('admin') && u.role === 'ADMIN') ||
           (cleanInput.includes('control') && u.role === 'CONTROLLER') ||
           (cleanInput.includes('visit') && u.role === 'VIEWER')
    );

    if (foundUser) {
      login(foundUser.id);
    } else if (users.length > 0) {
      // If entered a custom username/email, login as the primary admin or first user
      login(users[0].id);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail.trim()) {
      setForgotError('Informe seu e-mail corporativo ou usuário.');
      return;
    }

    // Simulate password recovery notification
    setForgotSuccess(true);
    setTimeout(() => {
      // allow user to close or auto reset
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F0F7] flex items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Centered Single Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-950/5 border border-purple-100/80 p-6 sm:p-8">
        
        {/* Vivo Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-[#660099] text-white px-4 py-1.5 rounded-xl shadow-xs font-black text-2xl tracking-tighter mb-3">
            vivo
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            EPI Control Pro
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Entre com suas credenciais corporativas
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* Usuário / E-mail */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-user-input"
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ex: eduardo.silva@telefonica.com"
                className="w-full pl-10 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660099] focus:outline-none transition-all"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Senha
              </label>
              <button
                type="button"
                id="btn-forgot-password-trigger"
                onClick={() => {
                  setForgotEmail(userInput);
                  setForgotSuccess(false);
                  setForgotError('');
                  setIsForgotModalOpen(true);
                }}
                className="text-[11px] font-semibold text-[#660099] hover:text-[#52007a] hover:underline cursor-pointer focus:outline-none"
              >
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Informe sua senha"
                className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#660099] focus:outline-none transition-all"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                id="btn-toggle-show-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Lembrar meu acesso */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#660099] focus:ring-[#660099] w-3.5 h-3.5 cursor-pointer"
              />
              <span>Lembrar meu usuário</span>
            </label>
          </div>

          {/* Botão Entrar */}
          <button
            id="btn-submit-login"
            type="submit"
            className="w-full py-3 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-bold text-sm shadow-md shadow-purple-950/15 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-3"
          >
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom subtle copyright */}
        <div className="text-center mt-6 pt-4 border-t border-purple-50">
          <p className="text-[11px] text-slate-400">
            © 2026 Vivo • Gestão de Almoxarifados
          </p>
        </div>

      </div>

      {/* Modal: Esqueci a Senha */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-150 relative">
            
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Recuperar Senha
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe seu e-mail corporativo para receber as instruções de redefinição de acesso.
            </p>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">E-mail de recuperação enviado!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Verifique a sua caixa de entrada para redefinir sua senha corporativa.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                {forgotError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail ou Usuário
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="usuario@telefonica.com"
                      className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#660099] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#660099] hover:bg-[#52007a] rounded-xl shadow-xs transition-all"
                  >
                    Enviar Instruções
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
