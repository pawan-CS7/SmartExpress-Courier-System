import { useEffect, useState } from "react";
import api from "../../services/api";

function ProcessingOrders() {

    const [orders, setOrders] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");


    useEffect(() => {

        loadOrders();

    }, []);



    const loadOrders =
        async () => {

            try {

                const res =
                    await api.get(
                        "/orders/processing"
                    );

                setOrders(
                    res.data
                );

            }

            catch {

                setOrders([]);

            }

            finally {

                setLoading(false);

            }

        };



    const filtered =

        orders.filter(x => {

            const matchSearch =
                x.trackingNo
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchStatus =
                statusFilter === "All"
                ||
                x.status === statusFilter;

            return (
                matchSearch &&
                matchStatus
            );

        });



    return (

<div className="p-8 bg-gray-50 min-h-screen">

<h1 className="text-4xl font-bold mb-8">

🚚 Processing Orders

</h1>



{/* SUMMARY */}

<div className="grid md:grid-cols-3 gap-5 mb-8">

<div className="bg-blue-500 text-white rounded-3xl p-6 shadow">

<h2 className="text-lg">

Processing

</h2>

<p className="text-4xl font-bold">

{
orders.filter(
x=>x.status==="Processing"
).length
}

</p>

</div>



<div className="bg-orange-500 text-white rounded-3xl p-6">

<h2>

Out For Delivery

</h2>

<p className="text-4xl font-bold">

{
orders.filter(
x=>x.status==="Out"
).length
}

</p>

</div>



<div className="bg-red-500 text-white rounded-3xl p-6">

<h2>

Delayed

</h2>

<p className="text-4xl font-bold">

{
orders.filter(
x=>x.status==="Delayed"
).length
}

</p>

</div>

</div>



{/* FILTERS */}

<div className="flex gap-4 mb-8">

<input

placeholder="Search tracking no"

className="
border
rounded-xl
p-4
flex-1
"

value={search}

onChange={(e)=>

setSearch(
e.target.value
)

}

/>


<select

className="
border
rounded-xl
p-4
"

value={statusFilter}

onChange={(e)=>

setStatusFilter(
e.target.value
)

}

>

<option>All</option>
<option>Processing</option>
<option>Out</option>
<option>Delayed</option>

</select>

</div>



<div className="bg-white rounded-3xl shadow overflow-hidden">

<table className="w-full">

<thead className="bg-gray-100">

<tr>

<th className="p-4">

Tracking

</th>

<th>

Receiver

</th>

<th>

Status

</th>

<th>

Progress

</th>

<th>

Expected Date

</th>

</tr>

</thead>



<tbody>

{

loading ?

<tr>

<td colSpan={5}
className="p-10">

Loading...

</td>

</tr>

:

filtered.map(

order=>(

<tr
key={order.id}

className="border-t"

>

<td className="p-5">

{order.trackingNo}

</td>


<td>

{order.receiverName}

</td>



<td>

<span

className={`

px-3 py-1 rounded-full text-sm

${

order.status==="Processing"

?

"bg-blue-100 text-blue-700"

:

order.status==="Out"

?

"bg-orange-100 text-orange-700"

:

"bg-red-100 text-red-700"

}

`}

>

{order.status}

</span>

</td>



<td>

<div className="w-40 bg-gray-200 rounded-full">

<div

style={{

width:
`${order.progress}%`

}}

className="bg-green-500 h-3 rounded-full"

>

</div>

</div>

<p>

{order.progress}%

</p>

</td>



<td>

{

new Date(

order.expectedDate

)

.toLocaleDateString()

}

</td>

</tr>

)

)

}

</tbody>

</table>

</div>

</div>

    );

}

export default ProcessingOrders;