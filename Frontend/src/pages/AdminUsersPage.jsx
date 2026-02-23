import { useState } from 'react';

export default function AdminUsersPage({ users, onCreateUser, onUpdateUser, onDeleteUser, onSearchUsers }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [search, setSearch] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    await onCreateUser(form);
    setForm({ name: '', email: '', password: '' });
  };

  const editUser = async (user) => {
    const name = window.prompt('New name', user.name);
    if (!name) return;
    await onUpdateUser(user._id, { name });
  };

  const onSearchChange = async (value) => {
    setSearch(value);
    await onSearchUsers(value);
  };

  return (
    <div className="stack-md">
      <h2>Manage users</h2>
      <form className="form-card" onSubmit={submit}>
        <h3>Create user</h3>
        <label>
          Name
          <input value={form.name} required onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} required onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
        </label>
        <label>
          Password
          <input type="password" value={form.password} required onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
        </label>
        <button type="submit">Create user</button>
      </form>

      <div className="form-card">
        <h3>Find users</h3>
        <input
          value={search}
          placeholder="Search by name or email"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="ghost-button" onClick={() => editUser(user)}>Update</button>
                    <button type="button" onClick={() => onDeleteUser(user._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
