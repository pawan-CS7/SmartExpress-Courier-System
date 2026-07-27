// import { Link, useLocation } from "react-router-dom";
// import { useState } from "react";

// function ClientSidebar() {
//   const location = useLocation();

//   const [openOps, setOpenOps] = useState(true);
//   const [openReports, setOpenReports] = useState(false);

//   const isActive = (path: string) =>
//     location.pathname === path;

//   return (
//     <div className="w-64 h-screen bg-white border-r shadow-sm fixed p-4 overflow-y-auto">

//       {/* LOGO */}
//       <div className="text-xl font-bold mb-6 flex items-center gap-2">
//         🚚 SmartExpress
//       </div>

//       {/* MENU */}
//       <div className="space-y-2 text-gray-700 text-sm">

//         {/* Dashboard */}
//         <Link
//           to="/client/dashboard"
//           className={`block px-4 py-3 rounded-xl transition ${
//             isActive("/client/dashboard")
//               ? "bg-red-50 text-red-500 font-medium"
//               : "hover:bg-gray-100"
//           }`}
//         >
//           🏠 Dashboard
//         </Link>

//         {/* Add Order */}
//         <Link
//           to="/client/orders/create"
//           className="block px-4 py-3 rounded-xl hover:bg-gray-100"
//         >
//           ➕ Add New Order
//         </Link>

//         {/* My Orders */}
//         <Link
//           to="/client/orders"
//           className="block px-4 py-3 rounded-xl hover:bg-gray-100"
//         >
//           📦 My Orders
//         </Link>

//         {/* Barcode */}
//         <Link
//           to="/client/barcode"
//           className="block px-4 py-3 rounded-xl hover:bg-gray-100"
//         >
//           📊 Barcode Print
//         </Link>

//         {/* Invoices */}
//         <Link
//           to="/client/invoices"
//           className="block px-4 py-3 rounded-xl hover:bg-gray-100"
//         >
//           💰 My Invoices
//         </Link>

//         {/* CLIENT OPERATIONS */}
//         <div>
//           <button
//             onClick={() => setOpenOps(!openOps)}
//             className="w-full flex justify-between px-4 py-3 rounded-xl hover:bg-gray-100"
//           >
//             👤 Client Operations
//             <span>{openOps ? "▾" : "▸"}</span>
//           </button>

//           {openOps && (
//             <div className="ml-4 bg-gray-50 rounded-xl p-2 space-y-1">

//               <Link to="/client/processing" className="block p-2 rounded hover:bg-gray-100">
//                 Processing Orders
//               </Link>

//               <button
//                 onClick={() => setOpenReports(!openReports)}
//                 className="w-full flex justify-between p-2 rounded hover:bg-gray-100"
//               >
//                 Delivery Reports
//                 <span>{openReports ? "▾" : "▸"}</span>
//               </button>

//               {openReports && (
//                 <div className="ml-4 space-y-1">
//                   <Link to="/client/returned" className="block p-2 rounded hover:bg-gray-100">
//                     Returned Orders
//                   </Link>
//                   <Link to="/client/age" className="block p-2 rounded hover:bg-gray-100">
//                     Age Reports
//                   </Link>
//                 </div>
//               )}

//               <Link to="/client/receivable" className="block p-2 rounded hover:bg-gray-100">
//                 Receivable Orders
//               </Link>

//               <Link to="/client/received" className="block p-2 rounded bg-white shadow">
//                 Received Orders
//               </Link>

//             </div>
//           )}
//         </div>

//         {/* Pickup */}
//         <Link
//           to="/client/pickups"
//           className="block px-4 py-3 rounded-xl hover:bg-gray-100"
//         >
//           🚚 Pickup Operation
//         </Link>

//         {/* Waybill */}
//         <Link
//           to="/client/waybill"
//           className="block px-4 py-3 rounded-xl hover:bg-gray-100"
//         >
//           🎟 Waybill Request
//         </Link>

//         {/* Divider */}
//         <div className="border-t my-4"></div>

//         {/* Profile */}
//         <Link to="/client/profile" className="block px-4 py-3 rounded-xl hover:bg-gray-100">
//           👤 My Profile
//         </Link>

//       </div>
//     </div>
//   );
// }

