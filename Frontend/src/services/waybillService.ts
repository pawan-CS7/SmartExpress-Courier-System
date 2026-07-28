import api from "./api";

export const getAvailableBarcodes = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/api/Waybill/available", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};
