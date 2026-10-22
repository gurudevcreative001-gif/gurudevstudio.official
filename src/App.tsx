import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, MainTab } from './components/BottomNav';
import { CreateOrderScreen } from './components/screens/CreateOrderScreen';
import { MyOrdersScreen } from './components/screens/MyOrdersScreen';
import { MenuScreen } from './components/screens/MenuScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { Service, Order } from './types';
import { apiClient } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('create');
  const [services, setServices] = useState<Service[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [customerOrderCount, setCustomerOrderCount] = useState<number>(0);

  // Load services and check auth
  useEffect(() => {
    loadServices();
    checkAdminStatus();
    loadCustomerOrderCount();
  }, []);

  const loadServices = async () => {
    try {
      const data = await apiClient.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const checkAdminStatus = async () => {
    const isAuth = await apiClient.checkAdminAuth();
    setIsAdminLoggedIn(isAuth);
  };

  const loadCustomerOrderCount = async () => {
    const mobile = apiClient.getCustomerMobile();
    const token = apiClient.getCustomerToken();
    if (mobile && token) {
      try {
        const orders = await apiClient.getCustomerOrders(mobile);
        setCustomerOrderCount(orders.length);
      } catch (err) {
        apiClient.clearCustomerAuth();
        setCustomerOrderCount(0);
      }
    } else {
      apiClient.clearCustomerAuth();
      setCustomerOrderCount(0);
    }
  };

  const handleOrderPlaced = (order: Order) => {
    setCustomerOrderCount((prev) => prev + 1);
  };

  const handleSelectServiceToOrder = (serviceId: string) => {
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#111827] flex flex-col font-sans selection:bg-[#6D28D9] selection:text-white">
      {/* Top Header */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area (Render exactly 1 of the 3 primary screens) */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'orders' && (
          <MyOrdersScreen onNavigateToCreate={() => setActiveTab('create')} />
        )}

        {activeTab === 'create' && (
          <CreateOrderScreen
            onOrderPlaced={handleOrderPlaced}
            onNavigateToOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'menu' && (
          <MenuScreen
            services={services}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onSelectServiceToOrder={handleSelectServiceToOrder}
          />
        )}
      </main>

      {/* Persistent iOS-Style Bottom Navigation Bar (Visible on all 3 screens) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        orderCount={customerOrderCount}
      />

      {/* Studio Admin Portal Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          checkAdminStatus();
        }}
        onServicesChanged={() => {
          loadServices();
        }}
      />
    </div>
  );
}
