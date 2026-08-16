import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Clock,
  Filter,
  PlusCircle,
  PackageCheck
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import { MovementType, BatchMovementEntry } from '../types';

interface BatchEntryItem {
  qty: number;
  notes: string;
  type: MovementType;
}

export const MovementsView: React.FC = () => {
  const { 
    items, 
    locations, 
    movements, 
    selectedLocationId, 
    registerBatchMovement, 
    registerSingleMovement 
  } = useStock();

  const [activeSubTab, setActiveSubTab] = useState<'batch' | 'single' | 'history'>('batch');

  // ---- State for Batch / Daily Closing Mode ----
  const [batchLocationId, setBatchLocationId] = useState<string>(() => {
    return selectedLocationId !== 'ALL' ? selectedLocationId : (locations[0]?.id || '');
  });
  const [batchDate, setBatchDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [batchReason, setBatchReason] = useState('Fechamento Diário de Almoxarifado');
  const [batchEmployee, setBatchEmployee] = useState('Almoxarife Vivo');
  const [batchRole, setBatchRole] = useState('Equipe Técnica / Operacional');
  const [batchDefaultType, setBatchDefaultType] = useState<MovementType>('SAIDA');
  const [batchEntries, setBatchEntries] = useState<Record<string, BatchEntryItem>>({});
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);
  const [batchErrorMsg, setBatchErrorMsg] = useState<string | null>(null);

  // Items for batch location
  const batchLocationItems = useMemo(() => {
    return items.filter(i => i.locationId === batchLocationId);
  }, [items, batchLocationId]);

  const handleBatchQtyChange = (itemId: string, qtyStr: string) => {
    const val = parseInt(qtyStr, 10);
    const qty = isNaN(val) || val < 0 ? 0 : val;
    setBatchEntries(prev => ({
      ...prev,
      [itemId]: {
        qty,
        notes: prev[itemId]?.notes || '',
        type: prev[itemId]?.type || batchDefaultType,
      }
    }));
  };

  const handleBatchTypeChange = (itemId: string, type: MovementType) => {
    setBatchEntries(prev => ({
      ...prev,
      [itemId]: {
        qty: prev[itemId]?.qty || 0,
        notes: prev[itemId]?.notes || '',
        type,
      }
    }));
  };

  const handleBatchNotesChange = (itemId: string, notes: string) => {
    setBatchEntries(prev => ({
      ...prev,
      [itemId]: {
        qty: prev[itemId]?.qty || 0,
        notes,
        type: prev[itemId]?.type || batchDefaultType,
      }
    }));
  };

  const handleClearBatchForm = () => {
    setBatchEntries({});
    setBatchSuccessMsg(null);
    setBatchErrorMsg(null);
  };

  // Active items being moved in batch
  const activeBatchCount = (Object.values(batchEntries) as BatchEntryItem[]).filter(e => e.qty > 0).length;
  const activeBatchTotalUnits = (Object.values(batchEntries) as BatchEntryItem[]).reduce((acc, curr) => acc + (curr.qty > 0 ? curr.qty : 0), 0);

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setBatchErrorMsg(null);
    setBatchSuccessMsg(null);

    const validEntries: BatchMovementEntry[] = [];

    for (const [itemId, data] of (Object.entries(batchEntries) as [string, BatchEntryItem][])) {
      if (data.qty > 0) {
        const item = items.find(i => i.id === itemId);
        if (!item) continue;

        // Check stock availability if salida
        if ((data.type === 'SAIDA' || data.type === 'AVARIA') && data.qty > item.quantity) {
          setBatchErrorMsg(`Saldo insuficiente para o item "${item.name}". Disponível: ${item.quantity}, Solicitado: ${data.qty}.`);
          return;
        }

        validEntries.push({
          itemId,
          quantity: data.qty,
          type: data.type,
          notes: data.notes,
        });
      }
    }

    if (validEntries.length === 0) {
      setBatchErrorMsg('Insira a quantidade de pelo menos um EPI para lançar no lote.');
      return;
    }

    const res = registerBatchMovement({
      locationId: batchLocationId,
      entries: validEntries,
      reason: batchReason,
      employeeName: batchEmployee,
      employeeRole: batchRole,
      isDailyClosing: true,
      customDate: new Date(batchDate + 'T18:00:00').toISOString(),
    });

    if (res.success) {
      setBatchSuccessMsg(`Sucesso! Foram registradas ${res.count} movimentações consolidadas de EPIs no almoxarifado Vivo.`);
      setBatchEntries({});
      setTimeout(() => setBatchSuccessMsg(null), 6000);
    } else {
      setBatchErrorMsg(res.error || 'Erro ao processar lote diário.');
    }
  };

  // ---- State for Single / Unitary Mode ----
  const [singleItemId, setSingleItemId] = useState<string>(() => items[0]?.id || '');
  const [singleType, setSingleType] = useState<MovementType>('SAIDA');
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleReason, setSingleReason] = useState<string>('Entrega avulsa ao colaborador');
  const [singleEmployeeName, setSingleEmployeeName] = useState<string>('');
  const [singleEmployeeRole, setSingleEmployeeRole] = useState<string>('');
  const [singleEmployeeReg, setSingleEmployeeReg] = useState<string>('');
  const [singleNotes, setSingleNotes] = useState<string>('');
  const [singleSuccessMsg, setSingleSuccessMsg] = useState<string | null>(null);
  const [singleErrorMsg, setSingleErrorMsg] = useState<string | null>(null);

  const selectedSingleItem = items.find(i => i.id === singleItemId);

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleErrorMsg(null);
    setSingleSuccessMsg(null);

    if (!singleItemId) {
      setSingleErrorMsg('Selecione um EPI.');
      return;
    }

    if (singleQty <= 0) {
      setSingleErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }

    const res = registerSingleMovement({
      itemId: singleItemId,
      type: singleType,
      quantity: singleQty,
      reason: singleReason,
      employeeName: singleEmployeeName,
      employeeRole: singleEmployeeRole,
      employeeRegistration: singleEmployeeReg,
      notes: singleNotes,
    });

    if (res.success) {
      setSingleSuccessMsg(`Movimentação de ${singleQty} ${selectedSingleItem?.unit || 'un'} registrada com sucesso!`);
      setSingleQty(1);
      setSingleNotes('');
      setTimeout(() => setSingleSuccessMsg(null), 5000);
    } else {
      setSingleErrorMsg(res.error || 'Erro ao registrar movimentação.');
    }
  };

  // ---- State for History & Filters ----
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('ALL');
  const [historyLocFilter, setHistoryLocFilter] = useState<string>(selectedLocationId);

  const filteredHistory = useMemo(() => {
    return movements.filter(m => {
      if (historyLocFilter !== 'ALL' && m.locationId !== historyLocFilter) return false;
      if (historyTypeFilter !== 'ALL' && m.type !== historyTypeFilter) return false;

      if (historySearch.trim() !== '') {
        const q = historySearch.toLowerCase();
        const matchItem = m.itemName.toLowerCase().includes(q);
        const matchCa = m.itemCa.toLowerCase().includes(q);
        const matchEmp = (m.employeeName || '').toLowerCase().includes(q);
        const matchReason = (m.reason || '').toLowerCase().includes(q);
        const matchNotes = (m.notes || '').toLowerCase().includes(q);
        if (!matchItem && !matchCa && !matchEmp && !matchReason && !matchNotes) return false;
      }
      return true;
    });
  }, [movements, historyLocFilter, historyTypeFilter, historySearch]);

  const handleExportCSV = () => {
    const headers = ['Data/Hora', 'Tipo', 'EPI', 'CA', 'Localidade', 'Qtd', 'Saldo Anterior', 'Saldo Atual', 'Motivo', 'Colaborador/Responsavel', 'Observacoes'];
    const rows = filteredHistory.map(m => [
      `"${new Date(m.createdAt).toLocaleString('pt-BR')}"`,
      `"${m.type}"`,
      `"${m.itemName.replace(/"/g, '""')}"`,
      `"${m.itemCa}"`,
      `"${m.locationName.replace(/"/g, '""')}"`,
      m.quantity,
      m.previousStock,
      m.currentStock,
      `"${(m.reason || '').replace(/"/g, '""')}"`,
      `"${(m.employeeName || '').replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vivo-extrato-movimentacoes-epi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Lançamento de Entregas & Movimentações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Modo diário/lote para fechamento do almoxarife Vivo, lançamentos avulsos e histórico auditável.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex bg-[#FAF7FC] p-1.5 rounded-xl border border-purple-100 text-xs sm:text-sm font-semibold">
          <button
            id="subtab-batch"
            onClick={() => setActiveSubTab('batch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === 'batch'
                ? 'bg-[#660099] text-white shadow-sm shadow-purple-950/20'
                : 'text-slate-600 hover:text-[#660099]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Modo Diário / Lote (Foco)</span>
          </button>

          <button
            id="subtab-single"
            onClick={() => setActiveSubTab('single')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === 'single'
                ? 'bg-[#660099] text-white shadow-sm shadow-purple-950/20'
                : 'text-slate-600 hover:text-[#660099]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lançamento Avulso</span>
          </button>

          <button
            id="subtab-history"
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeSubTab === 'history'
                ? 'bg-[#660099] text-white shadow-sm shadow-purple-950/20'
                : 'text-slate-600 hover:text-[#660099]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Histórico ({movements.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODO DIÁRIO / LOTE (CONSOLIDADO DO ALMOXARIFE)                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'batch' && (
        <div className="space-y-5">
          
          {/* Information & Instructions Banner */}
          <div className="bg-gradient-to-r from-[#4B0072] to-[#660099] text-white rounded-2xl p-5 border border-purple-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-purple-200 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Fechamento do Dia / Lançamento Rápido em Lote</h3>
                <p className="text-xs text-purple-100 mt-0.5 leading-relaxed">
                  Ideal para o almoxarife registrar ao final do expediente todas as saídas e entregas acumuladas do dia 
                  (ex: 15 pares de botas, 20 pares de luvas, 30 protetores auriculares) em uma única tela rápida.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-black/25 px-4 py-2 rounded-xl border border-white/15">
              <span className="text-xs text-purple-200">Total a Lançar:</span>
              <strong className="text-lg font-mono text-white">
                {activeBatchTotalUnits} itens ({activeBatchCount} EPIs)
              </strong>
            </div>
          </div>

          {batchSuccessMsg && (
            <div className="p-4 bg-purple-50 border border-purple-200 text-[#660099] rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#660099] shrink-0" />
              <span>{batchSuccessMsg}</span>
            </div>
          )}

          {batchErrorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{batchErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitBatch} className="space-y-5">
            
            {/* Header Configuration Box */}
            <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-purple-50 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#660099]" />
                Configurações da Sessão de Fechamento Vivo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                
                {/* Location select */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Localidade / Almoxarifado *</label>
                  <select
                    id="batch-location-select"
                    value={batchLocationId}
                    onChange={(e) => {
                      setBatchLocationId(e.target.value);
                      setBatchEntries({});
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                    required
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Data de Referência</label>
                  <input
                    id="batch-date-input"
                    type="date"
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Motivo / Tipo de Operação</label>
                  <input
                    id="batch-reason-input"
                    type="text"
                    value={batchReason}
                    onChange={(e) => setBatchReason(e.target.value)}
                    placeholder="Ex: Saídas do Turno da Manhã"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                  />
                </div>

                {/* Default Type */}
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipo Padrão de Movimento</label>
                  <select
                    value={batchDefaultType}
                    onChange={(e) => setBatchDefaultType(e.target.value as MovementType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                  >
                    <option value="SAIDA">SAÍDA (Consumo / Entrega aos Técnicos)</option>
                    <option value="ENTRADA">ENTRADA (Recebimento de Fornecedor)</option>
                    <option value="DEVOLUCAO">DEVOLUÇÃO (Retorno ao Almoxarifado)</option>
                    <option value="AVARIA">AVARIA / DESCARTE (Danificado)</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 border-t border-purple-50">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Responsável pelo Lançamento (Almoxarife / Técnico)</label>
                  <input
                    type="text"
                    value={batchEmployee}
                    onChange={(e) => setBatchEmployee(e.target.value)}
                    placeholder="Ex: Carlos Silva (Almoxarife Central Vivo)"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Setor / Equipe Beneficiária</label>
                  <input
                    type="text"
                    value={batchRole}
                    onChange={(e) => setBatchRole(e.target.value)}
                    placeholder="Ex: Equipe de Fibra Óptica & Campo"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

            </div>

            {/* Fast Batch Entry Table */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-purple-100 bg-[#FAF7FC] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Grade de Itens do Almoxarifado ({batchLocationItems.length} EPIs disponíveis)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Basta digitar a quantidade movimentada na coluna correspondente. Deixe 0 ou em branco os itens não movimentados.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearBatchForm}
                  className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                >
                  Limpar Grade
                </button>
              </div>

              {batchLocationItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum EPI cadastrado neste almoxarifado. Cadastre EPIs ou selecione outra localidade.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">EPI & CA</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4 text-center">Saldo Atual</th>
                        <th className="py-3 px-4 w-32 text-center">Tipo</th>
                        <th className="py-3 px-4 w-32 text-center bg-purple-50/70 text-[#660099]">
                          Qtd Movimentada *
                        </th>
                        <th className="py-3 px-4 text-center">Novo Saldo</th>
                        <th className="py-3 px-4 w-60">Obs / Colaborador Específico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchLocationItems.map(item => {
                        const entry = batchEntries[item.id] || { qty: 0, notes: '', type: batchDefaultType };
                        const isMoved = entry.qty > 0;
                        const isOut = entry.type === 'SAIDA' || entry.type === 'AVARIA';
                        const projectedStock = isOut ? item.quantity - entry.qty : item.quantity + entry.qty;
                        const isInvalid = isOut && projectedStock < 0;

                        return (
                          <tr 
                            key={item.id} 
                            className={`transition-colors ${
                              isMoved ? 'bg-purple-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-4">
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">CA {item.caNumber} • {item.brand || 'Vivo'}</div>
                            </td>

                            <td className="py-2.5 px-4 text-slate-600 text-xs">{item.category}</td>

                            <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                              {item.quantity} {item.unit}
                            </td>

                            <td className="py-2.5 px-4 text-center">
                              <select
                                value={entry.type}
                                onChange={(e) => handleBatchTypeChange(item.id, e.target.value as MovementType)}
                                className={`text-xs font-semibold px-2 py-1 rounded border focus:outline-none ${
                                  entry.type === 'SAIDA' 
                                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                    : 'bg-purple-50 border-purple-200 text-[#660099]'
                                }`}
                              >
                                <option value="SAIDA">Saída</option>
                                <option value="ENTRADA">Entrada</option>
                                <option value="DEVOLUCAO">Devolução</option>
                                <option value="AVARIA">Avaria</option>
                              </select>
                            </td>

                            <td className="py-2.5 px-4 text-center bg-purple-50/30">
                              <input
                                id={`batch-input-qty-${item.id}`}
                                type="number"
                                min="0"
                                max={isOut ? item.quantity : 9999}
                                placeholder="0"
                                value={entry.qty || ''}
                                onChange={(e) => handleBatchQtyChange(item.id, e.target.value)}
                                className={`w-24 text-center py-1.5 px-2 font-mono font-bold text-sm border rounded-lg focus:ring-2 focus:ring-[#660099] focus:outline-none transition-all ${
                                  isInvalid 
                                    ? 'border-rose-500 bg-rose-50 text-rose-700' 
                                    : isMoved 
                                      ? 'border-[#660099] bg-white text-[#660099] shadow-sm' 
                                      : 'border-slate-300 bg-white text-slate-700'
                                }`}
                              />
                            </td>

                            <td className="py-2.5 px-4 text-center font-mono text-xs">
                              {isMoved ? (
                                <span className={`font-bold ${isInvalid ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                                  {projectedStock} {item.unit}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                placeholder="Obs ou Nome do Colaborador..."
                                value={entry.notes || ''}
                                onChange={(e) => handleBatchNotesChange(item.id, e.target.value)}
                                className="w-full text-xs py-1 px-2 border border-slate-200 rounded focus:border-[#660099] focus:outline-none bg-white"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Submit Action Bar */}
              <div className="p-4 bg-[#FAF7FC] border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  Total selecionado para gravação: <strong className="text-[#660099] font-mono text-sm">{activeBatchTotalUnits} unidades</strong> em <strong className="text-slate-900">{activeBatchCount} EPIs</strong>.
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearBatchForm}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    id="btn-submit-batch-movement"
                    type="submit"
                    disabled={activeBatchCount === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#660099] hover:bg-[#52007a] disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-950/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Concluir Lançamento em Lote</span>
                  </button>
                </div>
              </div>

            </div>

          </form>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODO AVULSO (UNITÁRIO)                                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'single' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <div className="border-b border-purple-50 pb-4 mb-5">
            <h2 className="text-lg font-bold text-slate-900">Lançamento de Movimentação Individual</h2>
            <p className="text-xs text-slate-500 mt-0.5">Registre uma entrega avulsa, devolução, descarte ou entrada de estoque pontual.</p>
          </div>

          {singleSuccessMsg && (
            <div className="mb-5 p-4 bg-purple-50 border border-purple-200 text-[#660099] rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#660099] shrink-0" />
              <span>{singleSuccessMsg}</span>
            </div>
          )}

          {singleErrorMsg && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{singleErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitSingle} className="space-y-4 text-xs sm:text-sm">
            
            {/* Item Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Equipamento de Proteção (EPI) *</label>
              <select
                id="single-item-select"
                value={singleItemId}
                onChange={(e) => setSingleItemId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                required
              >
                {items.map(i => {
                  const loc = locations.find(l => l.id === i.locationId);
                  return (
                    <option key={i.id} value={i.id}>
                      {i.name} (CA: {i.caNumber}) • Saldo: {i.quantity} {i.unit} • {loc?.name || 'Local'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Movement Type & Qty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Tipo de Movimentação *</label>
                <select
                  value={singleType}
                  onChange={(e) => setSingleType(e.target.value as MovementType)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                >
                  <option value="SAIDA">SAÍDA (Entrega a Colaborador)</option>
                  <option value="ENTRADA">ENTRADA (Compra / Recebimento)</option>
                  <option value="DEVOLUCAO">DEVOLUÇÃO (Retorno ao Almoxarifado)</option>
                  <option value="AVARIA">AVARIA / DESCARTE (Danificado)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Quantidade ({selectedSingleItem?.unit || 'un'}) *</label>
                <input
                  id="single-qty-input"
                  type="number"
                  min="1"
                  value={singleQty}
                  onChange={(e) => setSingleQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Motivo / Finalidade *</label>
              <input
                type="text"
                value={singleReason}
                onChange={(e) => setSingleReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#660099] focus:outline-none"
                required
              />
            </div>

            {/* Employee Data (for NR-6 compliance) */}
            <div className="p-4 bg-[#FAF7FC] border border-purple-100 rounded-xl space-y-3">
              <span className="text-[11px] font-bold text-[#660099] uppercase tracking-wider block">
                Dados do Colaborador / Recebedor (Para Ficha NR-6)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={singleEmployeeName}
                    onChange={(e) => setSingleEmployeeName(e.target.value)}
                    placeholder="Ex: Marcos Vinicius"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Matrícula / RE</label>
                  <input
                    type="text"
                    value={singleEmployeeReg}
                    onChange={(e) => setSingleEmployeeReg(e.target.value)}
                    placeholder="Ex: VIV-8821"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Função / Cargo</label>
                <input
                  type="text"
                  value={singleEmployeeRole}
                  onChange={(e) => setSingleEmployeeRole(e.target.value)}
                  placeholder="Ex: Técnico de Campo / Instalador"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Observações Adicionais</label>
              <textarea
                rows={2}
                value={singleNotes}
                onChange={(e) => setSingleNotes(e.target.value)}
                placeholder="Observações sobre condição do EPI, substituição periódica, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#660099] focus:outline-none text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                id="btn-submit-single-movement"
                type="submit"
                className="px-6 py-2.5 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-bold text-sm shadow-md shadow-purple-950/20 transition-all active:scale-95"
              >
                Registrar Movimentação
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HISTÓRICO GERAL AUDITÁVEL                                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar histórico..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660099]"
                />
              </div>

              <div>
                <select
                  value={historyLocFilter}
                  onChange={(e) => setHistoryLocFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660099]"
                >
                  <option value="ALL">Todas as Localidades</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#660099]"
                >
                  <option value="ALL">Todos os Tipos</option>
                  <option value="SAIDA">Saídas / Entregas</option>
                  <option value="ENTRADA">Entradas / Compras</option>
                  <option value="DEVOLUCAO">Devoluções</option>
                  <option value="AVARIA">Avarias / Descarte</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#660099] border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>

            </div>
          </div>

          {/* Movements History Table */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Nenhuma movimentação corresponde aos filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF7FC] border-b border-purple-100 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Data / Hora</th>
                      <th className="py-3.5 px-4">Tipo</th>
                      <th className="py-3.5 px-4">EPI & CA</th>
                      <th className="py-3.5 px-4">Almoxarifado</th>
                      <th className="py-3.5 px-4 text-center">Quantidade</th>
                      <th className="py-3.5 px-4 text-center">Saldo Restante</th>
                      <th className="py-3.5 px-4">Motivo / Destinatário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map(mov => {
                      const isOut = mov.type === 'SAIDA' || mov.type === 'AVARIA';
                      const dateFormatted = new Date(mov.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={mov.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500 text-xs">
                            {dateFormatted}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              mov.type === 'SAIDA' ? 'bg-rose-100 text-rose-700' :
                              mov.type === 'ENTRADA' ? 'bg-purple-100 text-[#660099]' :
                              mov.type === 'DEVOLUCAO' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {mov.type}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{mov.itemName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">CA: {mov.itemCa}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {mov.locationName}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-extrabold">
                            <span className={isOut ? 'text-rose-600' : 'text-[#660099]'}>
                              {isOut ? '-' : '+'}{mov.quantity}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-slate-500">
                            {mov.currentStock}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800">{mov.reason}</div>
                            {mov.employeeName && (
                              <div className="text-[11px] text-slate-500">
                                Colaborador: <span className="font-semibold text-slate-700">{mov.employeeName}</span> {mov.employeeRole && `(${mov.employeeRole})`}
                              </div>
                            )}
                            {mov.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">{mov.notes}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
