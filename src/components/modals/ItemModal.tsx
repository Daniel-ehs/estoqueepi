import React, { useState, useEffect } from 'react';
import { X, Upload, Package, ShieldCheck, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { EpiItem, CategoryType } from '../../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: EpiItem | null;
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

const DEFAULT_SAMPLE_IMAGES: { [key in CategoryType]: string } = {
  'Proteção da Cabeça': 'https://images.unsplash.com/photo-1578873375969-d71a6e38ea3c?w=400&auto=format&fit=crop&q=80',
  'Proteção Visual e Facial': 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&auto=format&fit=crop&q=80',
  'Proteção Auditiva': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
  'Proteção Respiratória': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&auto=format&fit=crop&q=80',
  'Proteção das Mãos e Braços': 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&auto=format&fit=crop&q=80',
  'Proteção dos Pés e Pernas': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  'Proteção contra Quedas (Altura)': 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=400&auto=format&fit=crop&q=80',
  'Vestimentas e Corpo Inteiro': 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=80',
};

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, itemToEdit }) => {
  const { locations, addItem, updateItem, selectedLocationId } = useStock();

  const [name, setName] = useState('');
  const [caNumber, setCaNumber] = useState('CA ');
  const [caValidity, setCaValidity] = useState('');
  const [category, setCategory] = useState<CategoryType>('Proteção da Cabeça');
  const [unit, setUnit] = useState<'un' | 'par' | 'cj' | 'pct' | 'kit'>('un');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [minQuantity, setMinQuantity] = useState<number>(5);
  const [locationId, setLocationId] = useState<string>(locations[0]?.id || '');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCaNumber(itemToEdit.caNumber);
      setCaValidity(itemToEdit.caValidity || '');
      setCategory(itemToEdit.category);
      setUnit(itemToEdit.unit);
      setImageUrl(itemToEdit.imageUrl);
      setQuantity(itemToEdit.quantity);
      setMinQuantity(itemToEdit.minQuantity);
      setLocationId(itemToEdit.locationId);
      setCostPrice(itemToEdit.costPrice || 0);
      setBrand(itemToEdit.brand || '');
      setDescription(itemToEdit.description || '');
    } else {
      setName('');
      setCaNumber('CA ');
      setCaValidity('2028-12-31');
      setCategory('Proteção da Cabeça');
      setUnit('un');
      setImageUrl(DEFAULT_SAMPLE_IMAGES['Proteção da Cabeça']);
      setQuantity(20);
      setMinQuantity(5);
      setLocationId(selectedLocationId !== 'ALL' ? selectedLocationId : (locations[0]?.id || ''));
      setCostPrice(35);
      setBrand('');
      setDescription('');
    }
  }, [itemToEdit, isOpen, locations, selectedLocationId]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    if (!itemToEdit && (!imageUrl || Object.values(DEFAULT_SAMPLE_IMAGES).includes(imageUrl))) {
      setImageUrl(DEFAULT_SAMPLE_IMAGES[newCat] || '');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !caNumber.trim() || !locationId) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const payload = {
      name: name.trim(),
      caNumber: caNumber.trim().toUpperCase(),
      caValidity,
      category,
      unit,
      imageUrl: imageUrl || DEFAULT_SAMPLE_IMAGES[category],
      quantity: Number(quantity),
      minQuantity: Number(minQuantity),
      locationId,
      costPrice: Number(costPrice) || 0,
      brand: brand.trim(),
      description: description.trim(),
    };

    if (itemToEdit) {
      updateItem(itemToEdit.id, payload);
    } else {
      addItem(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-2xl w-full overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-purple-50 bg-[#FAF7FC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#660099] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {itemToEdit ? 'Editar Dados do EPI' : 'Cadastrar Novo EPI no Estoque Vivo'}
              </h3>
              <p className="text-xs text-slate-500">
                Informações cadastrais, Certificado de Aprovação (CA) e estoque inicial.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Name & CA Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Nome do Equipamento (EPI) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Capacete de Segurança Classe B com Jugular"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white text-slate-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Nº CA (Certificado) *</label>
              <input
                type="text"
                value={caNumber}
                onChange={(e) => setCaNumber(e.target.value)}
                placeholder="CA 31469"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] focus:bg-white font-mono font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* Category, Unit and Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Categoria de Proteção *</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900 font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Unidade de Medida *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900 font-medium"
              >
                <option value="un">Unidade (un)</option>
                <option value="par">Par (par)</option>
                <option value="cj">Conjunto (cj)</option>
                <option value="pct">Pacote (pct)</option>
                <option value="kit">Kit (kit)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Validade do CA</label>
              <input
                type="date"
                value={caValidity}
                onChange={(e) => setCaValidity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              />
            </div>
          </div>

          {/* Location, Quantity, Min Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#FAF7FC] rounded-xl border border-purple-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Almoxarifado Vinculado *</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900 font-medium"
                required
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Estoque Atual *</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Estoque Mínimo (Alerta) *</label>
              <input
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono font-bold text-amber-700"
                required
              />
            </div>
          </div>

          {/* Brand & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Fabricante / Marca</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: 3M, MSA, Marluvas, Danny"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Custo Médio Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Image URL & File Upload */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Foto do Equipamento</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL da imagem (https://...)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900 text-xs"
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 font-semibold text-xs border border-slate-200">
                <Upload className="w-3.5 h-3.5" />
                Upload
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Descrição / Especificações Técnicas</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Fabricado em polietileno com absorvedor de impacto e jugular de fixação..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#660099] text-slate-900"
            />
          </div>

          {/* Actions */}
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
              {itemToEdit ? 'Salvar Alterações' : 'Cadastrar EPI'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
