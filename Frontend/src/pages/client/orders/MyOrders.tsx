import { useEffect, useMemo, useState } from "react";
import { getMyOrders }
  from "../../../services/orderService";

import {
  Package,
  CheckCircle,
  Clock,
  Search
}
  from "lucide-react";


function MyOrders() {

  const [orders, setOrders] =
    useState<any[]>([]);

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
          await getMyOrders();

        console.log(data);

        setOrders(data);

      }
      catch (error) {

        console.log(error);

      }
      finally {

        setLoading(false);

      }

    };



  const filtered =
    useMemo(() => {

      return orders.filter(

        x =>

          x.barcode
            ?.toLowerCase()

            .includes(

              search.toLowerCase()

            )

      );

    }, [
      orders,
      search
    ]);



  const total =
    orders.length;

  const active =
    orders.filter(
      x => !x.isUsed
    ).length;

  const used =
    orders.filter(
      x => x.isUsed
    ).length;




  if (loading) {

    return (

      <div className="p-8">

        Loading...

      </div>

    );

  }



  return (

    <div
      className="
p-8
bg-slate-50
min-h-screen">

      <h1
        className="
text-4xl
font-bold
mb-2">

        My Orders 📦

      </h1>

      <p
        className="
text-gray-500
mb-8">

        Track your shipments

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
bg-blue-500
text-white
rounded-3xl
p-6">

          <Package />

          <h2>Total Orders</h2>

          <p className="text-4xl">

            {total}

          </p>

        </div>



        <div
          className="
bg-orange-500
text-white
rounded-3xl
p-6">

          <Clock />

          <h2>Active</h2>

          <p className="text-4xl">

            {active}

          </p>

        </div>



        <div
          className="
bg-green-500
text-white
rounded-3xl
p-6">

          <CheckCircle />

          <h2>Used</h2>

          <p className="text-4xl">

            {used}

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
Search barcode"

            className="
w-full
outline-none"
          />

        </div>

      </div>








      {/* TABLE */}

      <div
        className="
bg-white
rounded-3xl
shadow
overflow-hidden">

        <table
          className="
w-full">

          <thead
            className="
bg-slate-100">

            <tr>

              <th className="p-5">

                Barcode

              </th>

              <th>

                Status

              </th>

              <th>

                Action

              </th>

            </tr>

          </thead>




          <tbody>

            {

              filtered.length > 0

                ?

                filtered.map(order => (

                  <tr
                    key={order.id}

                    className="
border-b">

                    <td className="p-5">

                      {order.barcode}

                    </td>



                    <td>

                      <span
                        className={`

px-3 py-1
rounded-full

${order.isUsed

                            ?

                            "bg-green-100 text-green-700"

                            :

                            "bg-orange-100 text-orange-700"

                          }

`}>

                        {

                          order.isUsed

                            ?

                            "Assigned"

                            :

                            "Available"

                        }

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
                      colSpan={3}

                      className="
text-center
p-10">

                      No Orders Found

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

export default MyOrders;