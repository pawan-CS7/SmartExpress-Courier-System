type Props = {
  title: string;
  value: string | number;
  icon: string;
};

function DashboardCard({ title, value, icon }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {value}
          </h3>
        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default DashboardCard;