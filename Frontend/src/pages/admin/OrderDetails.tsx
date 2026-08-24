import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Order } from '../../types/Order';
import { Package, User, Phone, MapPin, Box, DollarSign, Tag, Clock, FileText, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTrackingInfo, updateTrackingStatus } from '../../services/trackingService';
import type { OrderTracking } from '../../services/trackingService';
import TrackingTimeline from '../../components/TrackingTimeline';
import { branchService } from '../../services/branchService';
import type { Branch } from '../../types/branch';

const OrderDetails: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'ORDER DETAILS' | 'TRACKING DETAILS' | 'CLIENT DETAILS' | 'ORDER REMARKS' | 'REVERSAL HISTORY'>('ORDER DETAILS');

  const [branches, setBranches] = useState<Branch[]>([]);

  // Tracking update state
  const [newStatus, setNewStatus] = useState("Processing");
  const [newLocation, setNewLocation] = useState("");
  const [newRemarks, setNewRemarks] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [orderResponse, trackingResponse] = await Promise.allSettled([
          api.get(`/api/Orders`),
          trackingNumber ? getTrackingInfo(trackingNumber) : Promise.reject('No tracking number')
        ]);

        if (orderResponse.status === 'fulfilled') {
            const orders = orderResponse.value.data;
            const foundOrder = orders.find((o: Order) => o.trackingNumber === trackingNumber);
            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                toast.error("Order not found with Tracking Number: " + trackingNumber);
            }
        }
        
        if (trackingResponse.status === 'fulfilled') {
            setTrackingData(trackingResponse.value);
        }

        try {
            const fetchedBranches = await branchService.getBranches();
            setBranches(fetchedBranches);
        } catch (error) {
            console.error("Failed to fetch branches", error);
        }
      } catch (error) {
        toast.error("Failed to fetch details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchDetails();
    }
  }, [trackingNumber]);

  const handleUpdateTracking = async () => {
      if (!trackingData || !order) return;
      setUpdateLoading(true);
      try {
          await updateTrackingStatus(trackingData.orderId, newStatus, newLocation, newRemarks);
          toast.success("Tracking updated successfully!");
          // Refresh tracking info
          const data = await getTrackingInfo(trackingData.trackingNumber);
          setTrackingData(data);
          setNewRemarks("");
          setNewLocation("");
      } catch (error) {
          toast.error("Failed to update tracking");
          console.error(error);
      } finally {
          setUpdateLoading(false);
      }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D83626]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg flex items-center justify-between">
          <span>No details found for tracking number: <strong>{trackingNumber}</strong></span>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-md">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm flex justify-between items-center border border-gray-100">
        <div>
          <h1 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">WAYBILL ID</h1>
          <h2 className="text-2xl font-bold text-gray-800">{order.trackingNumber || 'N/A'}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 border border-[#D83626] text-[#D83626] px-4 py-2 rounded-full font-semibold hover:bg-red-50 transition-colors">
            <Package size={18} />
            View Attached Images <span className="bg-[#D83626] text-white text-xs px-2 py-0.5 rounded-full ml-1">0</span>
          </button>
          <span className={`px-4 py-1.5 rounded-full font-bold text-white shadow-sm ${
            order.status === 'Delivered' ? 'bg-green-500' :
            order.status === 'Pending' ? 'bg-blue-500' :
            'bg-gray-500'
          }`}>
            {order.status || 'N/A'}
          </span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
          {['ORDER DETAILS', 'TRACKING DETAILS', 'CLIENT DETAILS', 'ORDER REMARKS', 'REVERSAL HISTORY'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-4 font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#D83626] text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 font-semibold'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'ORDER DETAILS' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-6">
              
              {/* Row 1 */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><Tag size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Waybill ID</p>
                  <p className="text-sm font-semibold text-gray-700">{order.trackingNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><DollarSign size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">COD Amount</p>
                  <p className="text-sm font-semibold text-gray-700">Rs. {order.codAmount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><DollarSign size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Collected COD</p>
                  <p className="text-sm font-semibold text-gray-700">Rs. 0.00</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><Box size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Weight</p>
                  <p className="text-sm font-semibold text-gray-700">1.00 kg</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><FileText size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Order ID</p>
                  <p className="text-sm font-semibold text-gray-700">{order.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><User size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Receiver Name</p>
                  <p className="text-sm font-semibold text-gray-700">{order.customerName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><Phone size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Receiver Contact</p>
                  <p className="text-sm font-semibold text-gray-700">{order.phone1 || 'N/A'}{order.phone2 ? `/ ${order.phone2}` : ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><MapPin size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Receiver Address</p>
                  <p className="text-sm font-semibold text-gray-700 leading-snug">{order.address || order.deliveryAddress || 'N/A'}</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><MapPin size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">City</p>
                  <p className="text-sm font-semibold text-gray-700">{order.destinationBranchId ? (branches.find(b => b.id === order.destinationBranchId)?.cityName || 'N/A') : 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><Package size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Origin Branch</p>
                  <p className="text-sm font-semibold text-gray-700">{order.originBranchId ? (branches.find(b => b.id === order.originBranchId)?.name || 'N/A') : 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><MapPin size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Destination Branch</p>
                  <p className="text-sm font-semibold text-gray-700">{order.destinationBranchId ? (branches.find(b => b.id === order.destinationBranchId)?.name || 'N/A') : 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><Clock size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Remarks</p>
                  <p className="text-sm font-semibold text-gray-700">{order.remarks || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-400 mt-0.5"><Package size={20} /></div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">Temporary Branch</p>
                  <p className="text-sm font-semibold text-gray-700">N/A</p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'TRACKING DETAILS' && trackingData && (
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left side: Timeline */}
                <div className="flex-1">
                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <TrackingTimeline 
                            history={trackingData.history} 
                            createdAt={order.createdAt}
                        />
                    </div>
                </div>

                {/* Right side: Update Form */}
                <div className="w-full md:w-[400px]">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-6">
                        <h4 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <Activity size={18} className="text-[#D83626]" /> Post Status Update
                        </h4>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Status</label>
                                <select 
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#D83626] focus:ring-2 focus:ring-red-100 transition-all font-medium">
                                    <option value="Processing">Processing</option>

                                    <option value="Collected at Branch">Collected at Branch</option>
                                    <option value="Dispatched to Warehouse">Dispatched to Warehouse</option>
                                    <option value="Collected at Warehouse">Collected at Warehouse</option>
                                    <option value="Dispatched to Destination">Dispatched to Destination</option>
                                    <option value="Received at Destination">Received at Destination</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Failed to Deliver">Failed to Deliver</option>
                                    <option value="Returned to Branch Rescheduled">Returned to Branch Rescheduled</option>
                                    <option value="Rescheduled">Rescheduled</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Location</label>
                                <input 
                                    type="text" 
                                    value={newLocation}
                                    onChange={e => setNewLocation(e.target.value)}
                                    placeholder="e.g., Colombo Sort Facility"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#D83626] focus:ring-2 focus:ring-red-100 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Remarks</label>
                                <textarea 
                                    value={newRemarks}
                                    onChange={e => setNewRemarks(e.target.value)}
                                    placeholder="Optional notes regarding the package..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#D83626] focus:ring-2 focus:ring-red-100 transition-all resize-none"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleUpdateTracking}
                            disabled={updateLoading}
                            className="w-full bg-[#D83626] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                            {updateLoading ? <Activity size={18} className="animate-spin" /> : <MapPin size={18} />} 
                            {updateLoading ? 'Updating...' : 'Submit Update'}
                        </button>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'TRACKING DETAILS' && !trackingData && (
              <div className="text-center text-slate-500 py-10">
                  Failed to load tracking data for this order.
              </div>
          )}

          {['CLIENT DETAILS', 'ORDER REMARKS', 'REVERSAL HISTORY'].includes(activeTab) && (
             <div className="text-center text-slate-400 py-12">
                 Content for {activeTab} will go here.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
