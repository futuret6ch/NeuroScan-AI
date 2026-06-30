import React, { useState, useEffect } from 'react';
import { User, Phone, ShieldCheck, ShieldAlert, Key, Trash2, Camera, UserCheck, Mail } from 'lucide-react';

interface ProfileProps {
  user: any;
  token: string;
  onUpdateUser: (updatedUser: any) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  user, 
  token, 
  onUpdateUser, 
  onLogout
}) => {
  // Personal Details States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'Female');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O-Positive');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  
  // Doctor States
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [hospital, setHospital] = useState(user?.hospital || '');

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAge(user.age || '');
      setGender(user.gender || 'Female');
      setBloodGroup(user.bloodGroup || 'O-Positive');
      setAvatar(user.avatar || null);
      setSpecialty(user.specialty || '');
      setHospital(user.hospital || '');
    }
  }, [user]);

  // Handle avatar upload (Convert to base64)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar file size must be less than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: any = { name, phone, avatar };

      if (user.role === 'Patient') {
        payload.age = age ? Number(age) : undefined;
        payload.gender = gender;
        payload.bloodGroup = bloodGroup;
      } else if (user.role === 'Doctor') {
        payload.specialty = specialty;
        payload.hospital = hospital;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed.');
      }

      onUpdateUser(data.user);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password modification failed.');
      }

      setSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('WARNING: Are you sure you want to permanently delete your account and all associated MRI analysis scans? This action is irreversible.');
    if (!confirm) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account deletion failed.');
      }

      alert('Your NeuroScan AI account has been successfully deleted.');
      onLogout();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '30px 0', width: '100%', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '70px', height: '70px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                overflow: 'hidden',
                border: '2px solid var(--border)'
              }}>
                {avatar ? (
                  <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.substring(0, 2).toUpperCase() || 'US'
                )}
              </div>
              <label style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid var(--bg-card)'
              }} title="Upload profile photo">
                <Camera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{user?.name}</h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.725rem',
                color: 'var(--primary)',
                fontWeight: 700,
                background: 'rgba(21,101,192,0.08)',
                padding: '3px 10px',
                borderRadius: '30px',
                marginTop: '6px'
              }}>
                <ShieldCheck size={12} /> Account Class: {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldAlert size={18} style={{ color: 'var(--error)' }} />
            <span style={{ fontSize: '0.825rem', color: 'var(--error)', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <UserCheck size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.825rem', color: 'var(--success)', fontWeight: 600 }}>{success}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {/* PROFILE EDIT FORM */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <User size={18} style={{ color: 'var(--primary)' }} />
              Demographic Profile details
            </h3>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    disabled
                    value={user?.email}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 32px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Contact Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 32px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Conditional Patient Details */}
              {user?.role === 'Patient' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="A-Positive">A+</option>
                      <option value="A-Negative">A-</option>
                      <option value="B-Positive">B+</option>
                      <option value="B-Negative">B-</option>
                      <option value="AB-Positive">AB+</option>
                      <option value="AB-Negative">AB-</option>
                      <option value="O-Positive">O+</option>
                      <option value="O-Negative">O-</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Doctor Details */}
              {user?.role === 'Doctor' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Specialty</label>
                    <input
                      type="text"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Hospital</label>
                    <input
                      type="text"
                      required
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, marginTop: '10px' }}
              >
                {loading ? 'Saving details...' : 'Save Demographics'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* CHANGE PASSWORD */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Key size={18} style={{ color: 'var(--primary)' }} />
                Update Security Credentials
              </h3>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  {loading ? 'Processing...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* DELETE ACCOUNT */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--error)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Trash2 size={18} />
                Danger Zone
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Permanently delete your clinical history profile and wipe all uploaded MRI segmentation logs from the database registers.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--error)',
                  borderColor: 'var(--error)',
                  background: 'rgba(239,68,68,0.05)'
                }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
