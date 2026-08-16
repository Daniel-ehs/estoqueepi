import React, { useState } from 'react';
import { 
  Menu, 
  LogOut, 
  ShieldCheck, 
  Shield, 
  Box, 
  Eye, 
  ChevronDown, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { TabType, UserRole } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateUsers?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateUsers,
  onLogout
}) => {
  const { 
    currentUser, 
    currentUserId, 
    setCurrentUserId, 
    users, 
    locations,
    logout
  } = useStock();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
    logout();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-[#660099] border border-purple-200">
            <Shield className="w-3 h-3 text-[#660099]" />
            Admin
          </span>
        );
      case 'CONTROLLER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            <Box className="w-3 h-3 text-blue-700" />
            Controlador
          </span>
        );
      case 'VIEWER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
            <Eye className="w-3 h-3 text-slate-600" />
            Visualizador
          </span>
        );
    }
  };

  return (
    <>
      <header className="bg-white border-b border-purple-100/80 sticky top-0 z-30 shadow-xs h-16">
        <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between">
          
          {/* Left Side: Sidebar Toggle & Vivo Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar toggle button */}
            <button
              id="header-toggle-sidebar-btn"
              onClick={onToggleSidebar}
              className="p-2 -ml-1.5 rounded-xl text-slate-600 hover:text-[#660099] hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#660099]/30 cursor-pointer"
              title="Alternar Menu Lateral"
              aria-label="Abrir ou recolher menu"
            >
              <Menu className="w-5 h-5 text-[#660099]" />
            </button>

            {/* Vivo Logo & App Identity */}
            <div className="flex items-center gap-2.5">
              {/* Vivo Iconic Logo Mark */}
              <div className="flex items-center justify-center bg-[#660099] text-white px-3 py-1.5 rounded-xl shadow-xs">
                <span className="font-extrabold text-lg sm:text-xl tracking-tighter leading-none select-none">
                  vivo
                </span>
              </div>

              {/* Vertical Divider */}
              <div className="h-6 w-[1.5px] bg-slate-200 hidden sm:block" />

              {/* System Title */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                    EPI Control Pro
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#660099] border border-purple-200">
                    <ShieldCheck className="w-3 h-3 text-[#660099]" />
                    NR-6
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline leading-tight">
                  Gestão Integrada de Almoxarifado & Estoque
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Active User Switcher Pill & Sair (Logout) Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active User Switcher Dropdown */}
            <div className="relative">
              <button
                id="header-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-all cursor-pointer"
                title="Usuário Conectado - Clique para alternar perfil"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'ADMIN' 
                    ? 'bg-purple-100 text-[#660099]' 
                    : currentUser.role === 'CONTROLLER'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-none">
                    {currentUser.role === 'ADMIN' ? 'Admin Geral' : currentUser.role === 'CONTROLLER' ? 'Controlador' : 'Visualizador'}
                  </span>
                </div>

                <div className="hidden sm:block">
                  {getRoleBadge(currentUser.role)}
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Selector Popover */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-purple-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-purple-50 bg-[#FAF7FC]">
                    <p className="text-[10px] uppercase font-bold text-[#660099] tracking-wider">
                      Sessão Atual
                    </p>
                    <p className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {getRoleBadge(currentUser.role)}
                      <span className="text-[10px] text-slate-600 truncate">
                        {currentUser.locationId === 'ALL' 
                          ? '🏢 Todas as Localidades' 
                          : `📍 ${locations.find(l => l.id === currentUser.locationId)?.name || 'Local'}`}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Alternar para outro perfil ({users.length}):
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUserId(user.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center justify-between transition-colors ${
                          user.id === currentUserId ? 'bg-purple-50/80 font-bold text-[#660099]' : ''
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs truncate font-bold text-slate-800">{user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {user.role === 'ADMIN' ? '👑 Administrador' : user.role === 'CONTROLLER' ? '📦 Controlador' : '👁️ Visualizador'}
                            {user.locationId !== 'ALL' && ` • ${locations.find(l => l.id === user.locationId)?.code || 'Local'}`}
                          </p>
                        </div>
                        {user.id === currentUserId ? (
                          <span className="text-[10px] bg-[#660099] text-white px-1.5 py-0.5 rounded-full font-bold">
                            Conectado
                          </span>
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {onNavigateUsers && (
                    <div className="p-2 border-t border-purple-50 mt-1">
                      <button
                        onClick={() => {
                          onNavigateUsers();
                          setShowUserMenu(false);
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-[#660099] hover:bg-purple-50 rounded-xl transition-colors"
                      >
                        Gerenciar Usuários & Permissões →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#660099] flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 text-[#660099]" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Encerrar Sessão no Vivo EPI Control
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Deseja realmente sair do sistema? Seus dados permanecem seguros no seu navegador.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                id="cancel-logout-btn"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-logout-btn"
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#660099] hover:bg-[#52007a] rounded-xl shadow-md shadow-purple-950/20 transition-all active:scale-95 cursor-pointer"
              >
                Confirmar Saída
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
