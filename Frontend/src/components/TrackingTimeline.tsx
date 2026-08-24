import React from 'react';
import { Truck, Home, RefreshCw, Tag, CheckCircle, XCircle, Loader2, Gift, Building2, Building, Send, CheckSquare } from 'lucide-react';
import type { TrackingHistory } from '../services/trackingService';

interface TrackingTimelineProps {
  history: TrackingHistory[];
  createdAt?: string;
  draftStatus?: string;
  draftLocation?: string;
  draftRemarks?: string;
}

const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  
  if (s.includes('delivered') && !s.includes('failed')) {
    return { icon: Gift, color: 'text-[#10b981]', borderColor: 'border-[#10b981]' }; // emerald-500
  }
  if (s.includes('failed to deliver')) {
    return { icon: XCircle, color: 'text-[#ef4444]', borderColor: 'border-[#ef4444]' }; // red-500
  }
  if (s.includes('collected from')) {
    return { icon: Building, color: 'text-[#10b981]', borderColor: 'border-[#10b981]' }; 
  }
  if (s.includes('collected at sorting') || s.includes('collected at warehouse') || s.includes('collected at branch')) {
    return { icon: CheckSquare, color: 'text-[#3b82f6]', borderColor: 'border-[#3b82f6]' };
  }
  if (s.includes('returned to branch')) {
    if (s.includes('rescheduled')) {
      return { icon: Building2, color: 'text-[#f59e0b]', borderColor: 'border-[#f59e0b]' };
    }
    return { icon: Building2, color: 'text-[#ef4444]', borderColor: 'border-[#ef4444]' };
  }
  if (s.includes('rescheduled')) {
    return { icon: RefreshCw, color: 'text-[#f59e0b]', borderColor: 'border-[#f59e0b]' }; // amber-500
  }
  if (s.includes('cancelled') || s.includes('failed')) {
    return { icon: XCircle, color: 'text-[#ef4444]', borderColor: 'border-[#ef4444]' }; 
  }
  if (s.includes('re-delivery')) {
    return { icon: Truck, color: 'text-[#ef4444]', borderColor: 'border-[#ef4444]' }; 
  }
  if (s.includes('dispatched') || s.includes('transit')) {
    return { icon: Send, color: 'text-[#3b82f6]', borderColor: 'border-[#3b82f6]' }; // blue-500
  }
  if (s.includes('destination') || s.includes('received')) {
    return { icon: Home, color: 'text-[#f59e0b]', borderColor: 'border-[#f59e0b]' };
  }
  if (s.includes('out for delivery')) {
    return { icon: Tag, color: 'text-[#9ca3af]', borderColor: 'border-[#9ca3af]' }; // gray-400
  }
  if (s.includes('processing') || s.includes('pending')) {
    return { icon: Loader2, color: 'text-[#3b82f6]', borderColor: 'border-[#3b82f6]' };
  }
  // Default
  return { icon: CheckCircle, color: 'text-[#6366f1]', borderColor: 'border-[#6366f1]' }; // indigo-500
};

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' +
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ history, createdAt, draftStatus, draftLocation, draftRemarks }) => {
  // We reverse the history to show newest at the top
  const sortedHistory = [...(history || [])].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Filter out consecutive duplicate statuses, keeping the oldest (first occurrence)
  const dedupedHistory = sortedHistory.filter((item, index, arr) => {
    if (index === arr.length - 1) return true;
    return item.status !== arr[index + 1].status;
  });

  const combinedItems = [...dedupedHistory];

  if (draftStatus) {
    combinedItems.unshift({
      id: -1,
      status: draftStatus,
      location: draftLocation || "",
      remarks: draftRemarks || "",
      updatedAt: new Date().toISOString(),
      updatedBy: 'Preview'
    });
  }

  // Synthesize "Processing" for legacy orders that missed the initial history insert
  const hasProcessing = combinedItems.some(h => h.status.toLowerCase().includes('processing'));
  
  if (!hasProcessing) {
    let processingDate = createdAt ? new Date(createdAt) : new Date();
    
    // If there is history, make sure the processing date is slightly before the oldest event
    if (combinedItems.length > 0) {
      const oldestItem = combinedItems[combinedItems.length - 1];
      processingDate = new Date(oldestItem.updatedAt);
      processingDate.setMinutes(processingDate.getMinutes() - 1);
    }

    combinedItems.push({
      id: 0,
      status: 'Processing',
      location: 'System',
      remarks: 'Order created',
      updatedAt: processingDate.toISOString(),
      updatedBy: 'System'
    });
  }

  if (combinedItems.length === 0) {
    return <div className="text-center py-8 text-slate-500 font-medium">No tracking history available yet.</div>;
  }

  return (
    <div className="relative py-8 px-4 font-sans">
      {/* Central Vertical Line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gray-300 -translate-x-1/2 rounded-full"></div>

      <div className="space-y-16">
        {combinedItems.map((item, index) => {
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          
          // Determine alternating sides based on index (mobile is always left)
          const isLeft = index % 2 === 0;

          return (
            <div key={item.id} className={`relative flex flex-col md:flex-row w-full`}>
              
              {/* Desktop View */}
              <div className="hidden md:flex w-full">
                {isLeft ? (
                  // LEFT ALIGNED ITEM
                  <>
                    <div className="w-1/2 flex justify-end items-start relative">
                      {/* Content */}
                      <div className="text-right pr-4 pt-1">
                        <h5 className={`text-[17px] font-bold ${config.color} mb-1`}>
                          {item.status}
                        </h5>
                        <div className="text-[13px] font-bold text-gray-800">{formatDateTime(item.updatedAt)}</div>
                        <div className="text-[12px] font-semibold text-gray-500 mb-1">({timeAgo(item.updatedAt)})</div>
                        
                        {(item.location || item.remarks) && (
                          <div className="text-[12px] text-gray-600 max-w-xs ml-auto leading-snug mb-1">
                            {item.location && <span>{item.location} {item.remarks ? '- ' : ''}</span>}
                            {item.remarks && <span>{item.remarks}</span>}
                          </div>
                        )}
                        {item.updatedBy && <div className="text-[12px] font-medium text-gray-400">{item.updatedBy}</div>}
                      </div>

                      {/* Icon */}
                      <div className={`${config.color} pr-2 pt-1.5`}>
                        <Icon size={24} strokeWidth={2} />
                      </div>

                      {/* Dashed Line */}
                      <div className={`h-[2px] border-t-[2px] border-dashed ${config.borderColor} w-10 mt-4 mr-1 opacity-70`}></div>

                      {/* Center Node (Circle) */}
                      <div className={`absolute right-0 translate-x-[calc(50%+1px)] top-[14px] w-3 h-3 rounded-full border-2 ${config.borderColor} bg-white z-10`}></div>
                    </div>
                    <div className="w-1/2"></div>
                  </>
                ) : (
                  // RIGHT ALIGNED ITEM
                  <>
                    <div className="w-1/2"></div>
                    <div className="w-1/2 flex justify-start items-start relative">
                      {/* Center Node (Circle) */}
                      <div className={`absolute left-0 -translate-x-[calc(50%-1px)] top-[14px] w-3 h-3 rounded-full border-2 ${config.borderColor} bg-white z-10`}></div>
                      
                      {/* Dashed Line */}
                      <div className={`h-[2px] border-t-[2px] border-dashed ${config.borderColor} w-10 mt-4 ml-1 opacity-70`}></div>

                      {/* Icon */}
                      <div className={`${config.color} pl-2 pt-1.5`}>
                        <Icon size={24} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="text-left pl-4 pt-1">
                        <h5 className={`text-[17px] font-bold ${config.color} mb-1 flex items-center gap-2`}>
                          {item.status}
                        </h5>
                        <div className="text-[13px] font-bold text-gray-800">{formatDateTime(item.updatedAt)}</div>
                        <div className="text-[12px] font-semibold text-gray-500 mb-1">({timeAgo(item.updatedAt)})</div>
                        
                        {(item.location || item.remarks) && (
                          <div className="text-[12px] text-gray-600 max-w-xs leading-snug mb-1">
                            {item.location && <span>{item.location} {item.remarks ? '- ' : ''}</span>}
                            {item.remarks && <span>{item.remarks}</span>}
                          </div>
                        )}
                        {item.updatedBy && <div className="text-[12px] font-medium text-gray-400">{item.updatedBy}</div>}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Mobile View */}
              <div className="md:hidden flex w-full relative">
                {/* Center Node (Circle) */}
                <div className={`absolute left-6 -translate-x-[calc(50%-1px)] top-[14px] w-3 h-3 rounded-full border-2 ${config.borderColor} bg-white z-10`}></div>
                
                <div className="ml-6 pl-4 flex w-full">
                  {/* Dashed Line */}
                  <div className={`h-[2px] border-t-[2px] border-dashed ${config.borderColor} w-6 mt-4 mr-2 opacity-70`}></div>
                  
                  {/* Icon */}
                  <div className={`${config.color} mr-3 pt-1.5`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="text-left pt-1">
                    <h5 className={`text-[16px] font-bold ${config.color} mb-1 flex items-center gap-2`}>
                      {item.status}
                    </h5>
                    <div className="text-[13px] font-bold text-gray-800">{formatDateTime(item.updatedAt)}</div>
                    <div className="text-[12px] font-semibold text-gray-500 mb-1">({timeAgo(item.updatedAt)})</div>
                    
                    {(item.location || item.remarks) && (
                      <div className="text-[12px] text-gray-600 leading-snug mb-1">
                        {item.location && <span>{item.location} {item.remarks ? '- ' : ''}</span>}
                        {item.remarks && <span>{item.remarks}</span>}
                      </div>
                    )}
                    {item.updatedBy && <div className="text-[12px] font-medium text-gray-400">{item.updatedBy}</div>}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline;
