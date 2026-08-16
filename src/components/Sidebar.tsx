import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ClipboardList, 
  Layers, 
  Building2, 
  Users, 
  MapPin, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Download, 
  Upload, 
  Shield,
  Box,
  Eye,
  Sliders,
  Sparkles,
  Lock
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { TabType, UserRole } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenQuickBatchModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenQuickBatchModal
}) => {
  const { 
    locations, 
    selectedLocationId, 
    setSelectedLocationId, 
    items,
    users,
    currentUser,
    setCurrentUserId,
    isCurrentUserAdmin,
    isCurrentUserController,
    isCurrentUserViewer,
    userAccessibleLocations,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaultData
  } = useStock();

  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Critical stock count
  const criticalItemsCount = items.filter(i => {
    const isLocMatch = selectedLocationId === 'ALL' || i.locationId === selectedLocationId;
    return isLocMatch && i.quantity <= i.minQuantity;
  }).length;

  const handleExport = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vivo-epi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowBackupMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const ok = importBackupJSON(content);
        if (ok) {
          alert('Dados restaurados com sucesso a partir do arquivo!');
        } else {
          alert('Falha ao importar: arquivo JSON inválido.');
        }
        setShowBackupMenu(false);
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja realmente restaurar os dados de demonstração padrão da Vivo? Todos os registros personalizados serão resetados.')) {
      resetToDefaultData();
      setShowBackupMenu(false);
    }
  };

  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Painel Geral',
      icon: BarChart3,
      badge: null,
      description: 'Visão executiva e KPIs'
    },
    {
      id: 'items' as TabType,
      label: 'Itens & EPIs',
      icon: Package,
      badge: criticalItemsCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
          {criticalItemsCount}
        </span>
      ) : null,
      description: 'Catálogo e saldos'
    },
    {
      id: 'movements' as TabType,
      label: 'Movimentações',
      icon: ClipboardList,
      badge: null,
      description: 'Entradas, saídas e lotes'
    },
    {
      id: 'kits' as TabType,
      label: 'Kits & Gargalos',
      icon: Layers,
      badge: (
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-100 text-[#660099] border border-purple-200 uppercase">
          Auto
        </span>
      ),
      description: 'Análise de disponibilidade'
    },
    {
      id: 'locations' as TabType,
      label: 'Almoxarifados',
      icon: Building2,
      badge: (
        <span className="text-[11px] text-slate-400 font-medium">
          {locations.length}
        </span>
      ),
      description: 'Obras e estoques locais'
    },
    {
      id: 'users' as TabType,
      label: 'Usuários & Acessos',
      icon: Users,
      badge: (
        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-[#660099]">
          {users.length}
        </span>
      ),
      description: 'Perfis e vínculo de estoque'
    },
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const getUserRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3 h-3 text-[#660099]" />;
      case 'CONTROLLER':
        return <Box className="w-3 h-3 text-blue-600" />;
      case 'VIEWER':
        return <Eye className="w-3 h-3 text-slate-600" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Setinha Lateral (Arrow Toggle Button attached directly on the side of menu for desktop & mobile) */}
        <button
          id="sidebar-side-arrow-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-5 z-50 w-8 h-8 bg-[#660099] hover:bg-[#52007a] text-white border-2 border-white shadow-lg shadow-purple-950/30 rounded-full items-center justify-center cursor-pointer transition-all duration-200 hover:scale-115 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#660099]/40 group"
          title={isCollapsed ? "Clique na setinha para abrir o menu lateral" : "Clique na setinha para fechar o menu lateral"}
          aria-label="Abrir ou fechar menu lateral"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[3] transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[3] transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>

        {/* Setinha para fechar no Mobile */}
        {isMobileOpen && (
          <button
            id="sidebar-mobile-close-arrow"
            onClick={() => setIsMobileOpen(false)}
            className="flex lg:hidden absolute -right-3.5 top-4 z-50 w-7 h-7 bg-[#660099] text-white border border-white shadow-md rounded-full items-center justify-center cursor-pointer active:scale-90"
            title="Fechar menu lateral"
            aria-label="Fechar menu lateral"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>
        )}

        {/* Active Almoxarifado Filter / Switcher */}
        <div className="p-3 border-b border-purple-50 bg-[#FAF7FC]">
          {!isCollapsed ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-[#660099] tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#660099]" />
                  Almoxarifado Ativo
                </span>
                {currentUser.locationId !== 'ALL' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Vinculado
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  id="sidebar-location-select"
                  value={selectedLocationId}
                  disabled={currentUser.locationId !== 'ALL' && isCurrentUserController}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className={`w-full text-xs font-semibold text-slate-800 bg-white border border-purple-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#660099] focus:outline-none cursor-pointer shadow-2xs hover:border-[#660099] ${
                    currentUser.locationId !== 'ALL' && isCurrentUserController ? 'opacity-80 bg-slate-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isCurrentUserAdmin || currentUser.locationId === 'ALL' ? (
                    <>
                      <option value="ALL">🏢 Todas as Localidades ({locations.length})</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          📍 {loc.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    locations.filter(l => l.id === currentUser.locationId).map(loc => (
                      <option key={loc.id} value={loc.id}>
                        📍 {loc.name} (Seu Estoque)
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Localidade Ativa">
              <button 
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#660099] border border-purple-200 flex items-center justify-center transition-colors"
                title={`Localidade: ${selectedLocationId === 'ALL' ? 'Todas' : locations.find(l => l.id === selectedLocationId)?.name}`}
              >
                <MapPin className="w-4 h-4 text-[#660099]" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                className={`w-full group flex items-center rounded-xl transition-all duration-150 cursor-pointer ${
                  isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3 justify-between'
                } ${
                  isActive
                    ? 'bg-[#660099] text-white shadow-sm font-semibold shadow-purple-900/20'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-[#660099] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#660099]'
                  }`} />
                  
                  {!isCollapsed && (
                    <span className="text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <div className="shrink-0 ml-auto">
                    {item.badge}
                  </div>
                )}
              </button>
            );
          })}

          {/* Quick Action Button inside Navigation */}
          {!isCurrentUserViewer && (
            <div className="pt-3">
              {!isCollapsed ? (
                <button
                  id="sidebar-quick-batch-btn"
                  onClick={() => {
                    onOpenQuickBatchModal();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#660099] to-[#9933CC] hover:from-[#52007a] hover:to-[#8022b3] text-white text-xs font-bold shadow-sm shadow-purple-950/15 transition-all active:scale-98 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-purple-200" />
                  <span>Lançamento em Lote</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenQuickBatchModal();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  title="Lançamento em Lote Diário"
                  className="w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-tr from-[#660099] to-[#9933CC] text-white hover:opacity-90 shadow-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Bottom Panel: User Profile & Role + Backup & Data Settings */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/70 space-y-2">
          
          {/* User Profile Card with Quick Switch Dropdown */}
          <div className="relative">
            {!isCollapsed ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 shadow-2xs transition-all cursor-pointer"
                title="Clique para alternar de usuário"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  currentUser.role === 'ADMIN' 
                    ? 'bg-purple-100 text-[#660099]' 
                    : currentUser.role === 'CONTROLLER'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                    {getUserRoleIcon(currentUser.role)}
                    <span>
                      {currentUser.role === 'ADMIN' ? 'Administrador' : currentUser.role === 'CONTROLLER' ? 'Controlador' : 'Visualizador'}
                    </span>
                  </div>
                </div>

                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Sessão Ativa" />
              </button>
            ) : (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full flex justify-center p-2 rounded-xl bg-white border border-purple-100 hover:bg-purple-50 text-[#660099] font-bold text-xs"
                title={`Usuário: ${currentUser.name} (${currentUser.role})`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'ADMIN' 
                    ? 'bg-purple-100 text-[#660099]' 
                    : currentUser.role === 'CONTROLLER'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
              </button>
            )}

            {/* Quick Switch User Dropdown Popover */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-purple-200 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-700">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#660099] uppercase tracking-wider border-b border-purple-100 mb-1 flex items-center justify-between">
                  <span>Alternar Usuário</span>
                  <span className="text-[10px] text-slate-400 font-normal">{users.length} usuários</span>
                </div>
                
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserId(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center justify-between transition-colors ${
                        u.id === currentUser.id ? 'bg-purple-50 font-bold text-[#660099]' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs truncate font-bold text-slate-800">{u.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {u.role === 'ADMIN' ? '👑 Admin Geral' : u.role === 'CONTROLLER' ? '📦 Controlador' : '👁️ Visualizador'}
                          {u.locationId !== 'ALL' && ` • ${locations.find(l => l.id === u.locationId)?.code || 'Local'}`}
                        </p>
                      </div>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] bg-[#660099] text-white px-1.5 py-0.5 rounded font-bold">
                          Ativo
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="px-2 pt-2 border-t border-purple-100 mt-1">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserDropdown(false);
                    }}
                    className="w-full py-1.5 text-center text-xs font-bold text-[#660099] hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Gerenciar Todos os Usuários →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Backup dropdown toggle */}
          <div className="relative">
            <button
              id="sidebar-backup-btn"
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className={`w-full flex items-center rounded-lg text-xs font-semibold text-slate-600 hover:bg-purple-100/60 hover:text-[#660099] p-2 transition-colors ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Backup e Dados do Sistema"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#660099]" />
                {!isCollapsed && <span>Dados & Backup</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-[#660099]">
                  JSON
                </span>
              )}
            </button>

            {showBackupMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-purple-200 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-700">
                <div className="px-3 py-1 text-[10px] font-bold text-[#660099] uppercase tracking-wider border-b border-purple-100 mb-1">
                  Gerenciamento de Dados
                </div>
                
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#660099]" />
                  Exportar Backup (JSON)
                </button>

                <label className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <Upload className="w-3.5 h-3.5 text-[#660099]" />
                  Importar Backup (JSON)
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>

                {isCurrentUserAdmin && (
                  <button
                    onClick={handleReset}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-purple-100 mt-1 font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    Restaurar Demonstração
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Arrow Toggle Footer Button (as an additional helper) */}
          <button
            id="sidebar-toggle-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 px-2 text-xs font-semibold text-slate-500 hover:text-[#660099] hover:bg-purple-100/50 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#660099]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#660099]" />
                <span className="text-xs">Recolher Menu</span>
              </>
            )}
          </button>

        </div>
      </aside>
    </>
  );
};
