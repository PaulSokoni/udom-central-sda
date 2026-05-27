import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const SECTIONS = [
  {
    title: 'Personal Information',
    fields: [
      { name: 'first_name', label: 'First Name', required: true },
      { name: 'middle_name', label: 'Middle Name' },
      { name: 'last_name', label: 'Last Name', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: [['M', 'Male'], ['F', 'Female']], required: true },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { name: 'marital_status', label: 'Marital Status', type: 'select', options: [['single', 'Single'], ['married', 'Married'], ['widowed', 'Widowed'], ['divorced', 'Divorced']] },
      { name: 'phone', label: 'Phone Number', placeholder: '+255 7XX XXX XXX' },
      { name: 'email', label: 'Email Address', type: 'email' },
      { name: 'address', label: 'Home Address', type: 'textarea', full: true },
      { name: 'occupation', label: 'Occupation' },
    ],
  },
  {
    title: 'Membership Details',
    fields: [
      { name: 'baptism_date', label: 'Baptism Date', type: 'date' },
      { name: 'membership_date', label: 'Membership Date', type: 'date', required: true },
      { name: 'membership_status', label: 'Membership Status', type: 'select', options: [['active', 'Active'], ['inactive', 'Inactive'], ['transferred', 'Transferred Out'], ['deceased', 'Deceased']] },
      { name: 'department', label: 'Department / Ministry', type: 'dept' },
      { name: 'is_tithe_paying', label: 'Tithe Paying Member', type: 'checkbox' },
    ],
  },
  {
    title: 'Emergency Contact',
    fields: [
      { name: 'emergency_contact_name', label: 'Contact Name' },
      { name: 'emergency_contact_phone', label: 'Contact Phone' },
    ],
  },
  {
    title: 'Additional Notes',
    fields: [
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
      { name: 'registered_by', label: 'Registered By' },
    ],
  },
];

