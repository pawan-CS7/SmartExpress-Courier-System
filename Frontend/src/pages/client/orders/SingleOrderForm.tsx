import Card from "../../../components/ui/Card.tsx";
import Input from "../../../components/ui/Input.tsx";
function SingleOrderForm() {
  return (
    <div className="space-y-6">

      {/* INFO */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        This is the place where you should place an order. Kindly fill the details correctly.
      </div>

      {/* WAYBILL */}
      <Card title="Waybill Details">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Waybill Number" placeholder="Enter waybill number" />
          <Input label="Order No" placeholder="Enter order number" />
        </div>
      </Card>

      {/* CUSTOMER */}
      <Card title="Customer Details">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Customer Name" />
          <Input label="Address" />
          <Input label="First Phone" />
          <Input label="Second Phone" />
        </div>

        <div className="mt-4">
          <textarea
            placeholder="Order Description"
            className="w-full border rounded-lg p-3"
          />
        </div>
      </Card>

      {/* DELIVERY */}
      <Card title="Delivery Details">
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" />
          <Input label="COD Amount" />
        </div>
      </Card>

      {/* SUBMIT */}
      <div className="flex justify-end">
        <button className="bg-red-500 text-white px-6 py-2 rounded-lg">
          Submit Order
        </button>
      </div>
    </div>
  );
}export default SingleOrderForm;