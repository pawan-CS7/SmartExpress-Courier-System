import api from "../../src/api/axios";

export const getReports = async () => {
    const response =
        await api.get("/Reports");

    return response.data;
};