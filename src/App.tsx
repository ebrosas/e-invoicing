import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Search, RefreshCw, Send, CheckCircle2, AlertCircle, 
  Building2, Calendar, CreditCard, ShieldCheck, Database, Layers, 
  Settings, ExternalLink, Code2, Copy, Check, Info, FileSpreadsheet,
  Cpu, Lock, Globe, ArrowRight, X, Sun, Moon, Award, Factory,
  SlidersHorizontal, Terminal, Play, CornerDownRight, HelpCircle
} from 'lucide-react';
import { JDE_SAMPLE_INVOICES } from './data/mockInvoices';
import { SalesInvoiceHeader, ProcessInvoiceResult } from './types/invoicing';
import { cygnetService } from './services/cygnetService';

type ThemeMode = 'professional' | 'light' | 'dark';

export default function App() {
  // Application-wide Visual Theme
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('garmco_einvoicing_theme');
      if (saved === 'professional' || saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {}
    return 'professional'; // Default: Oracle JD Edwards EnterpriseOne ERP
  });

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('garmco_einvoicing_theme', newTheme);
    } catch {}
    setNotification({
      type: 'info',
      message: `Visual theme updated to ${
        newTheme === 'professional' 
          ? 'Professional (Oracle JD Edwards ERP)' 
          : newTheme === 'light' 
          ? 'Light Mode (HRMS Applications)' 
          : 'Dark Mode (HRMS Console)'
      }.`
    });
  };

  // Navigation & View
  const [activeTab, setActiveTab] = useState<'invoice' | 'all-invoices' | 'cygnet-config' | 'clean-architecture'>('invoice');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Invoice State
  const [searchInvoiceNo, setSearchInvoiceNo] = useState<string>('DOC-INV-04');
  const [currentInvoice, setCurrentInvoice] = useState<SalesInvoiceHeader | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processResult, setProcessResult] = useState<ProcessInvoiceResult | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Cygnet Staging & Token State
  const [isSandbox, setIsSandbox] = useState<boolean>(cygnetService.isSandbox);
  const [tokenTimeLeft, setTokenTimeLeft] = useState<string>('5h 59m');
  const [showPayloadModal, setShowPayloadModal] = useState<boolean>(false);
  const [modalPayloadType, setModalPayloadType] = useState<'request' | 'response'>('request');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Selected file in Clean Architecture viewer
  const [selectedSolutionFile, setSelectedSolutionFile] = useState<string>('InvoiceDetails.razor.cs');

  // Input ref for Reset button auto-focus requirement
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  // Input Validation & MudTooltip state for Invoice Number
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState<boolean>(false);
  const [isInputTouched, setIsInputTouched] = useState<boolean>(false);

  const getInvoiceValidationError = (val: string): string | null => {
    if (!val || val.trim() === '') {
      return 'Invoice Number is required to query secuser.Vw_SalesInvoiceDetail.';
    }
    if (val.trim().length < 3) {
      return 'Invoice Number must be at least 3 characters (e.g. DOC-INV-04).';
    }
    return null;
  };

  const invoiceValidationError = getInvoiceValidationError(searchInvoiceNo);
  const isInvoiceValid = !invoiceValidationError;

  // Parse JDE ERP query string on initial mount (?invoiceNo=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceParam = params.get('invoiceNo') || params.get('InvoiceNo');
    if (invoiceParam) {
      setSearchInvoiceNo(invoiceParam);
      loadInvoiceByNumber(invoiceParam);
    } else {
      loadInvoiceByNumber('DOC-INV-04');
    }
  }, []);

  // Update token timer simulation
  useEffect(() => {
    const updateTokenStatus = () => {
      const active = cygnetService.getActiveToken();
      if (active) {
        const diffMs = new Date(active.expiresAt).getTime() - Date.now();
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setTokenTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTokenTimeLeft('Expired');
        }
      } else {
        setTokenTimeLeft('Ready to Authenticate (6h lifetime)');
      }
    };
    updateTokenStatus();
    const interval = setInterval(updateTokenStatus, 30000);
    return () => clearInterval(interval);
  }, [processResult]);

  const loadInvoiceByNumber = (no: string) => {
    setIsLoading(true);
    setProcessResult(null);
    setTimeout(() => {
      const found = JDE_SAMPLE_INVOICES.find(
        (inv) => inv.invoiceNo.toLowerCase() === no.trim().toLowerCase()
      );
      if (found) {
        setCurrentInvoice(found);
        setNotification({
          type: 'success',
          message: `Retrieved Invoice ${found.invoiceNo} from database view secuser.Vw_SalesInvoiceDetail`
        });
      } else {
        setCurrentInvoice(null);
        setNotification({
          type: 'error',
          message: `Invoice '${no}' not found in database view secuser.Vw_SalesInvoiceDetail`
        });
      }
      setIsLoading(false);
    }, 250);
  };

  // Requirement: Search button beside Invoice No. field
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsInputTouched(true);
    if (!searchInvoiceNo.trim()) {
      setNotification({ type: 'error', message: 'Invoice Number is required to search.' });
      invoiceInputRef.current?.focus();
      return;
    }
    loadInvoiceByNumber(searchInvoiceNo);
  };

  // Requirement: Reset button clears entire form and shifts focus to Invoice Number
  const handleReset = () => {
    setSearchInvoiceNo('');
    setCurrentInvoice(null);
    setProcessResult(null);
    setIsInputTouched(false);
    setNotification({ type: 'info', message: 'Form cleared. Please enter a new Invoice Number.' });
    // Focus Invoice Number input field
    setTimeout(() => {
      invoiceInputRef.current?.focus();
    }, 50);
  };

  // Requirement: Process Invoice button calls Cygnet Global APIs
  const handleProcessInvoice = async () => {
    if (!currentInvoice) {
      setNotification({ type: 'error', message: 'No invoice loaded to process.' });
      return;
    }

    setIsProcessing(true);
    setNotification(null);

    try {
      const result = await cygnetService.processInvoice(currentInvoice);
      setProcessResult(result);
      if (result.success) {
        setNotification({
          type: 'success',
          message: `E-Invoice processed successfully with Cygnet Global! Reference ID: ${result.referenceId}`
        });
      } else {
        setNotification({
          type: 'error',
          message: `Cygnet API error: ${result.message}`
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Failed to process e-invoice: ${err.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate JDE ERP Print Invoice URL click
  const simulateJdeClick = (invNo: string) => {
    setSearchInvoiceNo(invNo);
    loadInvoiceByNumber(invNo);
    const newUrl = `${window.location.pathname}?invoiceNo=${encodeURIComponent(invNo)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Theme Dynamic Style Classes
  const getAppHeaderClasses = () => {
    switch (theme) {
      case 'professional':
        // Oracle JD Edwards EnterpriseOne Deep Blue Banner with Oracle Gold Accent
        return 'bg-[#003366] text-white border-b-2 border-[#C89D2B] shadow-md';
      case 'light':
        return 'bg-[#005CB9] text-white border-b border-[#004A94] shadow-md'; // Workday HRMS Blue
      case 'dark':
        return 'bg-[#0B0F19] text-slate-100 border-b border-slate-800 shadow-md'; // Modern Dark
    }
  };

  const getCanvasBgClasses = () => {
    switch (theme) {
      case 'professional':
        return 'bg-[#F0F3F7] text-[#0F2439]'; // JDE Enterprise Canvas Neutral
      case 'light':
        return 'bg-[#F8FAFC] text-slate-900'; // HRMS Slate Canvas
      case 'dark':
        return 'bg-[#0B0F19] text-slate-100'; // HRMS Obsidian Canvas
    }
  };

  const getCardClasses = () => {
    switch (theme) {
      case 'professional':
        // JDE Group Box styling: Crisp white with classic JDE gray-blue border
        return 'bg-white border border-[#B8C7D8] shadow-xs text-[#0F2439]';
      case 'light':
        return 'bg-white border border-slate-200 shadow-sm text-slate-900';
      case 'dark':
        return 'bg-[#111827] border border-slate-800 shadow-md text-slate-100';
    }
  };

  const getSecondarySurfaceClasses = () => {
    switch (theme) {
      case 'professional':
        return 'bg-[#EAF0F6] border border-[#CBD7E3] text-[#0F2439]'; // JDE Toolbar / Section Surface
      case 'light':
        return 'bg-slate-50 border border-slate-200';
      case 'dark':
        return 'bg-[#151F32] border border-slate-800';
    }
  };

  const getPrimaryPillBtnClasses = () => {
    switch (theme) {
      case 'professional':
        // Classic Oracle JDE Navy Button with ambient elevation
        return 'bg-[#003366] hover:bg-[#002244] text-white shadow-[0_4px_14px_rgba(0,51,102,0.35)] hover:shadow-[0_6px_20px_rgba(0,51,102,0.45)] border border-[#002B55]';
      case 'light':
        return 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)]';
      case 'dark':
        return 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-[0_4px_14px_rgba(2,132,199,0.35)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.45)]';
    }
  };

  const getProcessPillBtnClasses = () => {
    switch (theme) {
      case 'professional':
        // JDE Form Exit Process Button with Gold Trim
        return 'bg-[#0A4A82] hover:bg-[#07355E] text-white shadow-[0_4px_14px_rgba(10,74,130,0.4)] hover:shadow-[0_6px_20px_rgba(10,74,130,0.5)] border border-[#C89D2B]/50';
      case 'light':
        return 'bg-[#059669] hover:bg-[#047857] text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.45)]';
      case 'dark':
        return 'bg-[#059669] hover:bg-[#047857] text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.45)]';
    }
  };

  const getResetPillBtnClasses = () => {
    switch (theme) {
      case 'professional':
        return 'bg-white hover:bg-[#F2F5F8] text-[#0F2439] border border-[#B8C7D8] shadow-sm hover:shadow-md';
      case 'light':
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm hover:shadow-md';
      case 'dark':
        return 'bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-slate-700 shadow-sm hover:shadow-md';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${getCanvasBgClasses()} theme-${theme}`}>
      {/* ORACLE JD EDWARDS ENTERPRISEONE TOP APPBAR */}
      <header className={`sticky top-0 z-40 transition-colors duration-200 ${getAppHeaderClasses()}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 rounded-full hover:bg-black/20 transition-all text-white/90 hover:text-white"
              title="Toggle Navigation Menu"
            >
              <Layers className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-md ${
                theme === 'professional' ? 'bg-[#C89D2B] text-[#003366]' : 'bg-white/20 text-white'
              }`}>
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight block leading-tight">
                  GARMCO E-Invoicing Portal
                </span>
                <span className="text-[11px] opacity-85 font-mono">
                  {theme === 'professional' ? 'Oracle JD Edwards EnterpriseOne' : 'Gulf Aluminium Rolling Mill Co.'} • secuser.Vw_SalesInvoiceDetail
                </span>
              </div>
            </div>

            {/* JDE Fast Path Box in Header (Classic Oracle JDE signature feature) */}
            {theme === 'professional' && (
              <div className="hidden xl:flex items-center ml-4 px-2.5 py-1 rounded bg-[#002244] border border-[#C89D2B]/50 text-xs font-mono text-[#F4D06F]">
                <Terminal className="w-3.5 h-3.5 mr-1 text-[#C89D2B]" />
                Fast Path: P4210 / W4210A
              </div>
            )}

            <div className={`hidden lg:flex items-center ml-3 px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${
              theme === 'professional' 
                ? 'bg-[#C89D2B] text-[#003366] font-bold' 
                : 'bg-white/15 text-white border border-white/20'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Bahrain NBR Compliant
            </div>
          </div>

          {/* Right Header Zone: Theme Switcher & Sandbox Mode */}
          <div className="flex items-center gap-3">
            {/* APPLICATION-WIDE THEME SWITCHER */}
            <div className="flex items-center p-1 bg-black/25 rounded-full border border-white/15 shadow-inner">
              <button
                onClick={() => handleThemeChange('professional')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  theme === 'professional'
                    ? 'bg-[#C89D2B] text-[#003366] shadow-md scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Professional Theme: Oracle JD Edwards EnterpriseOne ERP (Deep Blue, Action Toolbar, Soft Blue Grid)"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Professional (JDE)</span>
              </button>

              <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-white text-[#005CB9] shadow-md scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Light Mode: Top HRMS Applications (Clean Slate & Crisp White)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Light</span>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-[#38BDF8] text-[#0B0F19] shadow-md scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Dark Mode: Enterprise HRMS Dark Console"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>

            {/* Sandbox toggle badge */}
            <button
              onClick={() => {
                const next = !isSandbox;
                setIsSandbox(next);
                cygnetService.isSandbox = next;
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 shadow-sm border transition-all ${
                isSandbox 
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80'
                  : 'bg-amber-950/70 text-amber-300 border-amber-700/80 hover:bg-amber-900/80'
              }`}
              title="Click to toggle Cygnet Sandbox vs Live Staging mode"
            >
              <span className={`w-2 h-2 rounded-full ${isSandbox ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">{isSandbox ? 'Cygnet Sandbox' : 'Live Staging'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ENHANCED MARGIN & SPACING BETWEEN TOP BANNER AND LANDING PAGE */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Contextual Breadcrumb & Quick Test Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 gap-3">
          <div className="flex items-center gap-2 text-xs font-medium opacity-80">
            <span>Oracle JD Edwards</span>
            <span>/</span>
            <span>Sales Order Management</span>
            <span>/</span>
            <span>Print Invoice Inquiry</span>
            <span>/</span>
            <span className="font-semibold underline decoration-2">E-Invoicing Portal</span>
          </div>

          {/* Quick JDE URL Simulators */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="opacity-70 mr-1 text-[11px]">JDE Deep Links:</span>
            {JDE_SAMPLE_INVOICES.map((inv) => (
              <button
                key={inv.invoiceNo}
                onClick={() => simulateJdeClick(inv.invoiceNo)}
                className={`px-3 py-1 rounded-full font-mono text-[11px] font-semibold transition-all transform hover:-translate-y-0.5 ${
                  currentInvoice?.invoiceNo === inv.invoiceNo 
                    ? theme === 'professional'
                      ? 'bg-[#003366] text-white shadow-md border border-[#C89D2B]'
                      : theme === 'light'
                      ? 'bg-[#005CB9] text-white shadow-md'
                      : 'bg-[#38BDF8] text-[#0B0F19] shadow-md'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
                }`}
                title={`Simulate JDE ERP 'Print Invoice' URL for ${inv.invoiceNo}`}
              >
                {inv.invoiceNo}
              </button>
            ))}
          </div>
        </div>

        {/* DEDICATED ORACLE JDE ENTERPRISEONE ACTION TOOLBAR (When in Professional Theme) */}
        {theme === 'professional' && (
          <div className="mb-6 p-3 bg-[#E4ECF4] border border-[#B8C7D8] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#003366] px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0A4A82]" />
                JDE Actions:
              </span>

              {/* JDE Find Action */}
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="rounded-full px-4 py-1.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find (Search)</span>
              </button>

              {/* JDE Clear Action */}
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="rounded-full px-4 py-1.5 bg-white hover:bg-[#F2F5F8] text-[#0F2439] border border-[#B8C7D8] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 opacity-70" />
                <span>Cancel / Clear</span>
              </button>

              {/* JDE Form Exit: Process E-Invoice */}
              <button
                onClick={handleProcessInvoice}
                disabled={isLoading || isProcessing || !currentInvoice}
                className={`rounded-full px-5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                  !currentInvoice 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#0A4A82] hover:bg-[#07355E] text-white border border-[#C89D2B]/60'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing with Cygnet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Form Exit: Process E-Invoice</span>
                  </>
                )}
              </button>
            </div>

            {/* JDE Row / Tool Exits */}
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-70 text-[11px] font-medium">Tools:</span>
              <button
                onClick={() => setShowPayloadModal(true)}
                disabled={!processResult}
                className="rounded-full px-3 py-1 bg-white hover:bg-slate-100 text-[#0F2439] border border-[#B8C7D8] text-[11px] font-semibold disabled:opacity-50"
              >
                <Code2 className="w-3 h-3 inline mr-1" />
                Audit Payloads
              </button>
              <div className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#B8C7D8]">
                Token: <strong className="text-emerald-700">{tokenTimeLeft}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* MUDDRAWER (Navigation Sidebar) */}
          {isDrawerOpen && (
            <aside className="w-64 shrink-0 hidden md:block">
              <div className={`rounded-2xl p-4 sticky top-28 ${getCardClasses()}`}>
                <div className="px-3 py-2 text-[11px] font-bold opacity-60 uppercase tracking-wider">
                  {theme === 'professional' ? 'JDE Menus' : 'Operations'}
                </div>
                <nav className="space-y-1.5">
                  <button
                    onClick={() => setActiveTab('invoice')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-full transition-all ${
                      activeTab === 'invoice'
                        ? theme === 'professional'
                          ? 'bg-[#003366] text-white shadow-md border border-[#C89D2B]/50'
                          : theme === 'light'
                          ? 'bg-[#005CB9] text-white shadow-md'
                          : 'bg-[#38BDF8] text-[#0B0F19] shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Process Invoice</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('all-invoices')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-full transition-all ${
                      activeTab === 'all-invoices'
                        ? theme === 'professional'
                          ? 'bg-[#003366] text-white shadow-md border border-[#C89D2B]/50'
                          : theme === 'light'
                          ? 'bg-[#005CB9] text-white shadow-md'
                          : 'bg-[#38BDF8] text-[#0B0F19] shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Database className="w-4 h-4 shrink-0" />
                    <span>JDE Invoices View</span>
                  </button>

                  <div className="pt-3 px-3 py-2 text-[11px] font-bold opacity-60 uppercase tracking-wider">
                    Specifications
                  </div>

                  <button
                    onClick={() => setActiveTab('clean-architecture')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-full transition-all ${
                      activeTab === 'clean-architecture'
                        ? theme === 'professional'
                          ? 'bg-[#003366] text-white shadow-md border border-[#C89D2B]/50'
                          : theme === 'light'
                          ? 'bg-[#005CB9] text-white shadow-md'
                          : 'bg-[#38BDF8] text-[#0B0F19] shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Code2 className="w-4 h-4 shrink-0" />
                    <span>C# Clean Architecture</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cygnet-config')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-full transition-all ${
                      activeTab === 'cygnet-config'
                        ? theme === 'professional'
                          ? 'bg-[#003366] text-white shadow-md border border-[#C89D2B]/50'
                          : theme === 'light'
                          ? 'bg-[#005CB9] text-white shadow-md'
                          : 'bg-[#38BDF8] text-[#0B0F19] shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Cygnet API Config</span>
                  </button>
                </nav>

                {/* Cygnet Token Status Card in Drawer */}
                <div className={`mt-6 p-3.5 rounded-xl text-xs ${getSecondarySurfaceClasses()}`}>
                  <div className="flex items-center justify-between font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Cygnet Token
                    </span>
                    <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      6h Cache
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-tight">
                    Token cached and reused across Document API calls. Auto-refreshes 10m before expiry.
                  </p>
                  <div className="mt-2 text-[11px] font-mono p-1.5 rounded bg-black/5 dark:bg-white/5">
                    Status: <span className="font-bold text-blue-600 dark:text-sky-400">{tokenTimeLeft}</span>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* MAIN VIEWPORT CONTENT */}
          <main className="flex-1 min-w-0">
            {/* Notification alert banner */}
            {notification && (
              <div className={`mb-6 p-4 rounded-2xl border text-sm flex items-center justify-between shadow-sm transition-all ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800' 
                  : notification.type === 'error' 
                  ? 'bg-rose-50 text-rose-950 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800' 
                  : 'bg-blue-50 text-blue-950 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-center gap-3">
                  {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                  {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
                  <span className="font-medium">{notification.message}</span>
                </div>
                <button 
                  onClick={() => setNotification(null)}
                  className="opacity-60 hover:opacity-100 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 1: PROCESS INVOICE (Primary landing page) */}
            {activeTab === 'invoice' && (
              <div className="space-y-6">
                {/* TOP SEARCH & FORM ACTION CARD */}
                <div className={`rounded-2xl p-6 ${getCardClasses()}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Search Input and Search Button placed beside Invoice No. */}
                    <form onSubmit={handleSearch} className="flex flex-col gap-1.5 flex-1 max-w-xl">
                      <div className="flex items-start gap-2.5">
                        <div className="relative flex-1">
                          {/* MudTooltip floating guidance box */}
                          {(isInputFocused || isTooltipHovered || (isInputTouched && !isInvoiceValid)) && (
                            <div 
                              className={`absolute -top-11 left-0 z-30 flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-sans rounded-full shadow-lg whitespace-nowrap animate-in fade-in duration-150 border ${
                                theme === 'professional'
                                  ? 'bg-[#003366] text-white border-[#C89D2B]'
                                  : 'bg-slate-900 text-white border-slate-700'
                              }`}
                              role="tooltip"
                            >
                              <Info className="w-3.5 h-3.5 text-[#F4D06F] shrink-0" />
                              <span>
                                {invoiceValidationError ? (
                                  <strong className="text-yellow-300 font-semibold">{invoiceValidationError}</strong>
                                ) : (
                                  <span>Guidance: Formats include <strong>DOC-INV-04</strong>, <strong>INV-2026-001</strong>, or <strong>INV-JDE-8890</strong></span>
                                )}
                              </span>
                              {/* Downward tooltip arrow */}
                              <div className={`absolute -bottom-1 left-6 w-2 h-2 rotate-45 ${
                                theme === 'professional' ? 'bg-[#003366]' : 'bg-slate-900'
                              }`} />
                            </div>
                          )}

                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-50">
                            <FileText className={`w-4 h-4 ${
                              isInputTouched && !isInvoiceValid ? 'text-rose-500' : isInvoiceValid && searchInvoiceNo.trim() ? 'text-emerald-600' : ''
                            }`} />
                          </div>

                          <input
                            ref={invoiceInputRef}
                            type="text"
                            value={searchInvoiceNo}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => {
                              setIsInputFocused(false);
                              if (searchInvoiceNo.trim() !== '') setIsInputTouched(true);
                            }}
                            onChange={(e) => {
                              setSearchInvoiceNo(e.target.value);
                              setIsInputTouched(true);
                            }}
                            placeholder="Enter Invoice No. (e.g. DOC-INV-04)"
                            aria-invalid={isInputTouched && !isInvoiceValid}
                            className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-full border transition-all font-medium focus:outline-none ${
                              isInputTouched && !isInvoiceValid
                                ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-500/40 text-rose-900 dark:text-rose-200'
                                : isInvoiceValid && searchInvoiceNo.trim()
                                ? 'border-emerald-300 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                                : theme === 'professional'
                                ? 'bg-white border-[#B8C7D8] text-[#0F2439] focus:ring-2 focus:ring-[#003366]'
                                : theme === 'dark'
                                ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-sky-500'
                                : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-600'
                            }`}
                          />

                          {/* Status/Adornment icon & Tooltip trigger */}
                          <div 
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onMouseEnter={() => setIsTooltipHovered(true)}
                            onMouseLeave={() => setIsTooltipHovered(false)}
                            title="View JDE Invoice format guide"
                          >
                            {isInputTouched && !isInvoiceValid ? (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            ) : isInvoiceValid && searchInvoiceNo.trim() ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Info className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </div>

                        {/* SEARCH BUTTON: Fully rounded pill button beside Invoice No. */}
                        <button
                          type="submit"
                          disabled={isLoading || (isInputTouched && !isInvoiceValid)}
                          className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 shrink-0 ${
                            isInputTouched && !isInvoiceValid
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                              : getPrimaryPillBtnClasses()
                          }`}
                        >
                          <Search className="w-4 h-4" />
                          <span>Search</span>
                        </button>
                      </div>

                      {/* Helper text / Validation feedback line */}
                      <div className="flex items-center justify-between text-[11px] px-2 pt-0.5">
                        {isInputTouched && invoiceValidationError ? (
                          <span className="text-rose-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {invoiceValidationError}
                          </span>
                        ) : (
                          <span className="opacity-60 flex items-center gap-1">
                            <span>Format hint: DOC-INV-xx or INV-xxxx-xxx</span>
                          </span>
                        )}
                        
                        {!searchInvoiceNo.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchInvoiceNo('DOC-INV-04');
                              setIsInputTouched(true);
                            }}
                            className="text-blue-600 dark:text-sky-400 font-semibold hover:underline text-[11px]"
                          >
                            Fill DOC-INV-04
                          </button>
                        )}
                      </div>
                    </form>

                    {/* RESET BUTTON & PROCESS INVOICE BUTTON: Rounded pill buttons */}
                    <div className="flex items-center gap-3">
                      {/* RESET BUTTON */}
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 ${getResetPillBtnClasses()}`}
                      >
                        <RefreshCw className="w-4 h-4 opacity-70" />
                        <span>Reset</span>
                      </button>

                      {/* PROCESS INVOICE BUTTON */}
                      <button
                        type="button"
                        onClick={handleProcessInvoice}
                        disabled={isLoading || isProcessing || !currentInvoice}
                        className={`rounded-full px-7 py-2.5 text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 ${
                          !currentInvoice 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60' 
                            : isProcessing 
                            ? 'opacity-80 cursor-wait' 
                            : getProcessPillBtnClasses()
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing with Cygnet...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Process Invoice</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Target database view ribbon */}
                  <div className="mt-5 pt-3.5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between text-xs opacity-75 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Database className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        <strong>SQL Server View:</strong> <code className="font-mono">secuser.Vw_SalesInvoiceDetail</code>
                      </span>
                      <span>•</span>
                      <span>Theme: <strong>{theme === 'professional' ? 'Oracle JD Edwards ERP (Classic Blue)' : theme === 'light' ? 'Light Mode (HRMS)' : 'Dark Mode (HRMS Console)'}</strong></span>
                    </div>

                    {currentInvoice && (
                      <div className="font-mono text-[11px]">
                        Lines: <strong>{currentInvoice.lines.length}</strong> • DO: <strong>{currentInvoice.deliveryOrderNo}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOADING STATE */}
                {isLoading && (
                  <div className={`rounded-2xl p-16 text-center ${getCardClasses()}`}>
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600 dark:text-sky-400" />
                    <p className="text-sm font-semibold">
                      Querying Oracle JDE SQL Server view secuser.Vw_SalesInvoiceDetail...
                    </p>
                  </div>
                )}

                {/* EMPTY STATE */}
                {!isLoading && !currentInvoice && (
                  <div className={`rounded-2xl p-16 text-center border-dashed ${getCardClasses()}`}>
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-bold">No Invoice Found or Loaded</h3>
                    <p className="text-sm opacity-70 max-w-md mx-auto mt-1 mb-5">
                      Please enter an Invoice Number above or trigger from GARMCO JDE ERP via URL query string parameter: <code className="font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-xs">?invoiceNo=DOC-INV-04</code>
                    </p>
                    <div className="flex justify-center gap-2">
                      {JDE_SAMPLE_INVOICES.map((inv) => (
                        <button
                          key={inv.invoiceNo}
                          onClick={() => simulateJdeClick(inv.invoiceNo)}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm ${getPrimaryPillBtnClasses()}`}
                        >
                          Load {inv.invoiceNo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* POPULATED INVOICE DATA (Oracle JDE Header/Detail Group Box Architecture) */}
                {!isLoading && currentInvoice && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* JDE Group Box: Invoice Header Information */}
                      <div className={`rounded-2xl p-6 ${getCardClasses()}`}>
                        <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-xs ${
                            theme === 'professional' ? 'bg-[#003366]' : 'bg-blue-600'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold uppercase tracking-wide leading-tight">
                              Invoice Header Information
                            </h2>
                            <p className="text-[11px] opacity-65 font-mono">Form: W4210A • Program: P4210</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="opacity-60 block mb-0.5">Invoice No.</span>
                            <span className="font-mono text-base font-bold text-[#003366] dark:text-sky-400">{currentInvoice.invoiceNo}</span>
                          </div>
                          <div>
                            <span className="opacity-60 block mb-0.5">Invoice Date</span>
                            <span className="font-mono font-medium">{currentInvoice.invoiceDate}</span>
                          </div>

                          <div>
                            <span className="opacity-60 block mb-0.5">Delivery Order No.</span>
                            <span className="font-mono font-semibold">{currentInvoice.deliveryOrderNo}</span>
                          </div>
                          <div>
                            <span className="opacity-60 block mb-0.5">Delivery Order Date</span>
                            <span className="font-mono font-medium">{currentInvoice.deliveryOrderDate}</span>
                          </div>

                          <div>
                            <span className="opacity-60 block mb-0.5">Payment Terms</span>
                            <span className="font-semibold">{currentInvoice.paymentTerms}</span>
                          </div>
                          <div>
                            <span className="opacity-60 block mb-0.5">Net Due Date</span>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{currentInvoice.netDueDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* JDE Group Box: Sold To / Customer Master */}
                      <div className={`rounded-2xl p-6 ${getCardClasses()}`}>
                        <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-white/10 mb-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-xs ${
                            theme === 'professional' ? 'bg-[#0A4A82]' : 'bg-emerald-600'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold uppercase tracking-wide leading-tight">
                              Sold To / Customer Master
                            </h2>
                            <p className="text-[11px] opacity-65 font-mono">Address Book Master: P01012</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="opacity-60 block mb-0.5">Customer Name & Customer No.</span>
                            <span className="text-sm font-bold">
                              {currentInvoice.customerName}{' '}
                              <span className="font-mono text-xs font-normal opacity-75">({currentInvoice.customerNo})</span>
                            </span>
                          </div>

                          <div>
                            <span className="opacity-60 block mb-0.5">Billing Address</span>
                            <span className="leading-relaxed block opacity-90">{currentInvoice.customerAddress}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-1">
                            <div>
                              <span className="opacity-60 block mb-0.5">Email</span>
                              <span className="font-medium text-[#003366] dark:text-sky-400">{currentInvoice.customerEmail}</span>
                            </div>
                            <div>
                              <span className="opacity-60 block mb-0.5">Contact Number</span>
                              <span className="font-mono font-medium">{currentInvoice.customerContactNo}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* JDE INVOICE LINE DETAILS (High-Density Enterprise Grid with Soft Blue Headers #D9E5F2) */}
                    <div className={`rounded-2xl overflow-hidden ${getCardClasses()}`}>
                      <div className={`p-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between ${getSecondarySurfaceClasses()}`}>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-[#003366] dark:text-sky-400" />
                          <h3 className="text-sm font-bold">
                            Invoice Line Details <span className="font-mono text-xs font-normal opacity-75">(secuser.Vw_SalesInvoiceDetail)</span>
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#003366] text-white text-[11px]">
                            {currentInvoice.lines.length} Line Records
                          </span>
                        </div>
                        <span className="text-xs font-semibold">
                          Currency: <strong className="font-mono text-emerald-700 dark:text-emerald-400">BHD (Bahrain Dinar)</strong>
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className={`font-bold uppercase tracking-wider border-b-2 ${
                            theme === 'professional' 
                              ? 'bg-[#D9E5F2] text-[#0F2439] border-[#B5C7D9]' 
                              : theme === 'dark' 
                              ? 'bg-slate-800 text-slate-200 border-slate-700' 
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            <tr>
                              <th className="py-2.5 px-3 w-10 border-r border-black/10 dark:border-white/10 text-center">#</th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10">Item Code</th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10 min-w-[240px]">Item Description</th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10 text-right">Weight (MT)</th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10 text-right">Unit Price</th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10 text-right">Value</th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30">
                                Unit Price (BHD)
                              </th>
                              <th className="py-2.5 px-3 border-r border-black/10 dark:border-white/10 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30">
                                Value (BHD)
                              </th>
                              <th className="py-2.5 px-3 text-center">VAT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {currentInvoice.lines.map((line, idx) => (
                              <tr key={line.lineNumber} className={`transition-colors ${
                                idx % 2 === 1 
                                  ? theme === 'professional' ? 'bg-[#F4F8FC]' : theme === 'dark' ? 'bg-[#0E1626]' : 'bg-slate-50' 
                                  : 'bg-white dark:bg-[#111827]'
                              } hover:bg-blue-50/60 dark:hover:bg-slate-800/60`}>
                                <td className="py-2.5 px-3 font-mono opacity-60 text-center border-r border-black/5 dark:border-white/5">{line.lineNumber}</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#003366] dark:text-sky-300 border-r border-black/5 dark:border-white/5">{line.itemCode}</td>
                                <td className="py-2.5 px-3 font-medium border-r border-black/5 dark:border-white/5">{line.itemDescription}</td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums border-r border-black/5 dark:border-white/5">
                                  {line.weightMetricTons.toFixed(4)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums border-r border-black/5 dark:border-white/5">
                                  {line.unitPrice.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums border-r border-black/5 dark:border-white/5">
                                  {line.value.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums border-r border-black/5 dark:border-white/5 bg-emerald-50/30 dark:bg-emerald-950/20">
                                  {line.unitPriceBHD.toFixed(4)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 dark:text-emerald-200 tabular-nums border-r border-black/5 dark:border-white/5 bg-emerald-50/30 dark:bg-emerald-950/20">
                                  {line.valueBHD.toFixed(3)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono bg-[#E0EBF5] text-[#003366] dark:bg-blue-950 dark:text-blue-300 border border-[#B8C7D8]/60">
                                    {line.vatRate}% ({line.vatCategoryCode})
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className={`font-semibold border-t-2 ${
                            theme === 'professional' ? 'bg-[#EAF0F6] border-[#B8C7D8]' : getSecondarySurfaceClasses()
                          }`}>
                            <tr>
                              <td colSpan={3} className="py-3 px-3 font-bold border-r border-black/10 dark:border-white/10">Total Metric Tons</td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums border-r border-black/10 dark:border-white/10">
                                {currentInvoice.totalWeightMetricTons.toFixed(4)} MT
                              </td>
                              <td colSpan={2} className="py-3 px-3 text-right opacity-70 border-r border-black/10 dark:border-white/10">
                                Total Line Net in BHD:
                              </td>
                              <td colSpan={2} className="py-3 px-3 text-right font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm tabular-nums border-r border-black/10 dark:border-white/10 bg-emerald-50/50">
                                {currentInvoice.totalLineNetAmountBHD.toFixed(3)} BHD
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-xs text-amber-700 dark:text-amber-400">
                                +{currentInvoice.totalTaxAmountBHD.toFixed(3)} VAT
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Total Amount Ribbon */}
                      <div className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t ${
                        theme === 'professional' 
                          ? 'bg-[#003366] text-white border-[#C89D2B]' 
                          : theme === 'dark' 
                          ? 'bg-[#0B0F19] text-white border-slate-800' 
                          : 'bg-slate-900 text-white border-slate-800'
                      }`}>
                        <div className="text-xs opacity-90">
                          <span className="font-bold text-[#F4D06F]">Statutory NBR Exchange Rate:</span> 1 USD = 0.376 BHD (Converted for Bahrain Tax Authorities)
                        </div>
                        <div className="flex items-center gap-6 text-xs">
                          <div>
                            <span className="opacity-70 block">Line Net:</span>
                            <span className="font-mono text-sm font-semibold">{currentInvoice.totalLineNetAmountBHD.toFixed(3)} BHD</span>
                          </div>
                          <div>
                            <span className="opacity-70 block">VAT (10%):</span>
                            <span className="font-mono text-sm font-semibold text-[#F4D06F]">+{currentInvoice.totalTaxAmountBHD.toFixed(3)} BHD</span>
                          </div>
                          <div className="pl-4 border-l border-white/20">
                            <span className="opacity-70 block">Grand Total:</span>
                            <span className="font-mono text-lg font-bold text-emerald-300">{currentInvoice.totalInvoiceAmountBHD.toFixed(3)} BHD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CYGNET PROCESSING RESULT CARD */}
                    {processResult && (
                      <div className={`rounded-2xl p-6 ${getCardClasses()}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            {processResult.success ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-rose-600" />
                            )}
                            <h3 className="text-sm font-bold">
                              Cygnet Global E-Invoicing Submission Result
                            </h3>
                          </div>

                          <button
                            onClick={() => setShowPayloadModal(true)}
                            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${getPrimaryPillBtnClasses()}`}
                          >
                            <Code2 className="w-3.5 h-3.5 inline mr-1" />
                            <span>View JSON Payloads</span>
                          </button>
                        </div>

                        <div className={`p-4 rounded-xl text-xs mb-4 font-medium ${
                          processResult.success 
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-50 text-rose-950 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
                        }`}>
                          {processResult.message}
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-4 rounded-xl ${getSecondarySurfaceClasses()}`}>
                          <div>
                            <span className="opacity-60 block mb-0.5">Reference ID</span>
                            <span className="font-mono font-bold text-sm text-[#003366] dark:text-sky-400">
                              {processResult.referenceId || 'N/A'}
                            </span>
                          </div>

                          <div>
                            <span className="opacity-60 block mb-0.5">Auth Token Lifetime</span>
                            <span className="font-mono">
                              {processResult.tokenFromCache ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Reused 6-Hour Cache</span>
                              ) : (
                                <span className="font-bold">Newly Issued Token</span>
                              )}
                            </span>
                          </div>

                          <div>
                            <span className="opacity-60 block mb-0.5">Timestamp (UTC)</span>
                            <span className="font-mono">
                              {new Date(processResult.processedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: ALL JDE INVOICES VIEW (secuser.Vw_SalesInvoiceDetail) */}
            {activeTab === 'all-invoices' && (
              <div className={`rounded-2xl p-6 space-y-5 ${getCardClasses()}`}>
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#003366] dark:text-sky-400" />
                      GARMCO JDE ERP Database View: <code>secuser.Vw_SalesInvoiceDetail</code>
                    </h2>
                    <p className="text-xs opacity-65">
                      Querying SQL Server production view with EF Core Database-First mapping.
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification({ type: 'info', message: 'Refreshed records from secuser.Vw_SalesInvoiceDetail.' })}
                    className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all ${getResetPillBtnClasses()}`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                    <span>Refresh View</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`font-semibold uppercase tracking-wider border-b ${
                      theme === 'professional' ? 'bg-[#D9E5F2] text-[#0F2439] border-[#B5C7D9]' : theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3 px-3.5">Invoice No.</th>
                        <th className="py-3 px-3.5">Date</th>
                        <th className="py-3 px-3.5">DO No.</th>
                        <th className="py-3 px-3.5">Customer Name</th>
                        <th className="py-3 px-3.5">Payment Terms</th>
                        <th className="py-3 px-3.5 text-right">Net Value (BHD)</th>
                        <th className="py-3 px-3.5 text-right">Total (BHD)</th>
                        <th className="py-3 px-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {JDE_SAMPLE_INVOICES.map((inv) => (
                        <tr key={inv.invoiceNo} className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-[#003366] dark:text-sky-400">{inv.invoiceNo}</td>
                          <td className="py-3 px-3.5 font-mono opacity-80">{inv.invoiceDate.slice(0, 10)}</td>
                          <td className="py-3 px-3.5 font-mono">{inv.deliveryOrderNo}</td>
                          <td className="py-3 px-3.5 font-semibold">{inv.customerName}</td>
                          <td className="py-3 px-3.5 opacity-80">{inv.paymentTerms}</td>
                          <td className="py-3 px-3.5 text-right font-mono tabular-nums">{inv.totalLineNetAmountBHD.toFixed(3)}</td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                            {inv.totalInvoiceAmountBHD.toFixed(3)}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <button
                              onClick={() => {
                                simulateJdeClick(inv.invoiceNo);
                                setActiveTab('invoice');
                              }}
                              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${getPrimaryPillBtnClasses()}`}
                            >
                              Open & Process
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: CYGNET GLOBAL API CONFIG */}
            {activeTab === 'cygnet-config' && (
              <div className={`rounded-2xl p-6 space-y-6 ${getCardClasses()}`}>
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-600" />
                      Cygnet Global E-Invoicing API Configuration
                    </h2>
                    <p className="text-xs opacity-65">
                      Staging endpoint specifications, client credentials, and 6-hour token lifecycle settings.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full font-bold bg-[#D9E5F2] text-[#003366] dark:bg-blue-950 dark:text-blue-300">
                    Version: enriched/v0.1
                  </span>
                </div>

                <div className={`p-4 rounded-xl flex items-center justify-between ${getSecondarySurfaceClasses()}`}>
                  <div>
                    <h3 className="text-sm font-semibold">Execution Mode</h3>
                    <p className="text-xs opacity-70 mt-0.5">
                      {isSandbox 
                        ? 'Sandbox Simulation: Generates authentic Cygnet response payloads and reference IDs without requiring active network connectivity.' 
                        : 'Live Staging: Calls actual Cygnet endpoints with the configured credentials.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !isSandbox;
                      setIsSandbox(next);
                      cygnetService.isSandbox = next;
                      setNotification({ type: 'info', message: `Switched to ${next ? 'Sandbox Simulation' : 'Live Staging'} mode.` });
                    }}
                    className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-md ${
                      isSandbox ? getProcessPillBtnClasses() : getPrimaryPillBtnClasses()
                    }`}
                  >
                    {isSandbox ? 'Sandbox Mode Active' : 'Live Staging Active'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Authentication API Endpoint</label>
                    <input
                      type="text"
                      readOnly
                      value={cygnetService.authEndpoint}
                      className="w-full p-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 font-mono text-[11px]"
                    />
                    <span className="text-[10px] opacity-60 mt-1 block">POST • Headers: client-id, client-secret</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Documents API (Save Documents)</label>
                    <input
                      type="text"
                      readOnly
                      value={cygnetService.saveDocumentEndpoint}
                      className="w-full p-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 font-mono text-[11px]"
                    />
                    <span className="text-[10px] opacity-60 mt-1 block">POST • Headers: auth-token, callback-url</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Client ID (Header: client-id)</label>
                    <input
                      type="text"
                      defaultValue={cygnetService.clientId}
                      className="w-full p-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-transparent font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Client Secret (Header: client-secret)</label>
                    <input
                      type="password"
                      defaultValue={cygnetService.clientSecret}
                      className="w-full p-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-transparent font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CLEAN ARCHITECTURE SOLUTION EXPLORER (.NET 8 C#) */}
            {activeTab === 'clean-architecture' && (
              <div className={`rounded-2xl p-6 space-y-4 ${getCardClasses()}`}>
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-emerald-600" />
                      Clean Architecture Solution Structure (EInvoicing.sln)
                    </h2>
                    <p className="text-xs opacity-65">
                      GARMCO E-Invoicing Portal: .NET 8, C#, EF Core SQL Server, Blazor Server, MudBlazor 8.8.0.
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Compiled: 0 Warnings, 0 Errors
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* File Tree */}
                  <div className={`rounded-xl p-3 text-xs font-mono space-y-1 max-h-[500px] overflow-y-auto border border-black/10 dark:border-white/10 ${getSecondarySurfaceClasses()}`}>
                    <div className="font-bold px-2 py-1 rounded bg-black/10 dark:bg-white/10">EInvoicing.sln</div>
                    
                    <div className="pt-1.5 font-bold text-[#003366] dark:text-sky-300 px-2">📁 EInvoicing.Domain</div>
                    {[
                      'SalesInvoiceDetailView.cs',
                      'SalesInvoiceHeader.cs',
                      'SalesInvoiceLine.cs',
                      'CygnetAuthToken.cs',
                      'ISalesInvoiceRepository.cs',
                      'DomainEnums.cs',
                      'DomainExceptions.cs',
                      'EInvoicing.Domain.csproj'
                    ].map((file) => (
                      <button
                        key={file}
                        onClick={() => setSelectedSolutionFile(file)}
                        className={`w-full text-left px-4 py-1 rounded-full truncate transition-colors ${
                          selectedSolutionFile === file ? 'bg-[#003366] text-white font-semibold' : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        📄 {file}
                      </button>
                    ))}

                    <div className="pt-2 font-bold text-purple-700 dark:text-purple-300 px-2">📁 EInvoicing.Application</div>
                    {[
                      'SalesInvoiceDto.cs',
                      'CygnetAuthenticateDto.cs',
                      'CygnetSaveDocumentDto.cs',
                      'ICygnetEInvoicingService.cs',
                      'ISalesInvoiceService.cs',
                      'GetInvoiceByNumberQuery.cs',
                      'ProcessInvoiceCommand.cs',
                      'SalesInvoiceService.cs',
                      'EInvoicing.Application.csproj'
                    ].map((file) => (
                      <button
                        key={file}
                        onClick={() => setSelectedSolutionFile(file)}
                        className={`w-full text-left px-4 py-1 rounded-full truncate transition-colors ${
                          selectedSolutionFile === file ? 'bg-purple-600 text-white font-semibold' : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        📄 {file}
                      </button>
                    ))}

                    <div className="pt-2 font-bold text-amber-700 dark:text-amber-300 px-2">📁 EInvoicing.Infrastructure</div>
                    {[
                      'AppDbContext.cs',
                      'SalesInvoiceDetailViewConfiguration.cs',
                      'SalesInvoiceRepository.cs',
                      'CygnetEInvoicingService.cs',
                      'InvoiceSampleData.cs',
                      'EInvoicing.Infrastructure.csproj'
                    ].map((file) => (
                      <button
                        key={file}
                        onClick={() => setSelectedSolutionFile(file)}
                        className={`w-full text-left px-4 py-1 rounded-full truncate transition-colors ${
                          selectedSolutionFile === file ? 'bg-amber-600 text-white font-semibold' : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        📄 {file}
                      </button>
                    ))}

                    <div className="pt-2 font-bold text-emerald-700 dark:text-emerald-300 px-2">📁 EInvoicing.Web</div>
                    {[
                      'InvoiceDetails.razor',
                      'InvoiceDetails.razor.cs',
                      'InvoiceList.razor',
                      'InvoiceList.razor.cs',
                      'CygnetConfig.razor',
                      'CygnetConfig.razor.cs',
                      'Program.cs',
                      'appsettings.json',
                      'MainLayout.razor',
                      '_Host.cshtml',
                      'EInvoicing.Web.csproj'
                    ].map((file) => (
                      <button
                        key={file}
                        onClick={() => setSelectedSolutionFile(file)}
                        className={`w-full text-left px-4 py-1 rounded-full truncate transition-colors ${
                          selectedSolutionFile === file ? 'bg-[#003366] text-white font-semibold' : 'hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        📄 {file}
                      </button>
                    ))}
                  </div>

                  {/* Code Viewer */}
                  <div className="md:col-span-2 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden flex flex-col bg-slate-900 text-slate-100">
                    <div className="p-3 bg-slate-800 flex items-center justify-between border-b border-slate-700 text-xs font-mono">
                      <span className="text-emerald-400 font-semibold">{selectedSolutionFile}</span>
                      <button
                        onClick={() => handleCopyCode(getCodeSnippet(selectedSolutionFile))}
                        className="rounded-full px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy C# Code'}</span>
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono overflow-auto max-h-[460px] leading-relaxed text-slate-300">
                      {getCodeSnippet(selectedSolutionFile)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* RAW JSON PAYLOAD MODAL */}
      {showPayloadModal && processResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#003366] dark:text-sky-400" />
                <h3 className="text-sm font-bold">
                  Oracle JDE ERP / Cygnet Global E-Invoicing JSON Payload Inspector
                </h3>
              </div>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <button
                onClick={() => setModalPayloadType('request')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  modalPayloadType === 'request'
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 hover:bg-slate-200'
                }`}
              >
                Request Payload (Save Documents Schema)
              </button>
              <button
                onClick={() => setModalPayloadType('response')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  modalPayloadType === 'response'
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 hover:bg-slate-200'
                }`}
              >
                Response Payload (Reference ID)
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950 text-slate-200 text-xs font-mono">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  modalPayloadType === 'request' ? processResult.rawRequestPayload : processResult.rawResponsePayload,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="opacity-70 font-mono">
                {modalPayloadType === 'request' ? 'Endpoint: /document/save' : 'Endpoint: /document/save -> HTTP 200 OK'}
              </span>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="rounded-full px-5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white font-semibold shadow-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to provide quick preview snippets for the C# Clean Architecture viewer tab
function getCodeSnippet(filename: string): string {
  switch (filename) {
    case 'SalesInvoiceDetailView.cs':
      return `namespace EInvoicing.Domain.Entities;

// Maps to SQL Server database view: secuser.Vw_SalesInvoiceDetail
public class SalesInvoiceDetailView
{
    public string InvoiceNo { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public string DeliveryOrderNo { get; set; } = string.Empty;
    public DateTime DeliveryOrderDate { get; set; }
    public string CustomerNo { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerContactNo { get; set; } = string.Empty;
    public string PaymentTerms { get; set; } = string.Empty;
    public DateTime NetDueDate { get; set; }

    public int LineNumber { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemDescription { get; set; } = string.Empty;
    public decimal WeightMetricTons { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Value { get; set; }
    public decimal UnitPriceBHD { get; set; }
    public decimal ValueBHD { get; set; }
    public decimal VatRate { get; set; } = 10.0m;
    public decimal VatAmountBHD { get; set; }
    public string VatCategoryCode { get; set; } = "S";
}`;

    case 'InvoiceDetails.razor.cs':
      return `namespace EInvoicing.Web.Pages.Invoices;

public partial class InvoiceDetails : ComponentBase
{
    [Inject] private ISalesInvoiceService SalesInvoiceService { get; set; } = default!;
    [Inject] private NavigationManager NavigationManager { get; set; } = default!;
    [Inject] private ISnackbar Snackbar { get; set; } = default!;

    [SupplyParameterFromQuery(Name = "invoiceNo")]
    public string? QueryInvoiceNo { get; set; }

    private MudTextField<string>? _invoiceNumberInput;
    private string _searchInvoiceNo = string.Empty;
    private SalesInvoiceDto? _invoice;

    protected override async Task OnInitializedAsync()
    {
        if (!string.IsNullOrWhiteSpace(QueryInvoiceNo))
        {
            _searchInvoiceNo = QueryInvoiceNo.Trim();
            await SearchInvoiceAsync();
        }
    }

    private async Task SearchInvoiceAsync()
    {
        _invoice = await SalesInvoiceService.GetInvoiceByNumberAsync(_searchInvoiceNo);
        if (_invoice == null)
            Snackbar.Add("Invoice not found in secuser.Vw_SalesInvoiceDetail.", Severity.Error);
    }

    private async Task ResetFormAsync()
    {
        _searchInvoiceNo = string.Empty;
        _invoice = null;
        if (_invoiceNumberInput != null)
            await _invoiceNumberInput.FocusAsync();
        Snackbar.Add("Form cleared.", Severity.Info);
    }

    private async Task ProcessInvoiceAsync()
    {
        var result = await SalesInvoiceService.ProcessInvoiceAsync(_invoice.InvoiceNo);
        if (result.Success)
            Snackbar.Add($"Processed! Ref ID: {result.ReferenceId}", Severity.Success);
    }

    private string? ValidateInvoiceNumber(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return "Invoice Number is required to query secuser.Vw_SalesInvoiceDetail.";
        if (value.Trim().Length < 3)
            return "Invoice Number must contain at least 3 characters.";
        return null;
    }
}`;

    case 'MainLayout.razor':
      return `@inherits LayoutComponentBase

<MudThemeProvider Theme="_currentTheme" IsDarkMode="@(_currentThemeMode == "Dark")" />
<MudDialogProvider />
<MudSnackbarProvider />

<MudLayout>
    <MudAppBar Elevation="2" Style="@GetAppBarStyle()">
        <MudIconButton Icon="@Icons.Material.Filled.Menu" Color="Color.Inherit" Edge="Edge.Start" OnClick="@((e) => DrawerToggle())" />
        <MudText Typo="Typo.h6" Class="ml-2 font-weight-bold">
            <i class="fa-solid fa-industry mr-2"></i> GARMCO E-Invoicing Portal
        </MudText>
        <MudChip T="string" Color="Color.Warning" Size="Size.Small" Class="ml-4 rounded-pill">
            Bahrain NBR Compliant
        </MudChip>
        <MudSpacer />
        
        <!-- Application-Wide Visual Theme Switcher -->
        <MudButtonGroup Variant="Variant.Filled" Size="Size.Small" Class="rounded-pill shadow-sm">
            <MudButton Color="@(_currentThemeMode == "Professional" ? Color.Warning : Color.Dark)" OnClick="@(() => SetTheme("Professional"))">
                Professional (JDE)
            </MudButton>
            <MudButton Color="@(_currentThemeMode == "Light" ? Color.Primary : Color.Dark)" OnClick="@(() => SetTheme("Light"))">
                Light Mode
            </MudButton>
            <MudButton Color="@(_currentThemeMode == "Dark" ? Color.Info : Color.Dark)" OnClick="@(() => SetTheme("Dark"))">
                Dark Mode
            </MudButton>
        </MudButtonGroup>
    </MudAppBar>

    <MudMainContent Class="pa-6 pa-md-8 pt-8">
        @Body
    </MudMainContent>
</MudLayout>`;

    case 'AppDbContext.cs':
      return `using EInvoicing.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EInvoicing.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Keyless Entity mapping database view secuser.Vw_SalesInvoiceDetail
    public DbSet<SalesInvoiceDetailView> SalesInvoiceDetails => Set<SalesInvoiceDetailView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SalesInvoiceDetailView>(b =>
        {
            b.ToView("Vw_SalesInvoiceDetail", "secuser");
            b.HasNoKey();
        });
    }
}`;

    case 'CygnetEInvoicingService.cs':
      return `namespace EInvoicing.Infrastructure.Services;

public class CygnetEInvoicingService : ICygnetEInvoicingService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _memoryCache;
    private const string TokenCacheKey = "Cygnet_Auth_Token_Cache";

    public async Task<string> GetAuthenticationTokenAsync(bool forceRefresh = false, CancellationToken ct = default)
    {
        if (!forceRefresh && _memoryCache.TryGetValue(TokenCacheKey, out CygnetAuthToken? token))
        {
            if (!token.IsExpired && !token.NeedsRefreshSoon)
                return token.Token;
        }

        // Call Cygnet POST /authenticate/token with client-id, client-secret
        // Caches token for 360 minutes (6 hours)
        ...
    }

    public async Task<CygnetSaveDocumentResponseDto> SaveDocumentAsync(...)
    {
        var token = await GetAuthenticationTokenAsync();
        // Sets auth-token and callback-url headers
        ...
    }
}`;

    case 'appsettings.json':
      return `{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=JDE_PRODUCTION;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "CygnetEInvoicing": {
    "SandboxMode": true,
    "AuthEndpoint": "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/authenticate/token",
    "SaveDocumentEndpoint": "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/document/save",
    "ClientId": "GARMCO_BH_CLIENT_001",
    "ClientSecret": "CYGNET_SEC_889922A",
    "Username": "garmco_tax_officer",
    "Password": "Password123!",
    "CallbackUrl": "https://jde-einvoicing.example.com/api/webhook/cygnet"
  }
}`;

    default:
      return `// File: ${filename}
// Included in Clean Architecture solution: EInvoicing.sln
// GARMCO E-Invoicing Portal - Oracle JD Edwards EnterpriseOne ERP Theme`;
  }
}
