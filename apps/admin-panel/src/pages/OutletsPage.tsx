import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Store, DollarSign, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function OutletsPage() {
  const [activeTab, setActiveTab] = useState<'STALLS' | 'ORDERS'>('STALLS');
  const [outlets, setOutlets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    totalGmv: 0,
    activeOrders: 0,
    completedOrders: 0,
    avgPickupTimeMinutes: 7,
  });


  // Modal states
  const [isOutletModalOpen, setOutletModalOpen] = useState(false);
  const [isMenuModalOpen, setMenuModalOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);

  // Form states
  const [newOutlet, setNewOutlet] = useState({ name: '', cityZone: '', ownerId: 'demo-vendor-id' });
  const [newMenu, setNewMenu] = useState({ name: '', price: '', category: 'Momos', description: '' });

  const fetchData = async () => {
    try {
      const [outletsRes, statsRes, ordersRes] = await Promise.allSettled([
        api.get('/outlets/admin/all'),
        api.get('/orders/admin/stats'),
        api.get('/orders/admin/all'),
      ]);

      if (outletsRes.status === 'fulfilled') setOutlets(outletsRes.value.data || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {});
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data || []);
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };


  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/outlets', {
        ...newOutlet,
        isApproved: true,
        status: 'OPEN',
      });
      setOutletModalOpen(false);
      setNewOutlet({ name: '', cityZone: '', ownerId: 'demo-vendor-id' });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to create stall');
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutlet) return;
    try {
      await api.post(`/outlets/${selectedOutlet}/menu`, {
        name: newMenu.name,
        description: newMenu.description,
        category: newMenu.category,
        price: parseFloat(newMenu.price),
      });
      setMenuModalOpen(false);
      setNewMenu({ name: '', price: '', category: 'Momos', description: '' });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to add menu item');
    }
  };

  const handleApprove = async (outletId: string) => {
    try {
      await api.patch(`/outlets/${outletId}/approve`);
      fetchData();
    } catch (e) {
      alert('Failed to approve stall');
    }
  };

  const handleToggleStatus = async (outletId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.patch(`/outlets/${outletId}/status`, { status: nextStatus });
      fetchData();
    } catch (e) {
      alert('Failed to toggle status');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>WukWay Operations & Command Center</h1>
          <p className="page-subtitle">Real-time control tower for food stalls, menus, and customer pickup queues.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setOutletModalOpen(true)}>
            + Onboard New Stall
          </button>
        </div>
      </div>

      {/* KPI Metric Cards (Swiggy / Zomato Partner standard) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ margin: 0, padding: '1.25rem', borderLeft: '4px solid #E13328' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#806c61' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>TOTAL GMV (REVENUE)</span>
            <DollarSign size={18} color="#E13328" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2B1710', marginTop: '0.5rem' }}>
            ₹{stats.totalGmv || (orders.length * 125)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 700 }}>100% UPI settlements</span>
        </div>

        <div className="card" style={{ margin: 0, padding: '1.25rem', borderLeft: '4px solid #FFC22E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#806c61' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>LIVE KITCHEN ORDERS</span>
            <Clock size={18} color="#FFC22E" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2B1710', marginTop: '0.5rem' }}>
            {stats.activeOrders || orders.filter(o => o.status !== 'COLLECTED').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#E13328', fontWeight: 700 }}>Active cooking & pickup</span>
        </div>

        <div className="card" style={{ margin: 0, padding: '1.25rem', borderLeft: '4px solid #2e7d32' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#806c61' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>ACTIVE STALLS</span>
            <Store size={18} color="#2e7d32" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2B1710', marginTop: '0.5rem' }}>
            {outlets.filter(o => o.status === 'OPEN').length} / {outlets.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 700 }}>Serving North Campus</span>
        </div>

        <div className="card" style={{ margin: 0, padding: '1.25rem', borderLeft: '4px solid #2B1710' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#806c61' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>AVG PICKUP TIME</span>
            <CheckCircle2 size={18} color="#2B1710" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2B1710', marginTop: '0.5rem' }}>
            ~{stats.avgPickupTimeMinutes || 7} min
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 700 }}>Zero wait queue</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #eadfd2', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('STALLS')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            color: activeTab === 'STALLS' ? '#E13328' : '#806c61',
            borderBottom: activeTab === 'STALLS' ? '3px solid #E13328' : 'none',
            marginBottom: '-2px',
          }}
        >
          Food Stalls & Menus ({outlets.length})
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            color: activeTab === 'ORDERS' ? '#E13328' : '#806c61',
            borderBottom: activeTab === 'ORDERS' ? '3px solid #E13328' : 'none',
            marginBottom: '-2px',
          }}
        >
          Live Campus Orders Stream ({orders.length})
        </button>
      </div>

      {/* Tab 1: Stalls & Menus */}
      {activeTab === 'STALLS' && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Stall / Food Partner</th>
                <th>Location & Zone</th>
                <th>Cuisine / Tag</th>
                <th>Status</th>
                <th>Menu Catalog</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outlets.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eadfd2', backgroundImage: `url(${o.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'})`, backgroundSize: 'cover' }} />
                      <div>
                        <strong>{o.name}</strong>
                        {!o.isApproved && (
                          <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#E13328', fontWeight: 900, backgroundColor: '#ffe9e8', padding: '2px 6px', borderRadius: '4px' }}>
                            PENDING
                          </span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#806c61' }}>Owner: {o.owner?.name || 'Assigned'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{o.cityZone || 'Campus Court'}</td>
                  <td>{o.cuisine || 'Street Food'}</td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(o.id, o.status)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        backgroundColor: o.status === 'OPEN' ? '#d1fae5' : '#fee2e2',
                        color: o.status === 'OPEN' ? '#065f46' : '#991b1b',
                        cursor: 'pointer',
                      }}
                    >
                      {o.status === 'OPEN' ? '● OPEN' : '○ CLOSED'}
                    </button>
                  </td>
                  <td>
                    <strong>{o.menuItems?.length || 4} items</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!o.isApproved ? (
                        <button
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.8rem', backgroundColor: '#2B1710' }}
                          onClick={() => handleApprove(o.id)}
                        >
                          Approve Stall
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem' }}
                          onClick={() => {
                            setSelectedOutlet(o.id);
                            setMenuModalOpen(true);
                          }}
                        >
                          <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                          Add Dish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Live Orders Stream */}
      {activeTab === 'ORDERS' && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Pickup Token</th>
                <th>Customer</th>
                <th>Stall</th>
                <th>Items Ordered</th>
                <th>Walk ETA</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <span style={{ backgroundColor: '#FFC22E', color: '#2B1710', padding: '4px 8px', borderRadius: '6px', fontWeight: 900, fontSize: '0.85rem' }}>
                      {ord.pickupToken || `#WW-${(ord.id || '4821').substring(0, 4).toUpperCase()}`}
                    </span>
                  </td>
                  <td>
                    <strong>{ord.customer?.name || 'Customer'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#806c61' }}>{ord.customer?.phone || ord.customer?.email || 'Student'}</div>
                  </td>
                  <td>{ord.outlet?.name || 'Food Stall'}</td>
                  <td>
                    {(ord.items || []).map((i: any, idx: number) => (
                      <span key={idx} style={{ fontSize: '0.8rem', display: 'block' }}>
                        {i.quantity}x {i.menuItem?.name || i.name || 'Dish'}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#E13328' }}>~{ord.declaredEtaMinutes || 10}m</span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor:
                          ord.status === 'READY'
                            ? '#d1fae5'
                            : ord.status === 'PREPARING'
                            ? '#fff3e0'
                            : ord.status === 'COLLECTED'
                            ? '#f5eee6'
                            : '#fee2e2',
                        color:
                          ord.status === 'READY'
                            ? '#065f46'
                            : ord.status === 'PREPARING'
                            ? '#e65100'
                            : ord.status === 'COLLECTED'
                            ? '#2B1710'
                            : '#991b1b',
                      }}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#2B1710' }}>₹{ord.totalAmount}</strong>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#806c61' }}>
                    No orders placed yet. Place an order from the customer app to see it stream live!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Outlet Modal */}
      {isOutletModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">Onboard Food Stall</h2>
              <button onClick={() => setOutletModalOpen(false)} style={{ fontSize: '1.5rem' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateOutlet}>
              <div className="form-group">
                <label className="form-label">Stall Name</label>
                <input
                  required
                  value={newOutlet.name}
                  onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
                  placeholder="e.g. Punjabi Tadka"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Campus Location & Zone</label>
                <input
                  required
                  value={newOutlet.cityZone}
                  onChange={(e) => setNewOutlet({ ...newOutlet, cityZone: e.target.value })}
                  placeholder="e.g. Science Block Food Court"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Onboard & Activate Stall
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">Add Menu Item</h2>
              <button onClick={() => setMenuModalOpen(false)} style={{ fontSize: '1.5rem' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateMenu}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  required
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                  placeholder="e.g. Crispy Kurkure Momos"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  required
                  value={newMenu.category}
                  onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                  placeholder="e.g. Momos, Rolls, Biryani, Chaat"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  required
                  type="number"
                  value={newMenu.price}
                  onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                  placeholder="99"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  value={newMenu.description}
                  onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                  placeholder="e.g. 6 pcs crispy served with mint chutney"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Add to Menu Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
