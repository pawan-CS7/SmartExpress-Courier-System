export interface Order {
    id: number;
    trackingNumber?: string;
    clientId?: number;
    clientName?: string;
    client?: {
        id?: number;
        businessName?: string;
        ownerName?: string;
        phone?: string;
        address?: string;
        pickupAddress?: string;
    };
    customerName?: string;
    senderName?: string;
    receiverName?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    address?: string;
    phone1?: string;
    phone2?: string;
    codAmount?: number;
    status?: string;
    remarks?: string;
    originBranchId?: number;
    destinationBranchId?: number;
    currentBranchId?: number;
    createdAt?: string;
    createdDate?: string;
    statusChangedAt?: string;
}