import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, CheckCircle, WarningCircle, UserCircle, LockKey } from '@phosphor-icons/react';
import api from '../../services/api';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import PageHeader from '../../components/ui/PageHeader';

const AdminProfilePage = () => {
    const { user, fetchMe } = useAuth();
    
    // Profile Edit
    const [profileData, setProfileData] = useState({ name: '', phone: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Password Edit
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg({ type: '', text: '' });
        
        try {
            await api.put('/auth/profile', profileData);
            await fetchMe();
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setProfileMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setPasswordLoading(true);
        
        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto pb-24 space-y-6">
            <PageHeader 
                title="Profile" 
                subtitle="Manage your administrator account." 
            />
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10 mb-8 text-center md:text-left">
                <ProfileAvatar user={user} size="large" editable={true} />
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{user.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-medium">
                        <ShieldCheck size={24} className="text-primary" weight="fill" /> System Administrator
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <UserCircle size={24} className="text-green-600" weight="fill" />
                        <h2 className="text-xl font-bold text-gray-900">Admin Details</h2>
                    </div>

                    {profileMsg.text && (
                        <div className={`p-4 rounded-xl text-sm mb-6 flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {profileMsg.type === 'success' ? <CheckCircle size={20} weight="fill" /> : <WarningCircle size={20} weight="fill" />}
                            {profileMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (Read-only)</label>
                            <input type="email" disabled value={user.email || ''} className="w-full px-4 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <input 
                                required 
                                type="text" 
                                value={profileData.name} 
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                            <input 
                                required 
                                type="tel" 
                                value={profileData.phone} 
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={profileLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center h-12 mt-2"
                        >
                            {profileLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Save Changes"}
                        </button>
                    </form>
                </div>


            </div>
        </div>
    );
};

export default AdminProfilePage;
