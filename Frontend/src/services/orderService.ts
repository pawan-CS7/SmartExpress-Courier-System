import api from "./api";


/* =========================
   ADMIN - ALL ORDERS
========================= */

export const getAllOrders = async (branchId?: number | string, originBranchId?: number | string, destinationBranchId?: number | string) => {
    const token = localStorage.getItem("token");
    let url = "/api/Orders?";
    if (branchId) url += `branchId=${branchId}&`;
    if (originBranchId) url += `originBranchId=${originBranchId}&`;
    if (destinationBranchId) url += `destinationBranchId=${destinationBranchId}&`;

    const res = await api.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.data;
};




/* =========================
   CLIENT - MY ORDERS
========================= */

export const getMyOrders =
async () => {

    const token =
        localStorage.getItem(
            "token"
        );

    const res =
        await api.get(
            "/api/Orders/my",
            {
                headers:
                {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    return res.data;
};

/* =========================
   CLIENT - CREATE ORDER
========================= */

export const createOrder = async (orderData: any) => {
    const token = localStorage.getItem("token");
    const res = await api.post("/api/Orders", orderData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};

/* =========================
   CLIENT - BULK UPLOAD
========================= */

export const uploadBulkOrders = async (file: File) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/Orders/bulk", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

/* =========================
   CLIENT - UPDATE ORDER
========================= */

export const updateOrder = async (id: number, orderData: any) => {
    const token = localStorage.getItem("token");
    const res = await api.put(`/api/Orders/${id}`, orderData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};

/* =========================
   ASSIGN RIDER
========================= */

export const assignRider = async (trackingNumber: string, riderId: number) => {
    const token = localStorage.getItem("token");
    const res = await api.post(`/api/Orders/${trackingNumber}/assign-rider`, riderId, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    return res.data;
};