import api from "../api/axios";

export const getUsers =
async()=>{

    const res =
    await api.get(
        "/api/users"
    );

    return res.data;
};

export const registerUser = async (data: any) => {
    const res = await api.post("/api/users/register", data);
    return res.data;
};



export const updateRole =
async(data:any)=>{

    const res =
    await api.put(
        "/api/users/role",
        data

    );

    return res.data;
};

export const updateStaff = async (id: number, data: any) => {
    const res = await api.put(`/api/staff/${id}`, data);
    return res.data;
};

export const deleteStaff = async (id: number) => {
    const res = await api.delete(`/api/staff/${id}`);
    return res.data;
};