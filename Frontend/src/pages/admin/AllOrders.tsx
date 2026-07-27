import { useEffect, useMemo, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import type { Order } from "../../types/Order";

import {
    Package,
    Clock,
    CheckCircle,
    Search
}
    from "lucide-react";

function AllOrders() {

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");



    useEffect(() => {

        loadOrders();

    }, []);



    const loadOrders =
        async () => {

            try {

                const data =
                    await getAllOrders();

                if (Array.isArray(data))
                    setOrders(data);

                else if (Array.isArray(data.orders))
                    setOrders(data.orders);

                else if (Array.isArray(data.data))
                    setOrders(data.data);

                else
                    setOrders([]);

            }
            catch {

                setOrders([]);

            }
            finally {

                setLoading(false);

            }

        };



    const filteredOrders =
        useMemo(() => {

            return orders.filter(x =>

                x.trackingNo
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )

            );

        }, [orders, search]);



    const totalOrders =
        orders.length;

    const delivered =
        orders.filter(
            x => x.status === "Delivered"
        ).length;

    const pending =
        orders.filter(
            x => x.status === "Pending"
        ).length;




    if (loading) {

        return (
            <div className="p-8">

                Loading orders...

            </div>
        );

    }



    return (

        <div
            className="
min-h-screen
p-8
bg-gradient-to-br
from-slate-50
to-indigo-50">

            <h1
                className="
text-4xl
font-bold
mb-2">

                Orders Management

            </h1>


            <p
                className="
text-gray-500
mb-8">

                Manage courier deliveries

            </p>




            {/* KPI */}

            <div
                className="
grid
md:grid-cols-3
gap-6
mb-8">


                <div
                    className="
bg-gradient-to-r
from-blue-500
to-indigo-600
text-white
rounded-3xl
p-6">

                    <Package />

                    <h2 className="mt-3">

                        Total Orders

                    </h2>

                    <p className="text-4xl">

                        {totalOrders}

                    </p>

                </div>




                <div
                    className="
bg-gradient-to-r
from-orange-400
to-red-500
text-white
rounded-3xl
p-6">

                    <Clock />

                    <h2 className="mt-3">

                        Pending

                    </h2>

                    <p className="text-4xl">

                        {pending}

                    </p>

                </div>




                <div
                    className="
bg-gradient-to-r
from-green-500
to-emerald-600
text-white
rounded-3xl
p-6">

                    <CheckCircle />

                    <h2 className="mt-3">

                        Delivered

                    </h2>

                    <p className="text-4xl">

                        {delivered}

                    </p>

                </div>


            </div>





            {/* SEARCH */}

            <div
                className="
bg-white
rounded-3xl
shadow
p-5
mb-8">

                <div
                    className="
flex
items-center
gap-3">

                    <Search />

                    <input

                        value={search}

                        onChange={e =>
                            setSearch(
                                e.target.value
                            )
                        }

                        placeholder="
Search tracking no..."

                        className="
w-full
outline-none
"/>

                </div>

            </div>





            {/* TABLE */}

            <div
                className="
bg-white
rounded-3xl
shadow-xl
overflow-hidden">

                <table
                    className="
w-full">

                    <thead
                        className="
bg-slate-100">

                        <tr>

                            <th className="p-5">

                                ID

                            </th>

                            <th>

                                Tracking No

                            </th>

                            <th>

                                Status

                            </th>

                            <th>

                                Actions

                            </th>

                        </tr>

                    </thead>



                    <tbody>

                        {

                            filteredOrders.length > 0

                                ?

                                filteredOrders.map(order => (

                                    <tr
                                        key={order.id}

                                        className="
border-b
hover:bg-slate-50">

                                        <td className="p-5">

                                            {order.id}

                                        </td>



                                        <td>

                                            {order.trackingNo}

                                        </td>



                                        <td>

                                            <span
                                                className={`

px-3 py-1
rounded-full
text-sm

${order.status === "Delivered"

                                                        ?

                                                        "bg-green-100 text-green-700"

                                                        :

                                                        "bg-orange-100 text-orange-700"

                                                    }

`}>

                                                {order.status}

                                            </span>

                                        </td>



                                        <td>

                                            <button
                                                className="
bg-indigo-600
text-white
px-4 py-2
rounded-xl">

                                                View

                                            </button>

                                        </td>

                                    </tr>

                                ))

                                :

                                (

                                    <tr>

                                        <td
                                            colSpan={4}

                                            className="
p-8
text-center">

                                            No orders found

                                        </td>

                                    </tr>

                                )

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default AllOrders;