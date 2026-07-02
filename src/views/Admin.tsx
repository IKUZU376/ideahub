import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profilesService } from '../services/profiles';
import { ideasService } from '../services/ideas';
import { User, Idea } from '../types';
import { AlertCircle, Download, Lightbulb, Search, UserPlus, Users, AlertTriangle } from 'lucide-react';

export function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [dbDepts, setDbDepts] = useState<{ id: string; name: string }[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Edit Modal State
  const [selectedEditUser, setSelectedEditUser] = useState<User | null>(null);
  const [modalRole, setModalRole] = useState('Junior Member');
  const [modalDeptId, setModalDeptId] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const loadAdminData = async () => {
    try {
      setError(null);
      const [fetchedUsers, fetchedIdeas, fetchedDepts] = await Promise.all([
        profilesService.getUsers(),
        ideasService.getIdeas(),
        profilesService.getDepartments()
      ]);
      setUsers(fetchedUsers);
      setIdeas(fetchedIdeas);
      setDbDepts(fetchedDepts);
    } catch (err: any) {
      console.error('Admin: Failed to load admin data:', err);
      setError(err.message || 'Failed to load admin management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const unsubscribeProfiles = profilesService.subscribe(loadAdminData);
    const unsubscribeIdeas = ideasService.subscribe(loadAdminData);

    return () => {
      unsubscribeProfiles();
      unsubscribeIdeas();
    };
  }, []);

  // Sync modal values when edit user is selected
  useEffect(() => {
    if (selectedEditUser) {
      setModalRole(selectedEditUser.role);
      setModalDeptId(selectedEditUser.departmentId || 'none');
    }
  }, [selectedEditUser]);

  const handleSaveChanges = async () => {
    if (!selectedEditUser) return;
    
    // Safety check: prevent self-demotion
    if (selectedEditUser.id === currentUser?.id && modalRole !== 'Administrator') {
      alert("Self-demotion is not allowed. You cannot remove your own Administrator role.");
      return;
    }

    // Safety check: prevent removing the last Administrator
    if (selectedEditUser.role === 'Administrator' && modalRole !== 'Administrator') {
      const adminCount = users.filter(u => u.role === 'Administrator').length;
      if (adminCount <= 1) {
        alert("Action blocked. System must have at least one active Administrator.");
        return;
      }
    }

    // Safety check: verify changing roles
    if (modalRole !== selectedEditUser.role) {
      const confirmRole = window.confirm(`Are you sure you want to change ${selectedEditUser.name}'s role from ${selectedEditUser.role} to ${modalRole}?`);
      if (!confirmRole) return;
    }

    // Safety check: verify changing departments
    const currentDeptIdVal = selectedEditUser.departmentId || 'none';
    if (modalDeptId !== currentDeptIdVal) {
      const confirmDept = window.confirm(`Are you sure you want to change ${selectedEditUser.name}'s department assignment?`);
      if (!confirmDept) return;
    }

    setIsSubmitting(true);
    setActionFeedback(null);

    try {
      // 1. Update role if changed
      if (modalRole !== selectedEditUser.role) {
        await profilesService.updateUserRole(selectedEditUser.id, modalRole);
      }

      // 2. Update department if changed
      if (modalDeptId !== currentDeptIdVal) {
        const finalDeptId = modalDeptId === 'none' ? null : modalDeptId;
        await profilesService.updateUserDepartment(selectedEditUser.id, finalDeptId);
      }

      setActionFeedback({ type: 'success', message: `Successfully updated ${selectedEditUser.name}'s profile details.` });
      setSelectedEditUser(null);
    } catch (err: any) {
      console.error('Admin: Error updating user profile:', err);
      setActionFeedback({ type: 'danger', message: err.message || 'Failed to update user profile.' });
    } finally {
      setIsSubmitting(false);
      // Reload profile users list
      const refreshedUsers = await profilesService.getUsers();
      setUsers(refreshedUsers);
    }
  };

  const handleInviteUser = async () => {
    const name = prompt("Enter new user's Full Name:");
    if (!name?.trim()) return;
    
    const email = prompt("Enter Email address:");
    if (!email?.trim()) return;
    
    const role = prompt("Enter Club Role (Junior Member, Department Head, Administrator):", "Junior Member");
    if (!role?.trim()) return;
    
    const department = prompt("Enter Department (Events, Content, PR, Operations, Technical):", "Technical");
    if (!department?.trim()) return;

    setActionFeedback(null);
    try {
      await profilesService.inviteUser(name.trim(), email.trim(), role.trim(), department.trim());
      setActionFeedback({ type: 'success', message: `Successfully invited and registered ${name}!` });
      const refreshedUsers = await profilesService.getUsers();
      setUsers(refreshedUsers);
    } catch (err: any) {
      setActionFeedback({ type: 'danger', message: err.message || 'Failed to invite user.' });
    }
  };

  // Filter pipeline
  const filteredUsers = users.filter(itemUser => {
    const matchesSearch = 
      itemUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemUser.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || itemUser.role === roleFilter;
    const matchesDept = deptFilter === 'all' || (deptFilter === 'none' ? !itemUser.departmentId : itemUser.departmentId === deptFilter);

    return matchesSearch && matchesRole && matchesDept;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredUsers.length, totalPages, currentPage]);

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-text-secondary/80 font-semibold animate-pulse">Loading admin controls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/25 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-12 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">Failed to Load Admin Controls</h3>
          <p className="text-xs text-text-secondary/85 mt-1.5 leading-relaxed">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-bg-surface border border-border-subtle hover:border-primary-hover rounded-xl text-xs font-semibold hover-lift cursor-pointer focus:outline-none"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isAdmin = currentUser?.role?.toLowerCase().includes('admin') || currentUser?.role?.toLowerCase().includes('coordinator');
  if (!isAdmin) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/25 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-12 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">Access Denied</h3>
          <p className="text-xs text-text-secondary/85 mt-1.5 leading-relaxed">
            You do not have administrative permissions to access the Admin panel.
          </p>
        </div>
      </div>
    );
  }

  const activeMembersCount = users.length;
  const pendingReviewsCount = ideas.filter(i => i.status === 'In Review').length;
  const blockedWorkflowsCount = 3;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-tight">Admin Controls</h2>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">Oversee members, permissions, department queues, and idea lifecycle progress.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-strong rounded-xl text-xs font-semibold hover:border-primary/50 hover-lift transition-colors flex items-center gap-2 cursor-pointer focus:outline-none bg-bg-surface/50">
            <Download size={14} /> Export Data
          </button>
          <button 
            onClick={handleInviteUser}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl text-xs font-bold hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none shadow-lg shadow-primary/10"
          >
            <UserPlus size={14} /> Invite User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-bg-surface/50 rounded-2xl p-6 border border-border-subtle/60 glass-card shadow-lg hover-lift relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-primary-hover" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-transparent text-primary flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1">Active Members</div>
            <div className="font-display text-3xl font-extrabold tracking-tight text-text-primary">{activeMembersCount}</div>
          </div>
        </div>
        
        <div className="bg-bg-surface/50 rounded-2xl p-6 border border-border-subtle/60 glass-card shadow-lg hover-lift relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-warning to-amber-400" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <Lightbulb size={18} />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1">Ideas Pending Review</div>
            <div className="font-display text-3xl font-extrabold tracking-tight text-text-primary">{pendingReviewsCount}</div>
          </div>
        </div>

        <div className="bg-bg-surface/50 rounded-2xl p-6 border border-border-subtle/60 glass-card shadow-lg hover-lift relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-danger to-rose-400" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1">Blocked Workflows</div>
            <div className="font-display text-3xl font-extrabold tracking-tight text-text-primary">{blockedWorkflowsCount}</div>
          </div>
        </div>
      </div>

      {/* Action feedback notifications */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-in slide-in-from-top duration-300 ${
          actionFeedback.type === 'success' ? 'bg-success/15 border-success/20 text-success' : 'bg-danger/15 border-danger/20 text-danger'
        }`}>
          <span className="text-xs font-semibold">{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-xs font-bold hover:underline cursor-pointer focus:outline-none">Dismiss</button>
        </div>
      )}

      {/* User management table */}
      <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl overflow-hidden glass-card shadow-xl">
        <div className="p-5 border-b border-border-subtle/40 flex flex-col lg:flex-row justify-between items-center gap-4 bg-bg-surface/30">
          <h3 className="font-display font-bold text-base text-text-primary">User Management</h3>
          
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/70" size={15} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search users..." 
                className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl pl-10 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-bg-elevated/60 border border-border-strong/70 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none input-glow cursor-pointer font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="Junior Member">Junior Member</option>
              <option value="Department Head">Department Head</option>
              <option value="Administrator">Administrator</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-bg-elevated/60 border border-border-strong/70 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none input-glow cursor-pointer font-semibold"
            >
              <option value="all">All Departments</option>
              <option value="none">None</option>
              {dbDepts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginatedUsers.length === 0 ? (
            <div className="p-12 text-center text-text-secondary text-sm">No members found matching your search.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-base/40 text-text-secondary/70 text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Department</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-border-subtle/30">
                {paginatedUsers.map((itemUser) => (
                  <tr key={itemUser.id} className="hover:bg-bg-elevated/20 transition-colors">
                    <td className="px-6 py-3 flex items-center gap-3">
                      <img src={itemUser.avatar} className="w-7 h-7 rounded-full border border-border-subtle object-cover" alt="" />
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{itemUser.name}</div>
                        <div className="text-[10px] text-text-secondary/80 mt-0.5">{itemUser.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-text-secondary">{itemUser.departmentName}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-bg-elevated/50 border border-border-subtle text-text-secondary">
                        {itemUser.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-success">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                        </span>
                        <span className="text-[10px] font-semibold">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => setSelectedEditUser(itemUser)}
                        className="text-primary hover:text-primary-hover font-bold text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary-transparent transition-all focus:outline-none cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-border-subtle/40 bg-bg-elevated/5 flex justify-between items-center text-xs text-text-secondary/90 flex-wrap gap-3">
          <span>
            Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filteredUsers.length)} of {filteredUsers.length} members
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border-strong hover:border-primary-hover rounded-xl hover-lift disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none text-text-primary bg-bg-surface/40 font-semibold"
            >
              Prev
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-border-strong hover:border-primary-hover rounded-xl hover-lift disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none text-text-primary bg-bg-surface/40 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal Dialog */}
      {selectedEditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-bg-surface/90 border border-border-subtle rounded-2xl p-6 glass-card shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4">Edit User Profile</h3>
            
            <div className="flex items-center gap-3.5 mb-6 p-3 bg-bg-elevated/20 rounded-xl border border-border-subtle/40">
              <img src={selectedEditUser.avatar} className="w-10 h-10 rounded-full border border-border-subtle object-cover" alt="" />
              <div>
                <div className="font-bold text-text-primary text-sm">{selectedEditUser.name}</div>
                <div className="text-xs text-text-secondary/80 mt-0.5">{selectedEditUser.email}</div>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveChanges();
            }} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Club Role</label>
                <select
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none input-glow cursor-pointer font-semibold"
                >
                  <option value="Junior Member">Junior Member</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Department Assignment</label>
                <select
                  value={modalDeptId}
                  onChange={(e) => setModalDeptId(e.target.value)}
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none input-glow cursor-pointer font-semibold"
                >
                  <option value="none">None</option>
                  {dbDepts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle/30">
                <button 
                  type="button"
                  onClick={() => setSelectedEditUser(null)}
                  className="px-4 py-2 border border-border-strong rounded-xl text-xs font-semibold hover:border-primary/50 hover-lift transition-colors cursor-pointer focus:outline-none bg-bg-surface/50 text-text-primary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl text-xs font-bold hover-lift transition-all shadow-lg shadow-primary/10 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
