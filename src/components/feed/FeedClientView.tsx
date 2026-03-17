'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, TrendingUp, TrendingDown, Package, Search } from 'lucide-react';
import { deleteFeedItem, deleteFeedOrder, deleteFeedConsumption } from '@/app/actions/feed';

import AddFeedItemDialog from './AddFeedItemDialog';
import EditFeedItemDialog from './EditFeedItemDialog';
import AddOrderDialog from './AddOrderDialog';
import EditOrderDialog from './EditOrderDialog';
import AddConsumptionDialog from './AddConsumptionDialog';
import EditConsumptionDialog from './EditConsumptionDialog';

type FeedItem = any;
type FeedOrder = any;
type FeedConsumption = any;

export default function FeedClientView({ 
  initialItems, 
  initialOrders, 
  initialConsumptions 
}: { 
  initialItems: FeedItem[], 
  initialOrders: FeedOrder[], 
  initialConsumptions: FeedConsumption[] 
}) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'consumption'>('inventory');

  // Inventory State
  const [itemsSortCol, setItemsSortCol] = useState<string>('name');
  const [itemsSortDesc, setItemsSortDesc] = useState<boolean>(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editItemData, setEditItemData] = useState<FeedItem | null>(null);

  // Orders State
  const [ordersSortCol, setOrdersSortCol] = useState<string>('orderDate');
  const [ordersSortDesc, setOrdersSortDesc] = useState<boolean>(true);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [editOrderData, setEditOrderData] = useState<FeedOrder | null>(null);

  // Consumption State
  const [consSortCol, setConsSortCol] = useState<string>('date');
  const [consSortDesc, setConsSortDesc] = useState<boolean>(true);
  const [isAddConsOpen, setIsAddConsOpen] = useState(false);
  const [editConsData, setEditConsData] = useState<FeedConsumption | null>(null);
  const [search, setSearch] = useState('');

  // ==========================
  // Memoized Sorted Data
  // ==========================
  const sortedItems = useMemo(() => {
    return [...initialItems].sort((a, b) => {
      let valA = a[itemsSortCol];
      let valB = b[itemsSortCol];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return itemsSortDesc ? 1 : -1;
      if (valA > valB) return itemsSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialItems, itemsSortCol, itemsSortDesc]);

  const sortedOrders = useMemo(() => {
    return [...initialOrders].sort((a, b) => {
      let valA = itemsSortCol === 'feedItem' ? a.feedItem?.name : a[ordersSortCol];
      let valB = itemsSortCol === 'feedItem' ? b.feedItem?.name : b[ordersSortCol];
      
      if (ordersSortCol === 'orderDate' || ordersSortCol === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return ordersSortDesc ? 1 : -1;
      if (valA > valB) return ordersSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialOrders, ordersSortCol, ordersSortDesc]);

  const sortedConsumptions = useMemo(() => {
    return [...initialConsumptions].sort((a, b) => {
      let valA = consSortCol === 'feedItem' ? a.feedItem?.name : a[consSortCol];
      let valB = consSortCol === 'feedItem' ? b.feedItem?.name : b[consSortCol];
      
      if (consSortCol === 'date' || consSortCol === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return consSortDesc ? 1 : -1;
      if (valA > valB) return consSortDesc ? -1 : 1;
      return 0;
    });
  }, [initialConsumptions, consSortCol, consSortDesc]);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedItems;
    return sortedItems.filter((i) =>
      [i.name, i.type, i.unit].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedItems, search]);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedOrders;
    return sortedOrders.filter((o) =>
      [o.feedItem?.name, o.supplier].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedOrders, search]);

  const filteredConsumptions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedConsumptions;
    return sortedConsumptions.filter((c) =>
      [c.feedItem?.name, c.notes].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [sortedConsumptions, search]);

  // ==========================
  // Handlers
  // ==========================
  const handleSortItems = (col: string) => {
    if (itemsSortCol === col) setItemsSortDesc(!itemsSortDesc);
    else { setItemsSortCol(col); setItemsSortDesc(true); }
  };
  const handleSortOrders = (col: string) => {
    if (ordersSortCol === col) setOrdersSortDesc(!ordersSortDesc);
    else { setOrdersSortCol(col); setOrdersSortDesc(true); }
  };
  const handleSortCons = (col: string) => {
    if (consSortCol === col) setConsSortDesc(!consSortDesc);
    else { setConsSortCol(col); setConsSortDesc(true); }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this feed item? All related orders and consumption logs will be securely deleted.')) {
      const res = await deleteFeedItem(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Delete this order? Inventory stock will be DECREASED accurately.')) {
      const res = await deleteFeedOrder(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleDeleteCons = async (id: string) => {
    if (confirm('Delete this consumption log? Inventory stock will be INCREASED accurately.')) {
      const res = await deleteFeedConsumption(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Inventory Stock
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Feed Orders
          </button>
          <button 
            onClick={() => setActiveTab('consumption')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'consumption' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
          >
            Consumption Logs
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feed..."
            className="w-full ps-9 pe-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
          />
        </div>

        <div>
          {activeTab === 'inventory' && (
            <button
              onClick={() => setIsAddItemOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" /> Add Feed Type
            </button>
          )}
          {activeTab === 'orders' && (
            <button
              onClick={() => setIsAddOrderOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <TrendingUp className="w-5 h-5" /> Receive Order
            </button>
          )}
          {activeTab === 'consumption' && (
            <button
              onClick={() => setIsAddConsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              <TrendingDown className="w-5 h-5" /> Log Consumption
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            
            {/* INVENTORY TABLE HEADER */}
            {activeTab === 'inventory' && (
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  {[
                    { label: 'Feed Name', key: 'name' },
                    { label: 'Type', key: 'type' },
                    { label: 'Current Stock', key: 'currentStock' },
                    { label: 'Unit', key: 'unit' },
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortItems(col.key)} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {itemsSortCol === col.key && (itemsSortDesc ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronUp className="w-4 h-4 text-emerald-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            {/* ORDERS TABLE HEADER */}
            {activeTab === 'orders' && (
              <thead className="bg-indigo-50/50 border-b border-indigo-100 text-slate-600 font-medium">
                <tr>
                  {[
                    { label: 'Date', key: 'orderDate' },
                    { label: 'Feed Name', key: 'feedItem' },
                    { label: 'Quantity Added', key: 'quantity' },
                    { label: 'Cost (EGP)', key: 'cost' },
                    { label: 'Supplier', key: 'supplier' }
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortOrders(col.key)} className="px-6 py-4 cursor-pointer hover:bg-indigo-100/50 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {ordersSortCol === col.key && (ordersSortDesc ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronUp className="w-4 h-4 text-indigo-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            {/* CONSUMPTION TABLE HEADER */}
            {activeTab === 'consumption' && (
              <thead className="bg-amber-50/50 border-b border-amber-100 text-slate-600 font-medium">
                <tr>
                  {[
                    { label: 'Date', key: 'date' },
                    { label: 'Feed Name', key: 'feedItem' },
                    { label: 'Quantity Used', key: 'quantity' },
                    { label: 'Notes', key: 'notes' }
                  ].map((col) => (
                    <th key={col.key} onClick={() => handleSortCons(col.key)} className="px-6 py-4 cursor-pointer hover:bg-amber-100/50 transition select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {consSortCol === col.key && (consSortDesc ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronUp className="w-4 h-4 text-amber-500" />)}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-end">Actions</th>
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-slate-100">
              
              {/* INVENTORY ROWS */}
              {activeTab === 'inventory' && filteredItems.map((item: FeedItem) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2"><Package className="w-4 h-4 text-slate-400"/> {item.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.type}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{item.currentStock.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditItemData(item)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'inventory' && filteredItems.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No feed items found. Add some to get started!</td></tr>
              )}

              {/* ORDERS ROWS */}
              {activeTab === 'orders' && filteredOrders.map((order: FeedOrder) => (
                <tr key={order.id} className="hover:bg-indigo-50/20 transition">
                  <td className="px-6 py-4 text-slate-600">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{order.feedItem.name}</td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">+{order.quantity.toFixed(2)} {order.feedItem.unit}</td>
                  <td className="px-6 py-4 text-slate-600">EGP {order.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{order.supplier || '-'}</td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditOrderData(order)} className="p-1.5 text-slate-600 hover:bg-indigo-100 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'orders' && filteredOrders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No feed orders logged.</td></tr>
              )}

              {/* CONSUMPTION ROWS */}
              {activeTab === 'consumption' && filteredConsumptions.map((cons: FeedConsumption) => (
                <tr key={cons.id} className="hover:bg-amber-50/20 transition">
                  <td className="px-6 py-4 text-slate-600">{new Date(cons.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{cons.feedItem.name}</td>
                  <td className="px-6 py-4 font-semibold text-amber-600">-{cons.quantity.toFixed(2)} {cons.feedItem.unit}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{cons.notes || '-'}</td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditConsData(cons)} className="p-1.5 text-slate-600 hover:bg-amber-100 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCons(cons.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'consumption' && filteredConsumptions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No feed consumption logged.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddFeedItemDialog isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} />
      {editItemData && <EditFeedItemDialog isOpen={!!editItemData} onClose={() => setEditItemData(null)} item={editItemData} />}
      
      <AddOrderDialog isOpen={isAddOrderOpen} onClose={() => setIsAddOrderOpen(false)} items={initialItems} />
      {editOrderData && <EditOrderDialog isOpen={!!editOrderData} onClose={() => setEditOrderData(null)} order={editOrderData} />}
      
      <AddConsumptionDialog isOpen={isAddConsOpen} onClose={() => setIsAddConsOpen(false)} items={initialItems} />
      {editConsData && <EditConsumptionDialog isOpen={!!editConsData} onClose={() => setEditConsData(null)} consumption={editConsData} />}
    </>
  );
}
