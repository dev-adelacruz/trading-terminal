import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Pencil,
  X,
  Activity, 
  Wallet,
  Check,
  Target,
  Layers,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Scale,
  Eye,
  EyeOff,
  CopyPlus,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

const App = () => {
  // Persistence Keys
  const STORAGE_KEYS = {
    TRADES: 'trading_terminal_trades',
    PRICE: 'trading_terminal_price',
    PIP_VALUE: 'trading_terminal_pip_value'
  };

  // State initialization with LocalStorage lookup
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRADES);
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'XAUUSD', side: 'buy', entryPrice: 2020.00, lotSize: 0.1, timestamp: new Date().toISOString(), excluded: false },
      { id: 2, symbol: 'EURUSD', side: 'sell', entryPrice: 1.0850, lotSize: 1.0, timestamp: new Date().toISOString(), excluded: false }
    ];
  });
  
  const [currentPrice, setCurrentPrice] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE);
    return saved ? JSON.parse(saved) : 2030.00;
  });

  const [globalPipValue, setGlobalPipValue] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PIP_VALUE);
    return saved ? JSON.parse(saved) : 1.0;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMassModalOpen, setIsMassModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    symbol: 'XAUUSD',
    side: 'buy',
    entryPrice: '',
    lotSize: ''
  });

  // New trade state (for modal)
  const [newTrade, setNewTrade] = useState({
    symbol: 'XAUUSD',
    side: 'buy',
    entryPrice: '',
    lotSize: '',
  });

  // Mass Create state
  const [massCreate, setMassCreate] = useState({
    symbol: 'XAUUSD',
    side: 'buy',
    basePrice: currentPrice,
    stepSize: '10',
    count: '5',
    lotSize: '0.1',
    direction: 'above' // or 'below'
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICE, JSON.stringify(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PIP_VALUE, JSON.stringify(globalPipValue));
  }, [globalPipValue]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCreateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync mass create base price when current price changes (if modal is closed)
  useEffect(() => {
    if (!isMassModalOpen) {
      setMassCreate(prev => ({ ...prev, basePrice: currentPrice }));
    }
  }, [currentPrice, isMassModalOpen]);

  // Helper to calculate P/L for a single trade using the global pip value
  const calculateTradePnL = (trade, price) => {
    const directionMultiplier = trade.side === 'buy' ? 1 : -1;
    return (price - trade.entryPrice) * directionMultiplier * trade.lotSize * globalPipValue;
  };

  // Statistics Calculation
  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalLots = 0;
    let weightedEntrySum = 0;

    const activeTrades = trades.filter(t => !t.excluded);

    const totalPnl = activeTrades.reduce((acc, trade) => {
      totalInvested += (trade.entryPrice * trade.lotSize);
      totalLots += trade.lotSize;
      weightedEntrySum += (trade.entryPrice * trade.lotSize);
      return acc + calculateTradePnL(trade, currentPrice);
    }, 0);

    const averageEntryPrice = totalLots > 0 ? weightedEntrySum / totalLots : 0;
    const avgPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return { totalInvested, totalPnl, avgPnlPercent, averageEntryPrice, totalLots };
  }, [trades, currentPrice, globalPipValue]);

  // Modal Handlers
  const openAddModal = () => {
    setNewTrade({ symbol: 'XAUUSD', side: 'buy', entryPrice: currentPrice.toString(), lotSize: '' });
    setIsModalOpen(true);
    setIsCreateDropdownOpen(false);
  };

  const openMassModal = () => {
    setMassCreate(prev => ({ ...prev, basePrice: currentPrice }));
    setIsMassModalOpen(true);
    setIsCreateDropdownOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsMassModalOpen(false);
    setIsClearConfirmOpen(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trade = {
      id: Date.now(),
      symbol: newTrade.symbol,
      side: newTrade.side,
      entryPrice: parseFloat(newTrade.entryPrice),
      lotSize: parseFloat(newTrade.lotSize),
      timestamp: new Date().toISOString(),
      excluded: false
    };
    setTrades([...trades, trade]);
    closeModal();
  };

  const handleMassCreateSubmit = (e) => {
    e.preventDefault();
    const count = parseInt(massCreate.count);
    const step = parseFloat(massCreate.stepSize);
    const base = parseFloat(massCreate.basePrice);
    const lotSize = parseFloat(massCreate.lotSize);
    const sign = massCreate.direction === 'above' ? 1 : -1;

    const newPositions = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      newPositions.push({
        id: Date.now() + i,
        symbol: massCreate.symbol,
        side: massCreate.side,
        entryPrice: base + (sign * step * i),
        lotSize: lotSize,
        timestamp: now,
        excluded: false
      });
    }

    setTrades([...trades, ...newPositions]);
    closeModal();
  };

  const clearAllTrades = () => {
    setTrades([]);
    closeModal();
  };

  // Inline Editing Handlers
  const startInlineEdit = (trade) => {
    setEditingId(trade.id);
    setEditForm({
      symbol: trade.symbol,
      side: trade.side,
      entryPrice: trade.entryPrice,
      lotSize: trade.lotSize
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
  };

  const saveInlineEdit = (id) => {
    setTrades(trades.map(t => t.id === id ? {
      ...t,
      symbol: editForm.symbol,
      side: editForm.side,
      entryPrice: parseFloat(editForm.entryPrice),
      lotSize: parseFloat(editForm.lotSize)
    } : t));
    setEditingId(null);
  };

  const toggleExclude = (id) => {
    setTrades(trades.map(t => t.id === id ? { ...t, excluded: !t.excluded } : t));
  };

  const removeTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Layers className="text-indigo-600 shrink-0" />
              Trading Terminal
            </h1>
            <p className="text-slate-500 text-sm font-medium">Multi-Pair Portfolio Management</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-xl border border-slate-200 w-full md:w-auto">
            <div className="px-3 py-1 flex-1 md:flex-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Live Price</span>
              <div className="flex items-center gap-2">
                <span className="text-indigo-700 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.0001"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none focus:ring-0 text-lg font-mono font-bold w-full md:w-32 p-0 text-indigo-700"
                />
              </div>
            </div>
            <div className="h-10 w-px bg-slate-300"></div>
            <button 
              onClick={() => setCurrentPrice(prev => prev + 5.00)}
              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shrink-0"
              title="Price Up"
            >
              <TrendingUp size={20} />
            </button>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${stats.totalPnl >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={stats.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {stats.totalPnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Floating P/L</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${stats.totalPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2 text-slate-500">
              <Scale size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Position Price</span>
            </div>
            <div className="text-3xl font-bold font-mono text-indigo-600">
              ${stats.averageEntryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2 text-slate-500">
              <Target size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Exposure</span>
            </div>
            <div className="text-3xl font-bold font-mono text-slate-700">
              {stats.totalLots.toFixed(2)} <span className="text-sm font-normal text-slate-400">Lots</span>
            </div>
          </div>
        </div>

        {/* Positions Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Active Positions</h3>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Pip Value</span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-600">
                  <span className="opacity-50">$</span>
                  <input 
                    type="number"
                    step="0.1"
                    className="w-12 bg-transparent border-none p-0 focus:ring-0 font-bold"
                    value={globalPipValue}
                    onChange={(e) => setGlobalPipValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Secondary Destructive Action */}
              <button 
                onClick={() => setIsClearConfirmOpen(true)}
                disabled={trades.length === 0}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                title="Clear All Positions"
              >
                <Trash2 size={20} />
              </button>

              {/* Refined Unified Split Button */}
              <div className="relative flex items-stretch h-10 group" ref={dropdownRef}>
                <button 
                  onClick={openAddModal}
                  className="bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-3 rounded-l-xl flex items-center gap-2 text-xs font-bold transition-all active:scale-[0.98] border-r border-slate-800"
                >
                  <Plus size={14} />
                  New Position
                </button>
                <button 
                  onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-2 rounded-r-xl flex items-center justify-center transition-all active:scale-[0.98]"
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isCreateDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCreateDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={openMassModal}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <CopyPlus size={14} className="text-indigo-600" />
                      Mass Create
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                    <div className="px-4 py-1 text-[10px] text-slate-400 font-medium">Additional tools coming soon...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[750px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Symbol / Side</th>
                  <th className="px-6 py-4">Lot Size</th>
                  <th className="px-6 py-4">Entry Price</th>
                  <th className="px-6 py-4 text-right">Floating P/L (USD)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-400 italic text-sm font-medium">
                      No active positions found.
                    </td>
                  </tr>
                ) : (
                  trades.map(trade => {
                    const isEditing = editingId === trade.id;
                    const displayTrade = isEditing ? { ...trade, ...editForm } : trade;
                    const pnl = calculateTradePnL(displayTrade, currentPrice);
                    const isProfit = pnl >= 0;

                    return (
                      <tr key={trade.id} className={`transition-all duration-200 ${isEditing ? 'bg-indigo-50/50' : 'hover:bg-slate-50'} ${trade.excluded ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <select 
                                  className="text-[10px] font-bold px-2 py-1 rounded border border-indigo-200 bg-white"
                                  value={editForm.symbol}
                                  onChange={e => setEditForm({...editForm, symbol: e.target.value})}
                                >
                                  <option value="XAUUSD">XAUUSD</option>
                                  <option value="ETHUSD">ETHUSD</option>
                                  <option value="EURUSD">EURUSD</option>
                                </select>
                                <select 
                                  className="text-[10px] font-bold px-2 py-1 rounded border border-indigo-200 bg-white"
                                  value={editForm.side}
                                  onChange={e => setEditForm({...editForm, side: e.target.value})}
                                >
                                  <option value="buy">BUY</option>
                                  <option value="sell">SELL</option>
                                </select>
                              </div>
                            ) : (
                              <>
                                <span className={`font-bold transition-colors ${trade.excluded ? 'text-slate-400' : 'text-slate-900'}`}>{trade.symbol}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                                  trade.side === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {trade.side === 'buy' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                  {trade.side.toUpperCase()}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input 
                              type="number" 
                              className="w-20 px-3 py-1.5 border border-indigo-200 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                              value={editForm.lotSize}
                              onChange={e => setEditForm({...editForm, lotSize: e.target.value})}
                            />
                          ) : (
                            <span className={`font-mono text-sm font-semibold ${trade.excluded ? 'text-slate-400' : 'text-slate-700'}`}>{trade.lotSize}</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input 
                              type="number" step="any"
                              className="w-28 px-3 py-1.5 border border-indigo-200 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                              value={editForm.entryPrice}
                              onChange={e => setEditForm({...editForm, entryPrice: e.target.value})}
                            />
                          ) : (
                            <span className="font-mono text-sm text-slate-500">${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right font-mono">
                          <div className={`font-bold ${trade.excluded ? 'text-slate-400' : (isProfit ? 'text-emerald-600' : 'text-rose-600')}`}>
                            {isProfit ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => saveInlineEdit(trade.id)}
                                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                                  title="Save Changes"
                                >
                                  <Save size={14} />
                                </button>
                                <button 
                                  onClick={cancelInlineEdit}
                                  className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all shadow-sm"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => toggleExclude(trade.id)}
                                  className={`p-2 rounded-lg transition-all ${trade.excluded ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                  title={trade.excluded ? "Include in calculation" : "Exclude from calculation"}
                                >
                                  {trade.excluded ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button 
                                  onClick={() => startInlineEdit(trade)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={() => removeTrade(trade.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Close"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Position Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <Plus size={16} className="text-indigo-600" />
                  New Position
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNewTrade({...newTrade, side: 'buy'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      newTrade.side === 'buy' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    BUY (LONG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTrade({...newTrade, side: 'sell'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      newTrade.side === 'sell' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'
                    }`}
                  >
                    SELL (SHORT)
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider font-mono">Asset Pair</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                      value={newTrade.symbol}
                      onChange={e => setNewTrade({...newTrade, symbol: e.target.value})}
                    >
                      <option value="XAUUSD">XAUUSD</option>
                      <option value="ETHUSD">ETHUSD</option>
                      <option value="EURUSD">EURUSD</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider font-mono">Entry Price</label>
                      <input type="number" step="any" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="0.00" value={newTrade.entryPrice} onChange={e => setNewTrade({...newTrade, entryPrice: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider font-mono">Lot Size</label>
                      <input type="number" step="any" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="1.0" value={newTrade.lotSize} onChange={e => setNewTrade({...newTrade, lotSize: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <Info size={14} className="text-indigo-400 shrink-0" />
                  <p className="text-[10px] text-indigo-600/70 font-medium">
                    This position will use the global Pip Value of <span className="font-bold font-mono">${globalPipValue}</span>
                  </p>
                </div>
                
                <button 
                  type="submit"
                  className={`w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest ${
                    newTrade.side === 'buy' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-slate-900 shadow-slate-200'
                  }`}
                >
                  Confirm {newTrade.side.toUpperCase()} Order
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mass Creation Modal */}
        {isMassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <CopyPlus size={16} className="text-indigo-600" />
                  Mass Create Positions
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleMassCreateSubmit} className="p-6 space-y-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setMassCreate({...massCreate, side: 'buy'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      massCreate.side === 'buy' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setMassCreate({...massCreate, side: 'sell'})}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      massCreate.side === 'sell' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider font-mono">Asset Pair</label>
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                      value={massCreate.symbol}
                      onChange={e => setMassCreate({...massCreate, symbol: e.target.value})}
                    >
                      <option value="XAUUSD">XAUUSD</option>
                      <option value="ETHUSD">ETHUSD</option>
                      <option value="EURUSD">EURUSD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider font-mono">Base Price</label>
                    <input type="number" step="any" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none" value={massCreate.basePrice} onChange={e => setMassCreate({...massCreate, basePrice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider font-mono">Lot Size Each</label>
                    <input type="number" step="any" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none" value={massCreate.lotSize} onChange={e => setMassCreate({...massCreate, lotSize: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider font-mono">Step Size</label>
                    <input type="number" step="any" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none" value={massCreate.stepSize} onChange={e => setMassCreate({...massCreate, stepSize: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider font-mono">Quantity</label>
                    <input type="number" step="1" min="1" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none" value={massCreate.count} onChange={e => setMassCreate({...massCreate, count: e.target.value})} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider font-mono text-center">Placement Direction</label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setMassCreate({...massCreate, direction: 'above'})}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          massCreate.direction === 'above' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'
                        }`}
                      >
                        Above Base
                      </button>
                      <button
                        type="button"
                        onClick={() => setMassCreate({...massCreate, direction: 'below'})}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          massCreate.direction === 'below' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'
                        }`}
                      >
                        Below Base
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest"
                  >
                    Generate {massCreate.count} Positions
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-sm:w-full max-w-sm rounded-3xl shadow-2xl border border-rose-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Clear All Positions?</h3>
                  <p className="text-slate-500 text-sm mt-1">This will permanently remove all {trades.length} positions from your terminal and local storage.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={clearAllTrades}
                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-rose-100"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;