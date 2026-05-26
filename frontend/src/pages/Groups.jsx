import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

function OrgCard({ type, items, onAdd, onEdit, onDelete, isAdmin }) {
  const [expanded, setExpanded] = useState(null);
  const [members, setMembers] = useState({});

  const loadMembers = async (id, endpoint) => {
    if (members[id]) { setExpanded(expanded === id ? null : id); return; }
    try {
      const r = await api.get(`/members/?${type === 'department' ? 'department' : type === 'group' ? 'group' : 'choir'}=${id}&page_size=200`);
      setMembers(p => ({ ...p, [id]: r.data.results || r.data }));
      setExpanded(id);
    } catch { toast.error('Failed to load members'); }
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">None added yet.</p>}
      {items.map(item => (
        <div key={item.id} className="card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-blue-900">{item.name}</h4>
              {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {type === 'choir' ? 'Director' : 'Leader'}: {item.leader_name || item.director_name || '—'} &bull; {item.member_count} member{item.member_count !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="btn btn-outline btn-sm" onClick={() => loadMembers(item.id)}>
                {expanded === item.id ? 'Hide' : 'Members'}
              </button>
              {isAdmin && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => onEdit(item)}>Edit</button>
                  <button className="btn btn-sm bg-red-50 text-red-700 border border-red-200" onClick={() => onDelete(item.id)}>Del</button>
                </>
              )}
            </div>
          </div>
          {expanded === item.id && members[item.id] && (
            <div className="mt-3 border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Members ({members[item.id].length})</p>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {members[item.id].map(m => (
                  <div key={m.id} className="text-xs py-1 px-2 bg-gray-50 rounded">{m.full_name} <span className="text-gray-400">{m.member_id}</span></div>
                ))}
                {members[item.id].length === 0 && <p className="text-gray-400 text-xs col-span-2">No members.</p>}
              </div>
            </div>
          )}
        </div>
      ))}
      {isAdmin && (
        <button className="btn btn-outline w-full" onClick={onAdd}>+ Add {type === 'department' ? 'Department' : type === 'group' ? 'Group' : 'Choir'}</button>
      )}
    </div>
  );
}

const DEPT_EMPTY = { name: '', description: '', leader: '' };
const GROUP_EMPTY = { name: '', description: '', leader: '' };
const CHOIR_EMPTY = { name: '', description: '', director: '' };

export default function Groups() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [choirs, setChoirs] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState('departments');
  const [modal, setModal] = useState(null); // { type, editing, form }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [dRes, gRes, cRes, mRes] = await Promise.all([
        api.get('/departments/'),
        api.get('/groups/'),
        api.get('/choirs/'),
        api.get('/members/?page_size=500'),
      ]);
      setDepartments(dRes.data.results || dRes.data);
      setGroups(gRes.data.results || gRes.data);
      setChoirs(cRes.data.results || cRes.data);
      setMembers(mRes.data.results || mRes.data);
    } catch { toast.error('Failed to load data'); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = type => {
    const empty = type === 'department' ? DEPT_EMPTY : type === 'group' ? GROUP_EMPTY : CHOIR_EMPTY;
    setModal({ type, editing: null, form: { ...empty } });
  };

  const openEdit = (type, item) => {
    let form;
    if (type === 'department') form = { name: item.name, description: item.description || '', leader: item.leader || '' };
    else if (type === 'group') form = { name: item.name, description: item.description || '', leader: item.leader || '' };
    else form = { name: item.name, description: item.description || '', director: item.director || '' };
    setModal({ type, editing: item.id, form });
  };

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    const { type, editing, form } = modal;
    const endpoint = type === 'department' ? '/departments/' : type === 'group' ? '/groups/' : '/choirs/';
    const payload = { ...form };
    if (!payload.leader) delete payload.leader;
    if (!payload.director) delete payload.director;
    try {
      if (editing) await api.patch(`${endpoint}${editing}/`, payload);
      else await api.post(endpoint, payload);
      toast.success('Saved');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  const del = async (type, id) => {
    if (!confirm('Delete?')) return;
    const endpoint = type === 'department' ? '/departments/' : type === 'group' ? '/groups/' : '/choirs/';
    try {
      await api.delete(`${endpoint}${id}/`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const isAdmin = user?.is_staff;

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Departments, Groups & Choirs</h2>

      <div className="flex gap-2 mb-5">
        {['departments', 'groups', 'choirs'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn btn-sm capitalize ${tab === t ? 'btn-primary' : 'btn-outline'}`}>{t}</button>
        ))}
      </div>

      {tab === 'departments' && (
        <OrgCard type="department" items={departments}
          onAdd={() => openAdd('department')}
          onEdit={item => openEdit('department', item)}
          onDelete={id => del('department', id)}
          isAdmin={isAdmin} />
      )}
      {tab === 'groups' && (
        <OrgCard type="group" items={groups}
          onAdd={() => openAdd('group')}
          onEdit={item => openEdit('group', item)}
          onDelete={id => del('group', id)}
          isAdmin={isAdmin} />
      )}
      {tab === 'choirs' && (
        <OrgCard type="choir" items={choirs}
          onAdd={() => openAdd('choir')}
          onEdit={item => openEdit('choir', item)}
          onDelete={id => del('choir', id)}
          isAdmin={isAdmin} />
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4 capitalize">
              {modal.editing ? 'Edit' : 'Add'} {modal.type}
            </h3>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={modal.form.name}
                  onChange={e => setModal(m => ({ ...m, form: { ...m.form, name: e.target.value } }))}
                  required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows="2" value={modal.form.description}
                  onChange={e => setModal(m => ({ ...m, form: { ...m.form, description: e.target.value } }))} />
              </div>
              <div>
                <label className="label">{modal.type === 'choir' ? 'Director' : 'Leader'}</label>
                <select className="input"
                  value={modal.type === 'choir' ? modal.form.director : modal.form.leader}
                  onChange={e => {
                    const key = modal.type === 'choir' ? 'director' : 'leader';
                    setModal(m => ({ ...m, form: { ...m.form, [key]: e.target.value } }));
                  }}>
                  <option value="">— None —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
