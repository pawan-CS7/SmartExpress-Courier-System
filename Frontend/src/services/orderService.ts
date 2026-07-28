import api from "./api";


/* =========================
   ADMIN - ALL ORDERS
========================= */

export const getAllOrders =
async () => {

    const token =
        localStorage.getItem(
            "token"
        );

    const res =
        await api.get(
            "/api/Orders",
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