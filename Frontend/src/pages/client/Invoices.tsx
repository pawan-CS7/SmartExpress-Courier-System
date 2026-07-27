import { useEffect, useState } from "react";
import api from "../../services/api";

function Invoices() {

    const [invoices, setInvoices] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");



    useEffect(() => {

        loadInvoices();

    }, []);



    const loadInvoices =
        async () => {

            try {

                const res =
                    await api.get(
                        "/invoice/my"
                    );

                setInvoices(
                    res.data
                );

            }
            catch (err) {

                console.log(err);

            }
            finally {

                setLoading(false);

            }

        };



    const filtered =

        invoices.filter(

            x =>

                x.trackingNo

                    ?.toLowerCase()

                    .includes(

                        search.toLowerCase()

                    )

        );



    return (

        <div className="p-8">

            <h1 className="text-4xl font-bold mb-8">

                💰 My Invoices

            </h1>



            <input

                placeholder="Search tracking number"

                value={search}

                onChange={(e) =>

                    setSearch(
                        e.target.value
                    )
                }

                className="
border
rounded-xl
p-4
w-full
mb-8
"

            />



            <div className="
bg-white
rounded-3xl
shadow
overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="p-4">

                                Tracking No

                            </th>

                            <th>

                                Amount

                            </th>

                            <th>

                                Status

                            </th>

                            <th>

                                Date

                            </th>

                        </tr>

                    </thead>



                    <tbody>

                        {

                            loading ?

                                <tr>

                                    <td
                                        colSpan={4}
                                        className="p-10"
                                    >

                                        Loading...

                                    </td>

                                </tr>

                                :

                                filtered.map(

                                    invoice => (

                                        <tr
                                            key={invoice.id}

                                            className="border-t"
                                        >

                                            <td className="p-4">

                                                {
                                                    invoice.trackingNo
                                                }

                                            </td>


                                            <td>

                                                Rs.
                                                {
                                                    invoice.amount
                                                }

                                            </td>



                                            <td>

                                                <span
                                                    className={`

px-3 py-1 rounded-full

${

invoice.status === "Paid"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}

`}
                                                >

                                                    {
                                                        invoice.status
                                                    }

                                                </span>

                                            </td>



                                            <td>

                                                {

                                                    new Date(

                                                        invoice.createdDate

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

export default Invoices;