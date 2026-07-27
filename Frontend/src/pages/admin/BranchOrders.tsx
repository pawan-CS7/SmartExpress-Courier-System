import { useEffect, useMemo, useState } from "react";
import { getAllOrders } from "../../services/orderService";
import type { Order } from "../../types/Order";

function BranchOrders() {

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [search,
        setSearch] =
        useState("");

    const [status,
        setStatus] =
        useState("All");

    const [loading,
        setLoading] =
        useState(true);



    useEffect(() => {

        loadOrders();

    }, []);



    const loadOrders =
    async ()=>{

        try{

            const data =
                await getAllOrders();

            if(Array.isArray(data))
                setOrders(data);

            else if(
                Array.isArray(data.data)
            )
                setOrders(data.data);

        }
        catch(err){

            console.log(err);

        }
        finally{

            setLoading(false);

        }

    };



const filteredOrders =
useMemo(()=>{

return orders.filter(x=>{

const matchTracking =
x.trackingNo
?.toLowerCase()
.includes(
search.toLowerCase()
);

const matchStatus =
status==="All"

?

true

:

x.status===status;

return(
matchTracking
&&
matchStatus
);

});

},[
orders,
search,
status
]);



const pending =
filteredOrders.filter(
x=>x.status==="Pending"
).length;

const transit =
filteredOrders.filter(
x=>x.status==="InTransit"
).length;

const delivered =
filteredOrders.filter(
x=>x.status==="Delivered"
).length;



if(loading)
return <h2>
Loading...
</h2>;



return(

<div className="p-6">

<h1 className="
text-3xl
font-bold
mb-6">

Branch Orders

</h1>



{/* SUMMARY CARDS */}

<div className="
grid
grid-cols-3
gap-4
mb-6">

<div className="
bg-orange-500
text-white
p-5
rounded">

<h2>
Pending
</h2>

<p className="
text-3xl
font-bold">

{pending}

</p>

</div>



<div className="
bg-blue-500
text-white
p-5
rounded">

<h2>
In Transit
</h2>

<p className="
text-3xl
font-bold">

{transit}

</p>

</div>



<div className="
bg-green-600
text-white
p-5
rounded">

<h2>
Delivered
</h2>

<p className="
text-3xl
font-bold">

{delivered}

</p>

</div>

</div>



{/* FILTERS */}

<div className="
bg-white
p-4
rounded
shadow
mb-5
flex
gap-4">

<input

placeholder="
Search Tracking No"

value={search}

onChange={e=>
setSearch(
e.target.value
)}

className="
border
p-2
rounded
w-80"
/>



<select

value={status}

onChange={e=>
setStatus(
e.target.value
)}

className="
border
p-2
rounded">

<option>

All

</option>

<option>

Pending

</option>

<option>

InTransit

</option>

<option>

Delivered

</option>

</select>



<button

onClick={
loadOrders
}

className="
bg-gray-800
text-white
px-4
rounded">

Refresh

</button>

</div>



{/* CHART */}

<div className="
bg-white
p-5
rounded
shadow
mb-6">

<h2 className="
font-bold
mb-3">

Order Status Overview

</h2>


<div className="space-y-3">

<div>

Pending

<div className="
bg-gray-200
h-5
rounded">

<div

style={{
width:
`${pending*10}%`
}}

className="
bg-orange-500
h-5
rounded">

</div>

</div>

</div>



<div>

In Transit

<div className="
bg-gray-200
h-5
rounded">

<div

style={{
width:
`${transit*10}%`
}}

className="
bg-blue-500
h-5
rounded">

</div>

</div>

</div>



<div>

Delivered

<div className="
bg-gray-200
h-5
rounded">

<div

style={{
width:
`${delivered*10}%`
}}

className="
bg-green-600
h-5
rounded">

</div>

</div>

</div>

</div>

</div>



{/* TABLE */}

<div className="
bg-white
rounded
shadow
overflow-auto">

<table className="
w-full">

<thead>

<tr className="
bg-gray-100">

<th>ID</th>

<th>Tracking</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>


<tbody>

{

filteredOrders.map(
order=>(

<tr
key={order.id}

className="
border-b">

<td>

{order.id}

</td>


<td>

{order.trackingNo}

</td>


<td>

<span
className={

order.status
==="Delivered"

?

"text-green-600"

:

"text-orange-600"

}

>

{order.status}

</span>

</td>


<td>

<button
className="
bg-blue-500
text-white
px-3
py-1
rounded">

View

</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

);

}

export default BranchOrders;