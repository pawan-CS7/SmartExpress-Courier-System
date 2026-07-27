import api from "../api/axios";

export const getUsers =
async()=>{

    const res =
    await api.get(
        "/users"
    );

    return res.data;
};



export const updateRole =
async(data:any)=>{

    const res =
    await api.put(

        "/users/role",

        data

    );

    return res.data;
};