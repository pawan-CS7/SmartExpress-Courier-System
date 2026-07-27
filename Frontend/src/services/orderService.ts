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
            "/orders",
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
            "/orders/my",
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