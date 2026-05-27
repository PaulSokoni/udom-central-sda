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

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    first_name: '', middle_name: '', last_name: '', gender: 'M',
    date_of_birth: '', marital_status: 'single', phone: '', email: '',
    address: '', occupation: '', baptism_date: today, membership_date: today,
    membership_status: 'active', department: '', is_tithe_paying: false,
    emergency_contact_name: '', emergency_contact_phone: '', notes: '', registered_by: '',
  });
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dobError, setDobError] = useState('');
  const [baptismDateError, setBaptismDateError] = useState('');
  const [membershipDateError, setMembershipDateError] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFirstNameChange = v => set('first_name', v);

  const handleLastNameChange = v => {
    set('last_name', v);
    if (!isEdit) {
      setUsername(v.toLowerCase().replace(/\s+/g, ''));
      if (v) {
        const cap = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        setPassword(`Udom@${cap}`);
      }
    }
  };

  const handleDobChange = v => {
    set('date_of_birth', v);
    if (!v) { setDobError(''); return; }
    const dob = new Date(v);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (dob > today) {
      setDobError('Date of birth cannot be in the future.');
    } else {
      const age = today.getFullYear() - dob.getFullYear() -
        ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0);
      setDobError(age > 120 ? 'Age cannot exceed 120 years.' : '');
    }
  };

  const checkMembershipVsBaptism = (membershipDate, baptismDate) => {
    if (membershipDate && baptismDate && membershipDate < baptismDate) {
      setMembershipDateError('Membership date cannot be before baptism date.');
    } else {
      setMembershipDateError('');
    }
  };

  const handleBaptismDateChange = v => {
    set('baptism_date', v);
    if (v) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (v > todayStr) {
        setBaptismDateError('Baptism date cannot be in the future.');
      } else {
        setBaptismDateError('');
      }
      // Push membership date up to match baptism date if it falls below it
      if (!form.membership_date || form.membership_date < v) {
        set('membership_date', v);
        setMembershipDateError('');
      }
    } else {
      setBaptismDateError('');
    }
    checkMembershipVsBaptism(form.membership_date, v);
  };

  const handleMembershipDateChange = v => {
    set('membership_date', v);
    checkMembershipVsBaptism(v, form.baptism_date);
  };

  const submit = async e => {
    e.preventDefault();

    if (dobError) {
      toast.error(dobError);
      return;
    }

    if (baptismDateError) {
      toast.error(baptismDateError);
      return;
    }

    if (membershipDateError) {
      toast.error(membershipDateError);
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
    if (!isEdit && username && password) {
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
        toast.success(`Member registered: ${r.data.member_id}${username ? ` — Login: ${username} / ${password}` : ''}`);
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
                          <>
                            <input
                              className={`input${
                                (f.name === 'date_of_birth' && dobError) ||
                                (f.name === 'baptism_date' && baptismDateError) ||
                                (f.name === 'membership_date' && membershipDateError)
                                  ? ' border-red-400 focus:border-red-400' : ''
                              }`}
                              type={f.type || 'text'} value={form[f.name]}
                              onChange={e => {
                                if (f.name === 'first_name') handleFirstNameChange(e.target.value);
                                else if (f.name === 'last_name') handleLastNameChange(e.target.value);
                                else if (f.name === 'date_of_birth') handleDobChange(e.target.value);
                                else if (f.name === 'baptism_date') handleBaptismDateChange(e.target.value);
                                else if (f.name === 'membership_date') handleMembershipDateChange(e.target.value);
                                else set(f.name, e.target.value);
                              }}
                              placeholder={f.placeholder} required={f.required}
                              max={f.name === 'date_of_birth' || f.name === 'baptism_date' ? today : undefined}
                              min={f.name === 'membership_date' ? (form.baptism_date || undefined) : undefined}
                            />
                            {f.name === 'date_of_birth' && dobError && (
                              <p className="text-xs text-red-500 mt-1">{dobError}</p>
                            )}
                            {f.name === 'baptism_date' && baptismDateError && (
                              <p className="text-xs text-red-500 mt-1">{baptismDateError}</p>
                            )}
                            {f.name === 'membership_date' && membershipDateError && (
                              <p className="text-xs text-red-500 mt-1">{membershipDateError}</p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {!isEdit && username && password && (
          <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            A login account will be created automatically — share these credentials with the member:<br />
            <strong>Username:</strong> {username} &nbsp;·&nbsp; <strong>Password:</strong> {password}
          </div>
        )}

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
