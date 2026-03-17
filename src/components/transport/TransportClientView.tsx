'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Plus, Trash2, Edit2, Truck } from 'lucide-react';
import { deleteTransportRent } from '@/app/actions/transport';

import AddTransportDialog from './AddTransportDialog';
import EditTransportDialog from './EditTransportDialog';

type TransportData = any;

export default function TransportClientView({ 
  initialTransports
}: { 
  initialTransports: TransportData[] 
}) {
  const [sortCol, setSortCol] = useState<string>('travelDate');
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<TransportData | null>(null);

  // ==========================
  // Memoized Sorted Data
  // ==========================
  const sortedTransports = useMemo(() => {
    return [...initialTransports].sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];
      
      if (sortCol === 'travelDate' || sortCol === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [initialTransports, sortCol, sortDesc]);

  // ==========================
  // Handlers
  // ==========================
  const handleSort = (col: string) => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else { setSortCol(col); setSortDesc(true); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transport expense record permanently?')) {
      const res = await deleteTransportRent(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* spacer */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" /> Log Transport
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-blue-50/50 border-b border-blue-100 text-slate-600 font-medium">
              <tr>
                {[
                  { label: 'Date', key: 'travelDate' },
                  { label: 'Driver', key: 'driverName' },
                  { label: 'Vehicle', key: 'vehicleType' },
                  { label: 'Purpose', key: 'purpose' },
                  { label: 'Cost (EGP)', key: 'cost' },
                  { label: 'Notes', key: 'notes' }
                ].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="px-6 py-4 cursor-pointer hover:bg-blue-100/50 transition select-none">
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortCol === col.key && (sortDesc ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronUp className="w-4 h-4 text-blue-500" />)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-end">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedTransports.map((log: TransportData) => (
                <tr key={log.id} className="hover:bg-blue-50/20 transition">
                  <td className="px-6 py-4 text-slate-600">{new Date(log.travelDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400"/> {log.driverName || '-'}</td>
                  <td className="px-6 py-4 text-slate-700">{log.vehicleType}</td>
                  <td className="px-6 py-4 text-slate-600">{log.purpose}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">EGP {log.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{log.notes || '-'}</td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => setEditData(log)} className="p-1.5 text-slate-600 hover:bg-blue-100 rounded-lg transition me-1"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(log.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {sortedTransports.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No transport records logged.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddTransportDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      {editData && <EditTransportDialog isOpen={!!editData} onClose={() => setEditData(null)} transport={editData} />}
    </>
  );
}
