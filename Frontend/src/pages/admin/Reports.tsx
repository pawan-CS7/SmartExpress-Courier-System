import { useEffect, useState } from "react";
import { getReports } from "../../services/reportService";

import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import {
    Package,
    CheckCircle,
    Clock,
    DollarSign
} from "lucide-react";

function Reports() {

    const [report, setReport] =
        useState<any>(null);


    useEffect(() => {

        loadReports();

    }, []);



    const loadReports =
        async () => {

            try {

                const data =
                    await getReports();

                setReport(data);

            }
            catch (error) {

                console.log(error);

            }

        };


    if (!report)
        return (
            <div className="p-10">
                Loading...
            </div>
        );



    const cards = [

        {
            title: "Total Orders",
            value: report.totalOrders,
            icon: <Package size={28} />,
            bg: "from-blue-500 to-indigo-600"
        },

        {
            title: "Delivered",
            value: report.deliveredOrders,
            icon: <CheckCircle size={28} />,
            bg: "from-green-500 to-emerald-600"
        },

        {
            title: "Pending",
            value: report.pendingOrders,
            icon: <Clock size={28} />,
            bg: "from-orange-400 to-red-500"
        },

        {
            title: "Revenue",
            value: `Rs ${report.totalRevenue}`,
            icon: <DollarSign size={28} />,
            bg: "from-purple-500 to-pink-600"
        }

    ];



    const pieData = [

        {
            name: "Delivered",
            value:
                Number(report.deliveredOrders) || 0
        },

        {
            name: "Pending",
            value:
                Number(report.pendingOrders) || 0
        }

    ];



    return (

        <div
            className="
min-h-screen
p-8
bg-gradient-to-br
from-sky-50
via-purple-50
to-pink-50
"
        >

            <h1 className="text-4xl font-bold">

                Reports Dashboard

            </h1>

            <p className="text-gray-500 mb-8">

                Courier analytics overview

            </p>




            {/* KPI CARDS */}

            <div className="grid md:grid-cols-4 gap-6 mb-10">

                {

                    cards.map((card, index) => (

                        <div

                            key={index}

                            className={`

bg-gradient-to-r

${card.bg}

rounded-3xl

p-6

text-white

shadow-xl

hover:scale-105

transition

duration-300

`}

                        >

                            <div className="flex justify-between">

                                <div>

                                    <p className="opacity-80">

                                        {card.title}

                                    </p>


                                    <h2 className="text-4xl font-bold mt-3">

                                        {card.value}

                                    </h2>

                                </div>


                                <div>

                                    {card.icon}

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>






            {/* CHARTS */}

            <div className="grid md:grid-cols-2 gap-8 mb-10">



                {/* BAR CHART */}

                <div
                    className="
bg-white/70
backdrop-blur-md
rounded-3xl
p-6
shadow-xl
">

                    <h2 className="font-bold text-xl mb-5">

                        Orders Overview

                    </h2>



                    <ResponsiveContainer
                        width="100%"
                        height={300}>

                        <BarChart data={[report]}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis />

                            <YAxis />

                            <Tooltip />


                            <Bar
                                dataKey="totalOrders"
                                fill="#6366f1"
                            />

                            <Bar
                                dataKey="deliveredOrders"
                                fill="#10b981"
                            />

                            <Bar
                                dataKey="pendingOrders"
                                fill="#f59e0b"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>






                {/* PIE CHART */}

                <div
                    className="
bg-white/70
backdrop-blur-md
rounded-3xl
p-6
shadow-xl
">

                    <h2 className="font-bold text-xl mb-5">

                        Delivery Ratio

                    </h2>


                    {

                        pieData.some(x => x.value > 0)

                            ?

                            (

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}>

                                    <PieChart>

                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={100}
                                            label>

                                            <Cell fill="#10b981" />

                                            <Cell fill="#ef4444" />

                                        </Pie>


                                        <Tooltip />

                                    </PieChart>

                                </ResponsiveContainer>

                            )

                            :

                            (

                                <p>No data available</p>

                            )

                    }

                </div>


            </div>







            {/* TABLE */}

            <div
                className="
bg-white/70
backdrop-blur-md
rounded-3xl
shadow-xl
p-6
">

                <h2 className="text-2xl font-bold mb-6">

                    Detailed Report

                </h2>



                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-4">

                                Metric

                            </th>

                            <th className="text-left">

                                Value

                            </th>

                        </tr>

                    </thead>




                    <tbody>


                        <tr className="hover:bg-blue-50">

                            <td className="py-4">

                                Total Orders

                            </td>

                            <td>

                                <span
                                    className="
bg-blue-100
text-blue-700
px-3 py-1
rounded-full
">

                                    {report.totalOrders}

                                </span>

                            </td>

                        </tr>





                        <tr className="hover:bg-green-50">

                            <td className="py-4">

                                Delivered

                            </td>

                            <td>

                                <span
                                    className="
bg-green-100
text-green-700
px-3 py-1
rounded-full
">

                                    {report.deliveredOrders}

                                </span>

                            </td>

                        </tr>





                        <tr className="hover:bg-orange-50">

                            <td className="py-4">

                                Pending

                            </td>

                            <td>

                                <span
                                    className="
bg-orange-100
text-orange-700
px-3 py-1
rounded-full
">

                                    {report.pendingOrders}

                                </span>

                            </td>

                        </tr>





                        <tr className="hover:bg-purple-50">

                            <td className="py-4">

                                Revenue

                            </td>

                            <td>

                                <span
                                    className="
bg-purple-100
text-purple-700
px-3 py-1
rounded-full
">

                                    Rs {report.totalRevenue}

                                </span>

                            </td>

                        </tr>


                    </tbody>

                </table>

            </div>


        </div>

    );

}

export default Reports;