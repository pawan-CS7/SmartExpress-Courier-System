import { useState } from "react";
import {
  Upload,
  Barcode,
  Package
}
  from "lucide-react";

function CreateOrder() {

  const [tab, setTab] =
    useState("single");


  return (

    <div className="p-8 bg-slate-50 min-h-screen">

      <div
        className="
bg-white
rounded-3xl
shadow
p-8">

        <h1
          className="
text-4xl
font-bold
mb-2">

          Add New Order

        </h1>

        <p className="text-gray-500 mb-8">

          Create shipment using barcode

        </p>



        {/* TABS */}

        <div
          className="
flex gap-3 mb-8">

          <button

            onClick={() =>
              setTab("single")
            }

            className={`

px-6 py-3
rounded-xl

${tab === "single"

                ?

                "bg-red-500 text-white"

                :

                "bg-slate-100"

              }

`}>

            Single Order

          </button>



          <button

            onClick={() =>
              setTab("bulk")
            }

            className={`

px-6 py-3
rounded-xl

${tab === "bulk"

                ?

                "bg-red-500 text-white"

                :

                "bg-slate-100"

              }

`}>

            Bulk Upload

          </button>

        </div>






        {/* SINGLE */}

        {

          tab === "single"

          &&

          (

            <>

              <div
                className="
bg-slate-50
rounded-2xl
p-5
mb-6">

                <h2 className="font-bold mb-4">

                  Barcode / Waybill

                </h2>


                <div className="flex gap-3">

                  <input

                    placeholder="
Scan or enter barcode"

                    className="
border
p-3
rounded-xl
flex-1"
                  />


                  <button
                    className="
bg-indigo-600
text-white
px-5
rounded-xl">

                    Load

                  </button>

                </div>

              </div>





              <div
                className="
grid
md:grid-cols-2
gap-5">


                <input
                  placeholder="Sender Name"
                  className="
border
rounded-xl
p-3"
                />


                <input
                  placeholder="Sender Phone"
                  className="
border
rounded-xl
p-3"
                />


                <input
                  placeholder="Receiver Name"
                  className="
border
rounded-xl
p-3"
                />



                <input
                  placeholder="Receiver Phone"
                  className="
border
rounded-xl
p-3"
                />



                <input
                  placeholder="Weight"
                  className="
border
rounded-xl
p-3"
                />



                <input
                  placeholder="COD Amount"
                  className="
border
rounded-xl
p-3"
                />

              </div>



              <textarea

                placeholder="
Receiver Address"

                rows={4}

                className="
border
rounded-xl
w-full
p-4
mt-5"
              />



              <button
                className="
mt-6
bg-red-500
text-white
px-8 py-4
rounded-xl">

                Create Order

              </button>

            </>

          )

        }









        {/* BULK */}

        {

          tab === "bulk"

          &&

          (

            <div
              className="
bg-slate-50
rounded-2xl
p-10
text-center">

              <Upload
                size={50}
                className="
mx-auto
mb-5"/>


              <h2
                className="
text-2xl
font-bold
mb-3">

                Upload Orders

              </h2>


              <p
                className="
text-gray-500
mb-5">

                Upload CSV or Excel file

              </p>



              <input

                type="file"

                accept="
.csv,
.xlsx"

                className="
mb-5"
              />



              <div
                className="
text-sm
text-gray-500
mb-5">

                Expected columns:

                TrackingNo,
                Sender,
                Receiver,
                Phone,
                Address,
                Weight,
                COD

              </div>



              <button
                className="
bg-indigo-600
text-white
px-8 py-4
rounded-xl">

                Import Orders

              </button>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default CreateOrder;