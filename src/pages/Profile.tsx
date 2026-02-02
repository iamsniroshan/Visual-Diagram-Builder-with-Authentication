import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function Profile() {
  const { user, userData } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#2a2a2a]">
      <Header 
        title="Profile"
        showBackButton={true}
        backTo="/dashboard"
      />
      
      <div className="bg-white dark:bg-[#242424] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full max-w-[600px] mx-auto my-8 overflow-hidden">
        <div className="p-8">
          <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex justify-center items-center text-5xl font-bold mx-auto mb-8 shadow-[0_5px_15px_rgba(102,126,234,0.3)]">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <div className="mb-8">
            <div className="mb-6">
              <label className="block text-sm text-[#213547] dark:text-[#e0e0e0] opacity-60 mb-2 uppercase font-semibold tracking-wider">Email</label>
              <p className="m-0 text-lg text-[#213547] dark:text-[#e0e0e0] break-words">{user?.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#213547] dark:text-[#e0e0e0] opacity-60 mb-2 uppercase font-semibold tracking-wider">Role</label>
              <div className="inline-block px-6 py-2 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-[20px] text-base font-semibold capitalize mb-2">
                {userData?.role || 'viewer'}
              </div>
              <p className="text-sm text-[#213547] dark:text-[#e0e0e0] opacity-70 italic mt-2">
                {userData?.role === 'editor'
                  ? 'You can create, edit, and delete diagrams.'
                  : 'You can view diagrams but cannot make changes.'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#213547] dark:text-[#e0e0e0] opacity-60 mb-2 uppercase font-semibold tracking-wider">User ID</label>
              <p className="m-0 text-sm text-[#213547] dark:text-[#e0e0e0] break-words font-mono bg-[#f8f9fa] dark:bg-[#2a2a2a] p-2 rounded">{user?.uid}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
