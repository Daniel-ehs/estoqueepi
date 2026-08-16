import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  Package, 
  Shield, 
  Grid, 
  List,
  Eye,
  SlidersHorizontal,
  Layers,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { EpiItem, CategoryType } from '../types';

interface ItemsViewProps {
  onOpenNewItem: () => void;
  onOpenEditItem: (item: EpiItem) => void;
  onOpenQuickMovement: (item: EpiItem) => void;
  onOpenTransfer: (item: EpiItem) => void;
}

const CATEGORIES: CategoryType[] = [
  'Proteção da Cabeça',
  'Proteção Visual e Facial',
  'Proteção Auditiva',
  'Proteção Respiratória',
  'Proteção das Mãos e Braços',
  'Proteção dos Pés e Pernas',
  'Proteção contra Quedas (Altura)',
  'Vestimentas e Corpo Inteiro',
];

export const ItemsView: React.FC<ItemsViewProps> = ({
  onOpenNewItem,
  onOpenEditItem,
  onOpenQuickMovement,
  onOpenTransfer,
}) => {
  const { 
    items, 
    locations, 
    selectedLocationId, 
    setSelectedLocationId, 
    deleteItem 
  } = useStock();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'CRITICAL' | 'NORMAL' | 'ZERO'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedItemDetail, setSelectedItemDetail] = useState<EpiItem | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Location filter
      if (selectedLocationId !== 'ALL' && item.locationId !== selectedLocationId) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (stockStatusFilter === 'ZERO' && item.quantity > 0) return false;
      if (stockStatusFilter === 'CRITICAL' && (item.quantity > item.minQuantity || item.quantity === 0)) return false;
      if (stockStatusFilter === 'NORMAL' && item.quantity <= item.minQuantity) return false;

      // Search query (matches name, CA, brand, description)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCa = item.caNumber.toLowerCase().includes(q);
        const matchBrand = (item.brand || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchName && !matchCa && !matchBrand && !matchDesc) return false;
      }

      return true;
    });
  }, [items, selectedLocationId, selectedCategory, stockStatusFilter, searchQuery]);

  const handleDelete = (item: EpiItem) => {
    if (window.confirm(`Deseja realmente remover o item "${item.name}" (CA: ${item.caNumber}) do cadastro da Vivo?`)) {
      deleteItem(item.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Catálogo de EPIs & Saldo em Estoque
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#660099] border border-purple-200">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie número de CA, certificados de aprovação, quantidades mínimas e almoxarifados vinculados na Vivo.
          </p>
        </div>

        <button
          id="btn-add-new-epi"
          onClick={onOpenNewItem}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-semibold text-sm shadow-sm shadow-purple-950/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo EPI
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-purple-100/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="items-search-input"
              type="text"
              placeholder="Buscar por EPI, CA ou marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660099] focus:bg-white transition-all hover:border-purple-300"
            />
          </div>

          {/* Category Selector */}
          <div>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-700 hover:border-purple-300 cursor-pointer"
            >
              <option value="ALL">Todas as Categorias</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Selector */}
          <div>
            <select
              id="filter-status-select"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-700 hover:border-purple-300 cursor-pointer"
            >
              <option value="ALL">Todos os Status de Estoque</option>
              <option value="NORMAL">Estoque Normal (OK)</option>
              <option value="CRITICAL">Abaixo do Mínimo (Alerta)</option>
              <option value="ZERO">Estoque Zerado (Crítico)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-slate-600">
              <button
                id="view-mode-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#660099] shadow-sm font-bold' : 'hover:text-slate-900'
                }`}
                title="Visualização em Cards"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                id="view-mode-table-btn"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-[#660099] shadow-sm font-bold' : 'hover:text-slate-900'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#660099] flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum EPI encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Nenhum equipamento corresponde aos filtros aplicados. Tente limpar a busca ou selecionar outra localidade.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStockStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#660099] rounded-lg text-xs font-bold transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const loc = locations.find(l => l.id === item.locationId);
            const isZero = item.quantity === 0;
            const isCritical = item.quantity > 0 && item.quantity <= item.minQuantity;
            const percentage = Math.min(100, Math.round((item.quantity / (item.minQuantity * 2 || 1)) * 100));

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-purple-100/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header & Image */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                        isZero 
                          ? 'bg-rose-600 text-white' 
                          : isCritical 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-[#660099] text-white'
                      }`}>
                        {isZero && <AlertTriangle className="w-3 h-3" />}
                        {isCritical && <AlertCircle className="w-3 h-3" />}
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    {/* CA Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur text-white text-[11px] font-mono font-bold">
                        CA {item.caNumber}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5">
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        {loc?.name.split(' ')[0] || 'Almoxarifado'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2" title={item.name}>
                      {item.name}
                    </h3>

                    {item.brand && (
                      <p className="text-[11px] text-slate-500">
                        Marca: <span className="font-medium text-slate-700">{item.brand}</span>
                      </p>
                    )}

                    {/* Stock Level Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                        <span>Disponível: <strong className="text-slate-900">{item.quantity} {item.unit}</strong></span>
                        <span className="text-slate-400">Mínimo: {item.minQuantity}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isZero ? 'w-0' : isCritical ? 'bg-amber-500' : 'bg-[#660099]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-[#FAF7FC] border-t border-purple-50 flex items-center justify-between gap-1.5">
                  <button
                    id={`btn-move-item-${item.id}`}
                    onClick={() => onOpenQuickMovement(item)}
                    className="flex-1 py-1.5 px-2 bg-[#660099] hover:bg-[#52007a] text-white rounded-lg text-xs font-bold shadow-sm transition-all text-center"
                    title="Dar baixa ou entrada rápida"
                  >
                    Movimentar
                  </button>

                  <button
                    id={`btn-transfer-item-${item.id}`}
                    onClick={() => onOpenTransfer(item)}
                    className="p-1.5 text-slate-600 hover:text-[#660099] hover:bg-purple-100/60 rounded-lg transition-colors"
                    title="Transferir para outro almoxarifado"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-edit-item-${item.id}`}
                    onClick={() => onOpenEditItem(item)}
                    className="p-1.5 text-slate-600 hover:text-[#660099] hover:bg-purple-100/60 rounded-lg transition-colors"
                    title="Editar informações do EPI"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-del-item-${item.id}`}
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF7FC] border-b border-purple-100 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">EPI & Detalhes</th>
                  <th className="py-3.5 px-4">CA (Norma)</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Localidade</th>
                  <th className="py-3.5 px-4 text-center">Saldo</th>
                  <th className="py-3.5 px-4 text-center">Mínimo</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const loc = locations.find(l => l.id === item.locationId);
                  const isZero = item.quantity === 0;
                  const isCritical = item.quantity > 0 && item.quantity <= item.minQuantity;

                  return (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-purple-100"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            {item.brand && <div className="text-slate-400 text-xs">{item.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {item.caNumber}
                        {item.caValidity && (
                          <div className="text-[10px] font-normal text-slate-400">Val: {item.caValidity}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{loc?.name || 'Local'}</td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-900">
                        {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {item.minQuantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          isZero 
                            ? 'bg-rose-100 text-rose-700' 
                            : isCritical 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-purple-100 text-[#660099]'
                        }`}>
                          {isZero ? 'Zerado' : isCritical ? 'Estoque Baixo' : 'Estoque Normal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenQuickMovement(item)}
                            className="px-2.5 py-1 bg-[#660099] hover:bg-[#52007a] text-white rounded-md text-xs font-bold transition-colors"
                          >
                            Movimentar
                          </button>
                          <button
                            onClick={() => onOpenTransfer(item)}
                            className="p-1.5 text-slate-500 hover:text-[#660099] rounded transition-colors"
                            title="Transferir"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditItem(item)}
                            className="p-1.5 text-slate-500 hover:text-[#660099] rounded transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
