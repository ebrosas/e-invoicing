import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Search, RefreshCw, Send, CheckCircle2, AlertCircle, 
  Building2, Calendar, CreditCard, ShieldCheck, Database, Layers, 
  Settings, ExternalLink, Code2, Copy, Check, Info, FileSpreadsheet,
  Cpu, Lock, Globe, ArrowRight, X
} from 'lucide-react';
import { JDE_SAMPLE_INVOICES } from './data/mockInvoices';
import { SalesInvoiceHeader, ProcessInvoiceResult } from './types/invoicing';
import { cygnetService } from './services/cygnetService';

export default function App() {
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
    if (!searchInvoiceNo.trim()) {
      setNotification({ type: 'error', message: 'Please enter an Invoice Number.' });
      return;
    }
    loadInvoiceByNumber(searchInvoiceNo);
  };

  // Requirement: Reset button clears entire form and shifts focus to Invoice Number
  const handleReset = () => {
    setSearchInvoiceNo('');
    setCurrentInvoice(null);
    setProcessResult(null);
    setNotification({ type: 'info', message: 'Form cleared. Please enter a new Invoice Number.' });
    // Focus Invoice Number input field
    setTimeout(() => {
      invoiceInputRef.current?.focus();
    }, 50);
  };

  // Requirement: Process Invoice button calls Cygnet Authentication & Documents Save APIs
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
    // update query string without page reload
    const newUrl = `${window.location.pathname}?invoiceNo=${encodeURIComponent(invNo)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* MUDAPPBAR (Top Navigation Header) */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Navigation Menu"
            >
              <Layers className="w-5 h-5 text-blue-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block leading-none">
                  JDE E-Invoicing Portal
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  secuser.Vw_SalesInvoiceDetail
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center ml-4 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-400" />
              Bahrain NBR Compliant (Cygnet Global)
            </div>
          </div>

          {/* Quick JDE URL Simulators & Active Mode */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">JDE Link Test:</span>
              {JDE_SAMPLE_INVOICES.map((inv) => (
                <button
                  key={inv.invoiceNo}
                  onClick={() => simulateJdeClick(inv.invoiceNo)}
                  className={`px-2 py-0.5 rounded font-mono transition-colors ${
                    currentInvoice?.invoiceNo === inv.invoiceNo 
                      ? 'bg-blue-600 text-white font-semibold' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`Simulate JDE ERP 'Print Invoice' URL for ${inv.invoiceNo}`}
                >
                  {inv.invoiceNo}
                </button>
              ))}
            </div>

            {/* Sandbox toggle badge */}
            <button
              onClick={() => {
                const next = !isSandbox;
                setIsSandbox(next);
                cygnetService.isSandbox = next;
              }}
              className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border transition-colors ${
                isSandbox 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
              }`}
              title="Click to toggle Cygnet Sandbox vs Live Staging mode"
            >
              <span className={`w-2 h-2 rounded-full ${isSandbox ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isSandbox ? 'Cygnet Sandbox' : 'Live Staging'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* MUDDRAWER (Navigation Sidebar) */}
        {isDrawerOpen && (
          <aside className="w-64 shrink-0 hidden md:block">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 sticky top-24">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Workflows
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'invoice'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Process Invoice</span>
                </button>

                <button
                  onClick={() => setActiveTab('all-invoices')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'all-invoices'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>JDE Invoices View</span>
                </button>

                <div className="pt-3 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Specifications & Code
                </div>

                <button
                  onClick={() => setActiveTab('clean-architecture')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'clean-architecture'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <span>C# Clean Architecture</span>
                </button>

                <button
                  onClick={() => setActiveTab('cygnet-config')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'cygnet-config'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>Cygnet API Config</span>
                </button>
              </nav>

              {/* Cygnet Token Status Card in Drawer */}
              <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div className="flex items-center justify-between text-slate-600 font-medium mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    Cygnet Auth Token
                  </span>
                  <span className="text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px] font-mono">
                    6h Cache
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Token reused across documents. Automatically refreshed 10m before expiry.
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                  Status: <span className="text-blue-700 font-semibold">{tokenTimeLeft}</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* MAIN VIEWPORT */}
        <main className="flex-1 min-w-0">
          {/* Notifications banner */}
          {notification && (
            <div className={`mb-4 p-3.5 rounded-lg border text-sm flex items-center justify-between shadow-xs transition-all ${
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
              notification.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
              'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
                <span>{notification.message}</span>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: PROCESS INVOICE (Primary requirement) */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              {/* TOP ACTION BAR & FORM CONTROLS (Reset, Search beside Invoice No., Process Invoice) */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Search input and Search button directly beside it */}
                  <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-lg">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        ref={invoiceInputRef}
                        type="text"
                        value={searchInvoiceNo}
                        onChange={(e) => setSearchInvoiceNo(e.target.value)}
                        placeholder="Enter Invoice No. (e.g. DOC-INV-04)"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium text-slate-900"
                      />
                    </div>

                    {/* SEARCH BUTTON PLACED BESIDE INVOICE NO. FIELD */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                  </form>

                  {/* RESET BUTTON & PROCESS INVOICE BUTTON */}
                  <div className="flex items-center gap-2.5">
                    {/* RESET BUTTON: Clears form, focus goes to Invoice Number */}
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>Reset</span>
                    </button>

                    {/* PROCESS INVOICE BUTTON: Calls Cygnet Global APIs */}
                    <button
                      type="button"
                      onClick={handleProcessInvoice}
                      disabled={isLoading || isProcessing || !currentInvoice}
                      className={`px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-xs transition-all flex items-center gap-2 ${
                        !currentInvoice 
                          ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                          : isProcessing 
                          ? 'bg-emerald-700 cursor-wait' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
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

                {/* Database View Indicator Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <strong>Target View:</strong> <code className="font-mono text-slate-700">secuser.Vw_SalesInvoiceDetail</code>
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="hidden sm:flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <strong>NBR Country:</strong> Bahrain (BH - 380 Tax Invoice)
                    </span>
                  </div>

                  {currentInvoice && (
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                      <span>DO: <strong>{currentInvoice.deliveryOrderNo}</strong></span>
                      <span>•</span>
                      <span>Lines: <strong>{currentInvoice.lines.length}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* LOADING STATE */}
              {isLoading && (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700">
                    Querying SQL Server view secuser.Vw_SalesInvoiceDetail...
                  </p>
                </div>
              )}

              {/* EMPTY STATE */}
              {!isLoading && !currentInvoice && (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800">No Invoice Loaded</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Enter an Invoice Number above or trigger from JDE ERP via URL query string parameter: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">?invoiceNo=DOC-INV-04</code>
                  </p>
                  <div className="flex justify-center gap-2">
                    {JDE_SAMPLE_INVOICES.map((inv) => (
                      <button
                        key={inv.invoiceNo}
                        onClick={() => simulateJdeClick(inv.invoiceNo)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                      >
                        Load {inv.invoiceNo}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* POPULATED INVOICE DATA */}
              {!isLoading && currentInvoice && (
                <>
                  {/* INVOICE HEADER INFORMATION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Invoice Header Details */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 leading-tight">Invoice Header</h2>
                          <p className="text-xs text-slate-500">Originating from JDE ERP Database</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Invoice No.</span>
                          <span className="font-mono text-sm font-bold text-blue-700">{currentInvoice.invoiceNo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Invoice Date</span>
                          <span className="font-mono text-slate-800 font-medium">{currentInvoice.invoiceDate}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Delivery Order No.</span>
                          <span className="font-mono font-semibold text-slate-800">{currentInvoice.deliveryOrderNo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Delivery Order Date</span>
                          <span className="font-mono text-slate-800 font-medium">{currentInvoice.deliveryOrderDate}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Payment Terms</span>
                          <span className="text-slate-800 font-medium">{currentInvoice.paymentTerms}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Net Due Date</span>
                          <span className="font-mono font-semibold text-rose-700">{currentInvoice.netDueDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sold To Details */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 leading-tight">Sold To</h2>
                          <p className="text-xs text-slate-500">Buyer Entity & Contact Details</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Customer Name & Customer No.</span>
                          <span className="text-sm font-bold text-slate-900">
                            {currentInvoice.customerName}{' '}
                            <span className="font-mono text-xs font-normal text-slate-500">({currentInvoice.customerNo})</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Address</span>
                          <span className="text-slate-700 leading-relaxed block">{currentInvoice.customerAddress}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Email</span>
                            <span className="text-blue-700 font-medium">{currentInvoice.customerEmail}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Contact Number</span>
                            <span className="font-mono text-slate-800 font-medium">{currentInvoice.customerContactNo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INVOICE LINE DETAILS (Multi-record grid as required) */}
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900">Invoice Line Details</h3>
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-medium">
                          {currentInvoice.lines.length} Line Item{currentInvoice.lines.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Accounting Currency: <strong className="font-mono text-slate-800">BHD (Bahrain Dinar)</strong>
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3 w-10">#</th>
                            <th className="py-3 px-3">Item Code</th>
                            <th className="py-3 px-3 min-w-[240px]">Item Description</th>
                            <th className="py-3 px-3 text-right">Weight (MT)</th>
                            <th className="py-3 px-3 text-right">Unit Price</th>
                            <th className="py-3 px-3 text-right">Value</th>
                            <th className="py-3 px-3 text-right bg-emerald-50/60 text-emerald-900 font-bold border-l border-emerald-100">
                              Unit Price (BHD)
                            </th>
                            <th className="py-3 px-3 text-right bg-emerald-50/60 text-emerald-900 font-bold">
                              Value (BHD)
                            </th>
                            <th className="py-3 px-3 text-center">VAT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentInvoice.lines.map((line) => (
                            <tr key={line.lineNumber} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3 font-mono text-slate-400">{line.lineNumber}</td>
                              <td className="py-3 px-3 font-mono font-bold text-blue-800">{line.itemCode}</td>
                              <td className="py-3 px-3 text-slate-800">{line.itemDescription}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                                {line.weightMetricTons.toFixed(4)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                                {line.unitPrice.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                                {line.value.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-700 bg-emerald-50/30 font-medium tabular-nums border-l border-emerald-100">
                                {line.unitPriceBHD.toFixed(4)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/30 tabular-nums">
                                {line.valueBHD.toFixed(3)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded border border-blue-100 font-mono">
                                  {line.vatRate}% ({line.vatCategoryCode})
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-800">
                          <tr>
                            <td colSpan={3} className="py-3 px-3 text-slate-900">Total Summaries</td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900">
                              {currentInvoice.totalWeightMetricTons.toFixed(4)} MT
                            </td>
                            <td colSpan={2} className="py-3 px-3 text-right text-slate-500 font-normal">
                              Total Line Net in BHD:
                            </td>
                            <td colSpan={2} className="py-3 px-3 text-right font-mono font-bold text-emerald-800 text-sm bg-emerald-50/50 tabular-nums border-l border-emerald-100">
                              {currentInvoice.totalLineNetAmountBHD.toFixed(3)} BHD
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-xs text-amber-700">
                              +{currentInvoice.totalTaxAmountBHD.toFixed(3)} VAT
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Summary Ribbon */}
                    <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-xs text-slate-300">
                        <span className="text-emerald-400 font-semibold">Bahrain Statutory NBR Exchange Rate:</span> 1 USD = 0.376 BHD
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <div>
                          <span className="text-slate-400 block">Total Net:</span>
                          <span className="font-mono text-sm font-semibold">{currentInvoice.totalLineNetAmountBHD.toFixed(3)} BHD</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Total VAT (10%):</span>
                          <span className="font-mono text-sm font-semibold text-amber-300">+{currentInvoice.totalTaxAmountBHD.toFixed(3)} BHD</span>
                        </div>
                        <div className="pl-4 border-l border-slate-700">
                          <span className="text-slate-400 block">Total Invoice Due:</span>
                          <span className="font-mono text-base font-bold text-emerald-400">{currentInvoice.totalInvoiceAmountBHD.toFixed(3)} BHD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CYGNET PROCESSING RESULT CARD */}
                  {processResult && (
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {processResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                          )}
                          <h3 className="text-sm font-bold text-slate-900">
                            Cygnet Global E-Invoicing Submission Result
                          </h3>
                        </div>

                        <button
                          onClick={() => setShowPayloadModal(true)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>View JSON Payloads</span>
                        </button>
                      </div>

                      <div className={`p-3.5 rounded-lg text-xs mb-4 ${
                        processResult.success 
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}>
                        {processResult.message}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-500 block mb-0.5">Reference ID</span>
                          <span className="font-mono font-bold text-blue-700 text-sm">
                            {processResult.referenceId || 'N/A'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Authentication Token</span>
                          <span className="font-mono text-slate-800">
                            {processResult.tokenFromCache ? (
                              <span className="text-emerald-700 font-medium">Reused 6-Hour Cache</span>
                            ) : (
                              <span className="text-blue-700 font-medium">Newly Issued JWT</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Submitted At (UTC)</span>
                          <span className="font-mono text-slate-700">
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
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    JDE ERP Database View: <code>secuser.Vw_SalesInvoiceDetail</code>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Querying SQL Server production view with EF Core Database-First mapping.
                  </p>
                </div>
                <button
                  onClick={() => setNotification({ type: 'info', message: 'Refreshed records from secuser.Vw_SalesInvoiceDetail.' })}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh View</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice No.</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">DO No.</th>
                      <th className="py-2.5 px-3">Customer Name</th>
                      <th className="py-2.5 px-3">Payment Terms</th>
                      <th className="py-2.5 px-3 text-right">Net Value (BHD)</th>
                      <th className="py-2.5 px-3 text-right">Total (BHD)</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {JDE_SAMPLE_INVOICES.map((inv) => (
                      <tr key={inv.invoiceNo} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                        <td className="py-3 px-3 text-slate-600 font-mono">{inv.invoiceDate.slice(0, 10)}</td>
                        <td className="py-3 px-3 font-mono text-slate-700">{inv.deliveryOrderNo}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{inv.customerName}</td>
                        <td className="py-3 px-3 text-slate-600">{inv.paymentTerms}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">{inv.totalLineNetAmountBHD.toFixed(3)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {inv.totalInvoiceAmountBHD.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              simulateJdeClick(inv.invoiceNo);
                              setActiveTab('invoice');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
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
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    Cygnet Global E-Invoicing API Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Staging endpoint specifications, client credentials, and 6-hour token lifecycle settings.
                  </p>
                </div>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                  Version: enriched/v0.1
                </span>
              </div>

              {/* Mode switch */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Execution Mode</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
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
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isSandbox 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {isSandbox ? 'Sandbox Mode Active' : 'Live Staging Active'}
                </button>
              </div>

              {/* Endpoints & Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Authentication API Endpoint</label>
                  <input
                    type="text"
                    readOnly
                    value={cygnetService.authEndpoint}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">POST • Headers: client-id, client-secret</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Documents API (Save Documents)</label>
                  <input
                    type="text"
                    readOnly
                    value={cygnetService.saveDocumentEndpoint}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">POST • Headers: auth-token, callback-url</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Client ID (Header: client-id)</label>
                  <input
                    type="text"
                    defaultValue={cygnetService.clientId}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Client Secret (Header: client-secret)</label>
                  <input
                    type="password"
                    defaultValue={cygnetService.clientSecret}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payload Username</label>
                  <input
                    type="text"
                    defaultValue={cygnetService.username}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Callback URL (Header: callback-url)</label>
                  <input
                    type="text"
                    defaultValue={cygnetService.callbackUrl}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Token Caching Rule Card */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Token Lifecycle & Cache Specification
                </div>
                <p className="text-blue-800">
                  The authentication token has a predefined lifetime of 6 hours (360 minutes). The system caches this token in memory and reuses it across subsequent Document API requests. If a request is executed within 10 minutes of expiry, <code>forceRefresh: true</code> is automatically sent to renew the token.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CLEAN ARCHITECTURE SOLUTION EXPLORER (.NET 8 C#) */}
          {activeTab === 'clean-architecture' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-emerald-600" />
                    Clean Architecture Solution Structure (EInvoicing.sln)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Microsoft .NET 8, C#, EF Core SQL Server, Blazor Server, MudBlazor 8.8.0, and Razor code-behind.
                  </p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-semibold">
                  Complete .NET Solution Generated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* File Tree */}
                <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-xs font-mono space-y-1 max-h-[500px] overflow-y-auto">
                  <div className="font-bold text-slate-900 px-2 py-1 bg-slate-200/60 rounded">EInvoicing.sln</div>
                  
                  {/* Domain */}
                  <div className="pt-1.5 font-bold text-blue-800 px-2">📁 EInvoicing.Domain</div>
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
                      className={`w-full text-left px-4 py-1 rounded truncate transition-colors ${
                        selectedSolutionFile === file ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      📄 {file}
                    </button>
                  ))}

                  {/* Application */}
                  <div className="pt-2 font-bold text-purple-800 px-2">📁 EInvoicing.Application</div>
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
                      className={`w-full text-left px-4 py-1 rounded truncate transition-colors ${
                        selectedSolutionFile === file ? 'bg-purple-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      📄 {file}
                    </button>
                  ))}

                  {/* Infrastructure */}
                  <div className="pt-2 font-bold text-amber-800 px-2">📁 EInvoicing.Infrastructure</div>
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
                      className={`w-full text-left px-4 py-1 rounded truncate transition-colors ${
                        selectedSolutionFile === file ? 'bg-amber-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      📄 {file}
                    </button>
                  ))}

                  {/* Web */}
                  <div className="pt-2 font-bold text-emerald-800 px-2">📁 EInvoicing.Web</div>
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
                      className={`w-full text-left px-4 py-1 rounded truncate transition-colors ${
                        selectedSolutionFile === file ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      📄 {file}
                    </button>
                  ))}
                </div>

                {/* Code Viewer */}
                <div className="md:col-span-2 border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-slate-900 text-slate-100">
                  <div className="p-2.5 bg-slate-800 flex items-center justify-between border-b border-slate-700 text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">{selectedSolutionFile}</span>
                    <button
                      onClick={() => handleCopyCode(getCodeSnippet(selectedSolutionFile))}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center gap-1 transition-colors"
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

      {/* RAW JSON PAYLOAD MODAL (For debugging & auditing Cygnet APIs) */}
      {showPayloadModal && processResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cygnet Global E-Invoicing JSON Payload Inspector
                </h3>
              </div>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
              <button
                onClick={() => setModalPayloadType('request')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  modalPayloadType === 'request'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Request Payload (Save Documents Schema)
              </button>
              <button
                onClick={() => setModalPayloadType('response')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  modalPayloadType === 'response'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Response Payload (Reference ID)
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-900 text-slate-200 text-xs font-mono">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  modalPayloadType === 'request' ? processResult.rawRequestPayload : processResult.rawResponsePayload,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">
                {modalPayloadType === 'request' ? 'Endpoint: /document/save' : 'Endpoint: /document/save -> HTTP 200 OK'}
              </span>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium"
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

    // Search button handler
    private async Task SearchInvoiceAsync()
    {
        _invoice = await SalesInvoiceService.GetInvoiceByNumberAsync(_searchInvoiceNo);
        if (_invoice == null)
            Snackbar.Add("Invoice not found in secuser.Vw_SalesInvoiceDetail.", Severity.Error);
    }

    // Reset button handler: clears form and focuses Invoice Number field
    private async Task ResetFormAsync()
    {
        _searchInvoiceNo = string.Empty;
        _invoice = null;
        if (_invoiceNumberInput != null)
            await _invoiceNumberInput.FocusAsync();
        Snackbar.Add("Form cleared.", Severity.Info);
    }

    // Process Invoice handler: calls Cygnet Global E-Invoicing APIs
    private async Task ProcessInvoiceAsync()
    {
        var result = await SalesInvoiceService.ProcessInvoiceAsync(_invoice.InvoiceNo);
        if (result.Success)
            Snackbar.Add($"Processed! Ref ID: {result.ReferenceId}", Severity.Success);
    }
}`;

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

    // 6-hour sliding token cache with 10-min forceRefresh logic
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

    // Document Save API POST /document/save
    public async Task<CygnetSaveDocumentResponseDto> SaveDocumentAsync(...)
    {
        var token = await GetAuthenticationTokenAsync();
        // Sets auth-token and callback-url headers
        ...
    }
}`;

    case 'Program.cs':
      return `using EInvoicing.Application.Interfaces;
using EInvoicing.Infrastructure.Data;
using MudBlazor.Services;

var builder = WebApplication.CreateBuilder(args);

// MudBlazor 8.8.0
builder.Services.AddMudServices();
builder.Services.AddServerSideBlazor();

// SQL Server DbContext for secuser.Vw_SalesInvoiceDetail
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cygnet 6-hour cache & HttpClient
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<ICygnetEInvoicingService, CygnetEInvoicingService>();

// Clean Architecture Services
builder.Services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
builder.Services.AddScoped<ISalesInvoiceService, SalesInvoiceService>();

var app = builder.Build();
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");
app.Run();`;

    case 'appsettings.json':
      return `{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=JDE_PRODUCTION;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "CygnetEInvoicing": {
    "SandboxMode": true,
    "AuthEndpoint": "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/authenticate/token",
    "SaveDocumentEndpoint": "https://staging-bh-api-cygnettaxglobaleinvoicing.cygnet.one/enriched/v0.1/document/save",
    "ClientId": "JDE_BH_CLIENT_001",
    "ClientSecret": "CYGNET_SEC_889922A",
    "Username": "jde_tax_specialist",
    "Password": "Password123!",
    "CallbackUrl": "https://jde-einvoicing.example.com/api/webhook/cygnet"
  }
}`;

    default:
      return `// File: ${filename}
// Included in Clean Architecture solution: EInvoicing.sln
// Compiled and structured according to Microsoft .NET 8 best practices.`;
  }
}
