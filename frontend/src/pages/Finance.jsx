import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const INCOME_CATS = ['tithe','offering','thanksgiving','building','missions','pledge_payment','donation','other'];
const EXPENSE_CATS = ['utilities','maintenance','supplies','salaries','missions','events','welfare','other'];

function fmt(n) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }); }

export default function Finance() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ member: '', category: 'tithe', amount: '', date: now.toISOString().slice(0,10), receipt_number: '', notes: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'utilities', description: '', amount: '', date: now.toISOString().slice(0,10), receipt_number: '', approved_by: '', notes: '' });
  const [pledgeForm, setPledgeForm] = useState({ member: '', amount: '', amount_paid: '0', purpose: '', pledge_date: now.toISOString().slice(0,10), due_date: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [iRes, eRes, pRes] = await Promise.all([
        api.get(`/finance/income/?month=${month}&year=${year}`),
        api.get(`/finance/expenses/?month=${month}&year=${year}`),
        api.get('/finance/pledges/'),
      ]);
      setIncome(iRes.data.results || iRes.data);
      setExpenses(eRes.data.results || eRes.data);
      setPledges(pRes.data.results || pRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Access restricted. Treasurer/admin only.');
      } else {
        toast.error('Failed to load financial data');
      }
    } finally { setLoading(false); }
  };

  const loadMembers = async () => {
    const r = await api.get('/members/?page_size=500');
    setMembers(r.data.results || r.data);
  };

  const generateSummary = async () => {
    try {
      const r = await api.post('/finance/summaries/generate/', { month, year });
      setSummary(r.data);
      toast.success('Summary generated');
    } catch { toast.error('Failed to generate summary'); }
  };

  useEffect(() => { load(); }, [month, year]);
  useEffect(() => { loadMembers(); }, []);

  const totalIncome = income.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  const saveIncome = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...incomeForm };
      if (!payload.member) delete payload.member;
      await api.post('/finance/income/', payload);
      toast.success('Income recorded');
      setShowIncomeForm(false);
      load();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const saveExpense = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/finance/expenses/', expenseForm);
      toast.success('Expense recorded');
      setShowExpenseForm(false);
      load();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const savePledge = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...pledgeForm };
      if (!payload.due_date) delete payload.due_date;
      await api.post('/finance/pledges/', payload);
      toast.success('Pledge recorded');
      setShowPledgeForm(false);
      load();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading financial data…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Financial Management</h2>
        <div className="flex gap-2 items-center">
          <select className="input py-1.5 text-sm w-32" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select className="input py-1.5 text-sm w-24" value={year} onChange={e => setYear(+e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-700">TZS {fmt(totalIncome)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">TZS {fmt(totalExpenses)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>TZS {fmt(netBalance)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['income', 'expenses', 'pledges'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn btn-sm capitalize ${tab === t ? 'btn-primary' : 'btn-outline'}`}>{t}</button>
        ))}
        <button onClick={generateSummary} className="btn btn-sm btn-outline ml-auto">Generate Summary</button>
      </div>

      {/* Income Tab */}
      {tab === 'income' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-sm">Income Records — {MONTHS[month-1]} {year}</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowIncomeForm(true)}>+ Record Income</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Member</th>
                  <th className="table-th">Receipt</th>
                  <th className="table-th text-right">Amount (TZS)</th>
                </tr>
              </thead>
              <tbody>
                {income.length === 0 && <tr><td colSpan="5" className="table-td text-center text-gray-400 py-8">No records.</td></tr>}
                {income.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="table-td text-xs">{new Date(r.date).toLocaleDateString('en-GB')}</td>
                    <td className="table-td text-sm">{r.category_display}</td>
                    <td className="table-td text-sm text-gray-500">{r.member_name || '—'}</td>
                    <td className="table-td text-xs text-gray-400">{r.receipt_number || '—'}</td>
                    <td className="table-td text-right font-semibold text-green-700">{fmt(r.amount)}</td>
                  </tr>
                ))}
                {income.length > 0 && (
                  <tr className="bg-green-50 font-bold">
                    <td colSpan="4" className="table-td text-sm text-right">Total</td>
                    <td className="table-td text-right text-green-800">{fmt(totalIncome)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-sm">Expense Records — {MONTHS[month-1]} {year}</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(true)}>+ Record Expense</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Approved By</th>
                  <th className="table-th text-right">Amount (TZS)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && <tr><td colSpan="5" className="table-td text-center text-gray-400 py-8">No records.</td></tr>}
                {expenses.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="table-td text-xs">{new Date(r.date).toLocaleDateString('en-GB')}</td>
                    <td className="table-td text-sm">{r.category_display}</td>
                    <td className="table-td text-sm">{r.description}</td>
                    <td className="table-td text-xs text-gray-400">{r.approved_by || '—'}</td>
                    <td className="table-td text-right font-semibold text-red-700">{fmt(r.amount)}</td>
                  </tr>
                ))}
                {expenses.length > 0 && (
                  <tr className="bg-red-50 font-bold">
                    <td colSpan="4" className="table-td text-sm text-right">Total</td>
                    <td className="table-td text-right text-red-800">{fmt(totalExpenses)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pledges Tab */}
      {tab === 'pledges' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-sm">Pledges</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPledgeForm(true)}>+ Add Pledge</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Member</th>
                  <th className="table-th">Purpose</th>
                  <th className="table-th">Pledged</th>
                  <th className="table-th">Paid</th>
                  <th className="table-th">Balance</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {pledges.length === 0 && <tr><td colSpan="6" className="table-td text-center text-gray-400 py-8">No pledges.</td></tr>}
                {pledges.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td text-sm font-medium">{p.member_name}</td>
                    <td className="table-td text-sm">{p.purpose}</td>
                    <td className="table-td text-sm">{fmt(p.amount)}</td>
                    <td className="table-td text-sm text-green-700">{fmt(p.amount_paid)}</td>
                    <td className="table-td text-sm font-semibold text-amber-700">{fmt(p.balance)}</td>
                    <td className="table-td">
                      <span className={`badge text-xs px-2 py-0.5 rounded-full ${
                        p.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                        p.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                        p.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>{p.status_display}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Income Form Modal */}
      {showIncomeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Record Income</h3>
            <form onSubmit={saveIncome} className="space-y-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={incomeForm.category} onChange={e => setIncomeForm(f => ({ ...f, category: e.target.value }))}>
                  {INCOME_CATS.map(c => <option key={c} value={c}>{c.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Member (optional)</label>
                <select className="input" value={incomeForm.member} onChange={e => setIncomeForm(f => ({ ...f, member: e.target.value }))}>
                  <option value="">— Anonymous —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Amount (TZS)</label>
                  <input type="number" min="0" step="0.01" className="input" value={incomeForm.amount} onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={incomeForm.date} onChange={e => setIncomeForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Receipt Number</label>
                <input className="input" value={incomeForm.receipt_number} onChange={e => setIncomeForm(f => ({ ...f, receipt_number: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowIncomeForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Record Expense</h3>
            <form onSubmit={saveExpense} className="space-y-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATS.map(c => <option key={c} value={c}>{c.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Amount (TZS)</label>
                  <input type="number" min="0" step="0.01" className="input" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Approved By</label>
                <input className="input" value={expenseForm.approved_by} onChange={e => setExpenseForm(f => ({ ...f, approved_by: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowExpenseForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pledge Form Modal */}
      {showPledgeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Add Pledge</h3>
            <form onSubmit={savePledge} className="space-y-3">
              <div>
                <label className="label">Member</label>
                <select className="input" value={pledgeForm.member} onChange={e => setPledgeForm(f => ({ ...f, member: e.target.value }))} required>
                  <option value="">— Select Member —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Purpose</label>
                <input className="input" value={pledgeForm.purpose} onChange={e => setPledgeForm(f => ({ ...f, purpose: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Pledged Amount</label>
                  <input type="number" min="0" step="0.01" className="input" value={pledgeForm.amount} onChange={e => setPledgeForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Amount Paid</label>
                  <input type="number" min="0" step="0.01" className="input" value={pledgeForm.amount_paid} onChange={e => setPledgeForm(f => ({ ...f, amount_paid: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Pledge Date</label>
                  <input type="date" className="input" value={pledgeForm.pledge_date} onChange={e => setPledgeForm(f => ({ ...f, pledge_date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input type="date" className="input" value={pledgeForm.due_date} onChange={e => setPledgeForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowPledgeForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