export default function MemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '', gender: 'M',
    date_of_birth: '', marital_status: 'single', phone: '', email: '',
    address: '', occupation: '', baptism_date: '', membership_date: '',
    membership_status: 'active', department: '', is_tithe_paying: false,
    emergency_contact_name: '', emergency_contact_phone: '', notes: '', registered_by: '',
  });
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);

  // Login account state
  const [createAccount, setCreateAccount] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [existingAccount, setExistingAccount] = useState(null); // { username } if member already has one

  useEffect(() => {
    api.get('/departments/').then(r => setDepartments(r.data.results || r.data));
    if (isEdit) {
      api.get(`/members/${id}/`).then(r => {
        const d = r.data;
        setForm({
          first_name: d.first_name || '', middle_name: d.middle_name || '',
          last_name: d.last_name || '', gender: d.gender || 'M',
          date_of_birth: d.date_of_birth || '', marital_status: d.marital_status || 'single',
          phone: d.phone || '', email: d.email || '', address: d.address || '',
          occupation: d.occupation || '', baptism_date: d.baptism_date || '',
          membership_date: d.membership_date || '',
          membership_status: d.membership_status || 'active',
          department: d.department || '', is_tithe_paying: d.is_tithe_paying || false,
          emergency_contact_name: d.emergency_contact_name || '',
          emergency_contact_phone: d.emergency_contact_phone || '',
          notes: d.notes || '', registered_by: d.registered_by || '',
        });
        if (d.has_account) {
          setExistingAccount({ username: d.account_username });
        }
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-suggest username from first + last name
  const handleFirstNameChange = v => {
    set('first_name', v);
    if (!isEdit && !username) {
      setUsername((v + (form.last_name ? '.' + form.last_name : '')).toLowerCase().replace(/\s+/g, ''));
    }
  };
  const handleLastNameChange = v => {
    set('last_name', v);
    if (!isEdit && !username) {
      setUsername(((form.first_name || '') + (v ? '.' + v : '')).toLowerCase().replace(/\s+/g, ''));
    }
  };

  const submit = async e => {
    e.preventDefault();

    if (createAccount && (!username.trim() || !password.trim())) {
      toast.error('Please enter both username and password for the login account.');
      return;
    }

    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob > today) {
        toast.error('Date of birth cannot be in the future.');
        return;
      }
      const age = today.getFullYear() - dob.getFullYear() -
        ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0);
      if (age > 120) {
        toast.error('Please enter a valid date of birth (age cannot exceed 120 years).');
        return;
      }
    }

    setSaving(true);
    const payload = { ...form };
    // Convert empty strings to null for nullable fields
    ['department', 'date_of_birth', 'baptism_date'].forEach(k => {
      if (payload[k] === '') payload[k] = null;
    });
    // membership_date cannot be null — default to today if empty
    if (!payload.membership_date) {
      payload.membership_date = new Date().toISOString().split('T')[0];
    }
    if (createAccount && username && password) {
      payload.username = username.trim();
      payload.password = password;
    }

    try {
      if (isEdit) {
        await api.patch(`/members/${id}/`, payload);
        toast.success('Member updated successfully.');
        navigate(`/members/${id}`);
      } else {
        const r = await api.post('/members/', payload);
        toast.success(`Member registered: ${r.data.member_id}${createAccount ? ' — Login account created.' : ''}`);
        navigate(`/members/${r.data.id}`);
      }
    } catch (err) {
      const data = err.response?.data || {};
      const detail = data.username?.[0] || data.password?.[0] || data.detail ||
        Object.values(data).flat().find(v => typeof v === 'string') || 'Failed to save. Check required fields.';
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">{isEdit ? 'Edit Member' : 'Register New Member'}</h2>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Cancel</button>
      </div>

      <form onSubmit={submit}>
        {SECTIONS.map(({ title, fields }) => (
          <div key={title} className="card mb-5">
            <div className="card-header">
              <h3 className="font-semibold text-sm text-blue-900">{title}</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f.name} className={f.full ? 'md:col-span-2' : ''}>
                    {f.type === 'checkbox' ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox" id={f.name} checked={form[f.name]}
                          onChange={e => set(f.name, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-800 cursor-pointer"
                        />
                        <label htmlFor={f.name} className="text-sm text-gray-700 cursor-pointer">{f.label}</label>
                      </div>
                    ) : (
                      <>
                        <label className="label">{f.label}{f.required && ' *'}</label>
                        {f.type === 'textarea' ? (
                          <textarea className="input resize-none" rows={2} value={form[f.name]}
                            onChange={e => set(f.name, e.target.value)} />
                        ) : f.type === 'select' ? (
                          <select className="select" value={form[f.name]} onChange={e => set(f.name, e.target.value)} required={f.required}>
                            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        ) : f.type === 'dept' ? (
                          <select className="select" value={form[f.name]} onChange={e => set(f.name, e.target.value || '')}>
                            <option value="">— None —</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        ) : (
                          <input
                            className="input" type={f.type || 'text'} value={form[f.name]}
                            onChange={e => {
                              if (f.name === 'first_name') handleFirstNameChange(e.target.value);
                              else if (f.name === 'last_name') handleLastNameChange(e.target.value);
                              else set(f.name, e.target.value);
                            }}
                            placeholder={f.placeholder} required={f.required}
                            max={f.type === 'date' && f.name === 'date_of_birth' ? new Date().toISOString().split('T')[0] : undefined}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Login Account Section */}
        <div className="card mb-5 border-2 border-blue-100">
          <div className="card-header bg-blue-50">
            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="createAccount"
                checked={createAccount}
                onChange={e => setCreateAccount(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-800 cursor-pointer"
              />
              <label htmlFor="createAccount" className="font-semibold text-sm text-blue-900 cursor-pointer">
                🔑 {isEdit ? 'Update / Create Login Account' : 'Create System Login Account'}
              </label>
            </div>
            {existingAccount && (
              <span className="badge badge-active text-xs">
                Has account: {existingAccount.username}
              </span>
            )}
          </div>

          {createAccount && (
            <div className="card-body">
              {existingAccount && (
                <div className="mb-4 px-4 py-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm rounded">
                  ⚠️ This member already has a login account (<strong>{existingAccount.username}</strong>).
                  Filling in the fields below will update their username and password.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Username *</label>
                  <input
                    className="input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. john.doe"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-400 mt-1">The member will use this to log in.</p>
                </div>
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input
                      className="input pr-16"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Set a password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-700 font-medium"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 8 characters recommended.</p>
                </div>
              </div>
            </div>
          )}

          {!createAccount && (
            <div className="px-5 py-3 text-sm text-gray-400">
              Check the box above to {existingAccount ? 'update the login credentials for' : 'give this member access to'} the system.
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
            {saving ? 'Saving…' : '💾 Save Member'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline btn-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
}