// export default ClientSidebar;

import { Link, useLocation }
  from "react-router-dom";

import { useState }
  from "react";


function ClientSidebar() {

  const location =
    useLocation();

  const [openOps,
    setOpenOps] =
    useState(true);

  const [openReports,
    setOpenReports] =
    useState(false);



  const isActive =
    (path: string) =>

      location.pathname
      === path;



  return (

    <div
      className="
w-64
h-screen
bg-white
border-r
shadow-sm
fixed
p-4
overflow-y-auto">


      {/* LOGO */}

      <div
        className="
text-xl
font-bold
mb-6
flex
gap-2">

        🚚 SmartExpress

      </div>




      <div
        className="
space-y-2
text-sm">



        {/* Dashboard */}

        <Link

          to="/client/dashboard"

          className={`

block
px-4 py-3
rounded-xl

${isActive(
            "/client/dashboard"
          )

              ?

              "bg-red-50 text-red-500"

              :

              "hover:bg-gray-100"

            }

`}

        >

          🏠 Dashboard

        </Link>






        {/* Create Order */}

        <Link

          to="/client/orders/create"

          className={`

block
px-4 py-3
rounded-xl

${isActive(
            "/client/orders/create"
          )

              ?

              "bg-red-50 text-red-500"

              :

              "hover:bg-gray-100"

            }

`}

        >

          ➕ Add New Order

        </Link>






        {/* Orders */}

        <Link

          to="/client/orders"

          className={`

block
px-4 py-3
rounded-xl

${isActive(
            "/client/orders"
          )

              ?

              "bg-red-50 text-red-500"

              :

              "hover:bg-gray-100"

            }

`}

        >

          📦 My Orders

        </Link>







        {/* Barcode Print */}

        <Link

          to="/client/barcode"

          className={`

block
px-4 py-3
rounded-xl

${isActive(
            "/client/barcode"
          )

              ?

              "bg-red-50 text-red-500"

              :

              "hover:bg-gray-100"

            }

`}

        >

          🖨 Barcode Print

        </Link>







        {/* Waybill Request */}

        <Link

          to="/client/waybill-request"

          className={`

block
px-4 py-3
rounded-xl

${isActive(
            "/client/waybill-request"
          )

              ?

              "bg-red-50 text-red-500"

              :

              "hover:bg-gray-100"

            }

`}

        >

          🎟 Waybill Request

        </Link>






        {/* Invoices */}

        <Link

          to="/client/invoices"

          className="
block
px-4 py-3
rounded-xl
hover:bg-gray-100">

          💰 My Invoices

        </Link>








        {/* CLIENT OPERATIONS */}

        <div>

          <button

            onClick={() =>

              setOpenOps(
                !openOps
              )

            }

            className="
w-full
flex
justify-between
px-4 py-3
rounded-xl
hover:bg-gray-100">

            👤 Client Operations

            <span>

              {

                openOps

                  ?

                  "▾"

                  :

                  "▸"

              }

            </span>

          </button>



          {

            openOps && (

              <div
                className="
ml-4
bg-gray-50
rounded-xl
p-2
space-y-1">

                <Link
                  to="/client/processing"

                  className="
block
p-2">

                  Processing Orders

                </Link>



                <Link
                  to="/client/receivable"

                  className="
block
p-2">

                  Receivable Orders

                </Link>



                <Link
                  to="/client/received"

                  className="
block
p-2">

                  Received Orders

                </Link>



                <button

                  onClick={() =>

                    setOpenReports(
                      !openReports
                    )

                  }

                  className="
w-full
text-left
p-2">

                  Delivery Reports

                </button>



                {

                  openReports && (

                    <div
                      className="
ml-4">

                      <Link
                        to="/client/returned"

                        className="
block p-2">

                        Returned Orders

                      </Link>

                      <Link
                        to="/client/age"

                        className="
block p-2">

                        Age Reports

                      </Link>

                    </div>

                  )

                }

              </div>

            )

          }

        </div>






        <div
          className="
border-t
my-4"/>




        <Link

          to="/client/profile"

          className="
block
px-4 py-3
rounded-xl
hover:bg-gray-100">

          👤 My Profile

        </Link>


      </div>

    </div>

  );

}

export default ClientSidebar;