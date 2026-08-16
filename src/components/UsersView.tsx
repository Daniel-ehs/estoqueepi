import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Box, 
  Eye, 
  Search, 
  Building2, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  UserCheck, 
  Sparkles, 
  AlertCircle,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { AppUser, UserRole } from '../types';

interface UsersViewProps {
  onOpenNewUser: () => void;
  onOpenEditUser: (user: AppUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onOpenNewUser, onOpenEditUser }) => {
  const { 
    users, 
    locations, 
    currentUser, 
    currentUserId, 
    setCurrentUserId, 
    deleteUser, 
    isCurrentUserAdmin 
  } = useStock();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATIVO' | 'INATIVO'>('ALL');

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.department && user.department.toLowerCase().includes(searchLower));

      // Role
      const matchRole = roleFilter === 'ALL' || user.role === roleFilter;

      // Location
      const matchLoc = locationFilter === 'ALL' || user.locationId === locationFilter;

      // Status
      const matchStatus = statusFilter === 'ALL' || user.status === statusFilter;

      return matchSearch && matchRole && matchLoc && matchStatus;
    });
  }, [users, searchTerm, roleFilter, locationFilter, statusFilter]);

  const handleDelete = (user: AppUser) => {
    if (!isCurrentUserAdmin) {
      alert('Apenas administradores do sistema podem excluir usuários.');
      return;
    }

    if (user.id === currentUserId) {
      alert('Você não pode excluir o usuário com o qual está conectado atualmente.');
      return;
    }

    if (window.confirm(`Deseja realmente remover o usuário "${user.name}"?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#660099] border border-purple-200">
            <Shield className="w-3 h-3 text-[#660099]" />
            Administrador
          </span>
        );
      case 'CONTROLLER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Box className="w-3 h-3 text-blue-700" />
            Controlador
          </span>
        );
      case 'VIEWER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Eye className="w-3 h-3 text-slate-600" />
            Visualizador
          </span>
        );
    }
  };

  const getLocationName = (locationId: string | 'ALL') => {
    if (locationId === 'ALL') return '🏢 Todas as Localidades';
    const loc = locations.find(l => l.id === locationId);
    return loc ? `📍 ${loc.name}` : '📍 Almoxarifado Não Encontrado';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Gestão de Usuários & Níveis de Acesso
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Cadastre operadores, vincule ao estoque correspondente e atribua perfis de Administrador, Controlador ou Visualizador.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentUserAdmin ? (
            <button
              id="users-add-btn"
              onClick={onOpenNewUser}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#660099] hover:bg-[#52007a] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-purple-950/20 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Usuário</span>
            </button>
          ) : (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Apenas Administradores podem adicionar ou editar usuários.</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card Admin */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#660099] text-white">
                <Shield className="w-3.5 h-3.5" />
                Administrador do Sistema
              </span>
              <span className="text-xs font-bold text-purple-900">
                {users.filter(u => u.role === 'ADMIN').length} usuário(s)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Controle global irrestrito: cadastra usuários, cria almoxarifados, configura kits, executa inventários e exporta dados.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-purple-50 text-[11px] text-[#660099] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Visão Global • Todos os Almoxarifados
          </div>
        </div>

        {/* Card Controller */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-600 text-white">
                <Box className="w-3.5 h-3.5" />
                Controlador de Estoque
              </span>
              <span className="text-xs font-bold text-blue-900">
                {users.filter(u => u.role === 'CONTROLLER').length} usuário(s)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Gerencia o estoque local: registra entradas, saídas, baixas em lote, transferências e ajustes do almoxarifado vinculado.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-blue-50 text-[11px] text-blue-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Operação Total no Estoque Vinculado
          </div>
        </div>

        {/* Card Viewer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-700 text-white">
                <Eye className="w-3.5 h-3.5" />
                Visualizador
              </span>
              <span className="text-xs font-bold text-slate-800">
                {users.filter(u => u.role === 'VIEWER').length} usuário(s)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Somente leitura: consulta níveis de estoque, saldos de EPIs, histórico de movimentações e cálculo de gargalo de kits.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Modo Consulta • Sem Permissão de Edição
          </div>
        </div>

      </div>

      {/* Interactive Active User Switcher Bar */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-purple-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">
                  Sessão Ativa Atualmente
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#660099]">
                  {currentUser.role === 'ADMIN' ? 'Admin Geral' : currentUser.role === 'CONTROLLER' ? 'Controlador' : 'Visualizador'}
                </span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white">
                {currentUser.name} <span className="text-xs font-normal text-purple-200">({currentUser.email})</span>
              </p>
              <p className="text-xs text-purple-200">
                Vinculado a: <strong className="text-white">{getLocationName(currentUser.locationId)}</strong>
              </p>
            </div>
          </div>

          {/* Quick Switch Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-200 font-medium whitespace-nowrap">
              Simular login como:
            </span>
            <select
              id="users-simulate-select"
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="bg-purple-950 text-white border border-purple-600 text-xs font-semibold px-3 py-2 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'ADMIN' ? 'Admin' : u.role === 'CONTROLLER' ? 'Controlador' : 'Visualizador'} - {u.locationId === 'ALL' ? 'Geral' : locations.find(l => l.id === u.locationId)?.code || 'Local'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail ou área..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#660099] focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#660099]"
            >
              <option value="ALL">🛡️ Todos os Perfis ({users.length})</option>
              <option value="ADMIN">👑 Administradores</option>
              <option value="CONTROLLER">📦 Controladores de Estoque</option>
              <option value="VIEWER">👁️ Visualizadores</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#660099]"
            >
              <option value="ALL">🏢 Todos os Vínculos de Estoque</option>
              <option value="ALL">🏢 Todas as Localidades (Global)</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  📍 {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#660099]"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ATIVO">🟢 Ativos</option>
              <option value="INATIVO">🔴 Inativos</option>
            </select>
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Usuário</th>
                <th className="py-3.5 px-4">Nível de Acesso</th>
                <th className="py-3.5 px-4">Estoque Vinculado</th>
                <th className="py-3.5 px-4">Departamento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.map((user) => {
                const isCurrent = user.id === currentUserId;

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-purple-50/40 transition-colors ${
                      isCurrent ? 'bg-purple-50/70 font-semibold' : ''
                    }`}
                  >
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-[#660099]' 
                            : user.role === 'CONTROLLER'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[#660099] text-white px-1.5 py-0.5 rounded-full font-bold">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-normal">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-[#660099] shrink-0" />
                        <span className="truncate max-w-[200px]" title={getLocationName(user.locationId)}>
                          {getLocationName(user.locationId)}
                        </span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.department || 'Geral'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {user.status === 'ATIVO' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Switch button */}
                        {!isCurrent && (
                          <button
                            onClick={() => setCurrentUserId(user.id)}
                            title="Alternar sessão para este usuário"
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#660099] bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Entrar</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        {isCurrentUserAdmin && (
                          <button
                            onClick={() => onOpenEditUser(user)}
                            title="Editar usuário"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#660099] hover:bg-purple-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        {isCurrentUserAdmin && !isCurrent && (
                          <button
                            onClick={() => handleDelete(user)}
                            title="Excluir usuário"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
