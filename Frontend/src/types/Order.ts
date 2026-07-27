export interface Order {
    id:number;
    trackingNo:string;
    senderName:string;
    receiverName:string;
    pickupAddress:string;
    deliveryAddress:string;
    status:string;
    createdDate:string;
}