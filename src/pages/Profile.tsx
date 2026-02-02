import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../styles/Profile.css';

export default function Profile() {
  const { user, userData } = useAuth();

  return (
    <div className="profile-container">
      <Header 
        title="Profile"
        showBackButton={true}
        backTo="/dashboard"
      />
      
      <div className="profile-card">
        <div className="profile-content">
          <div className="profile-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <div className="info-group">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>

            <div className="info-group">
              <label>Role</label>
              <div className="role-badge-large">
                {userData?.role || 'viewer'}
              </div>
              <p className="role-description">
                {userData?.role === 'editor'
                  ? 'You can create, edit, and delete diagrams.'
                  : 'You can view diagrams but cannot make changes.'}
              </p>
            </div>

            <div className="info-group">
              <label>User ID</label>
              <p className="user-id">{user?.uid}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
