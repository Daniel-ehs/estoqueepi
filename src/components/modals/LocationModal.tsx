import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, User, Phone } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { Location } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit?: Location | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, locationToEdit }) => {
  const { addLocation, updateLocation } = useStock();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleContact, setResponsibleContact] = useState('');

  useEffect(() => {
    if (locationToEdit) {
      setName(locationToEdit.name);
      setCode(locationToEdit.code);
      setDescription(locationToEdit.description);
      setAddress(locationToEdit.address || '');
      setResponsibleName(locationToEdit.responsibleName || '');
      setResponsibleContact(locationToEdit.responsibleContact || '');
    } else {
      setName('');
      setCode('');
      setDescription('');
      setAddress('');
      setResponsibleName('');
      setResponsibleContact('');
    }
  }, [locationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome da localidade.');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase() || 'VIV-' + Math.floor(10 + Math.random() * 90),
      description: description.trim(),
      address: address.trim(),
      responsibleName: responsibleName.trim(),
      responsibleContact: responsibleContact.trim(),
    };

    if (locationToEdit) {
      updateLocation(locationToEdit.id, payload);
    } else {
      addLocation(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-purple-50 bg-[#FAF7FC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {locationToEdit ? 'Editar Almoxarifado / Base Vivo' : 'Novo Almoxarifado ou Base Vivo'}
              </h3>
              <p className="text-xs text-slate-500">
                Cadastre locais físicos para distribuição e controle segregado de estoques.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Nome do Almoxarifado / Base *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Almoxarifado Central Vivo - SP"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Código / Sigla</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: VIV-SP01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Endereço / Localização Física</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. Chucri Zaidan, 860 - Morumbi, SP"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Almoxarife / Responsável</label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Ex: Carlos Eduardo (Vivo SESMT)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Contato / Telefone</label>
              <input
                type="text"
                value={responsibleContact}
                onChange={(e) => setResponsibleContact(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Descrição / Finalidade</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Atendimento às equipes de campo de fibra óptica e transmissão..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-900 text-xs"
            />
          </div>

          <div className="pt-4 border-t border-purple-50 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#660099] hover:bg-[#52007a] text-white rounded-xl font-bold shadow-sm shadow-purple-950/20 transition-all cursor-pointer"
            >
              {locationToEdit ? 'Salvar Alterações' : 'Cadastrar Local'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
