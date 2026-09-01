import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Store, LogOut } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn, useClerk } from '@clerk/clerk-react';
import OutletsPage from './pages/OutletsPage';
import LandingPage from './pages/LandingPage';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useClerk();
  
  return (
    <div className="sidebar">
      <div className="logo">WukWay Admin</div>
      
      <nav>
        <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
          <Store size={20} />
          Outlets & Stalls
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', padding: '20px' }}>
        <button className="nav-link" onClick={() => signOut({ redirectUrl: '/' })} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

// Protected Layout component for admin routes
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/admin/*" element={
          <>
            <SignedIn>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<OutletsPage />} />
                </Routes>
              </AdminLayout>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn redirectUrl="/admin" />
            </SignedOut>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
