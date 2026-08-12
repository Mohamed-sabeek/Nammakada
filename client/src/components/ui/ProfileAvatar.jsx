import { useState, useRef } from 'react';
import { Camera } from '@phosphor-icons/react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileAvatar = ({ 
    user, 
    size = 'medium', 
    editable = false,
    className = ''
}) => {
    const { fetchMe } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const sizeClasses = {
        small: 'w-10 h-10 text-lg',
        medium: 'w-14 h-14 text-xl',
        large: 'w-24 h-24 md:w-32 md:h-32 text-4xl md:text-5xl'
    };

    const imageUrl = previewUrl || user?.profileImage?.url;
    const initial = user?.name?.charAt(0).toUpperCase() || 'U';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrorMsg('Please select a JPG, PNG, or WebP image.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('Image must be under 5 MB.');
            return;
        }

        setErrorMsg('');
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setErrorMsg('');

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchMe();
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Unable to upload profile picture.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
        
        setIsUploading(true);
        setErrorMsg('');
        try {
            await api.delete('/auth/profile/avatar');
            await fetchMe();
        } catch (error) {
            setErrorMsg('Unable to remove profile picture.');
        } finally {
            setIsUploading(false);
        }
    };

    const cancelUpload = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setErrorMsg('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div 
                className={`relative rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black shadow-inner overflow-hidden ${sizeClasses[size]}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                    <span>{initial}</span>
                )}

                {editable && !selectedFile && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <Camera size={size === 'large' ? 32 : 20} weight="fill" className="text-white" />
                    </div>
                )}
            </div>

            {editable && (
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                />
            )}

            {errorMsg && (
                <p className="text-red-500 text-sm mt-3 max-w-[250px] text-center font-medium bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
            )}

            {editable && selectedFile && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                    <button 
                        onClick={cancelUpload}
                        disabled={isUploading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                    >
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Upload Photo'}
                    </button>
                </div>
            )}

            {editable && !selectedFile && user?.profileImage?.url && (
                <div className="flex items-center gap-4 mt-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-700 text-sm font-bold hover:text-primary transition-colors"
                    >
                        Change Photo
                    </button>
                    <button 
                        onClick={handleRemove}
                        disabled={isUploading}
                        className="text-red-500 text-sm font-bold hover:text-red-700 disabled:opacity-50 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            )}
            
            {editable && !selectedFile && !user?.profileImage?.url && (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-primary text-sm font-bold hover:text-primary-dark transition-colors"
                >
                    Add Profile Photo
                </button>
            )}
        </div>
    );
};

export default ProfileAvatar;
