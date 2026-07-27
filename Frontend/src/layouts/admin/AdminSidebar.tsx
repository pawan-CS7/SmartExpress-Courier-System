import { NavLink } from "react-router-dom";

function AdminSidebar() {

const menu = [

  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "📊"
  },

  {
    label: "All Orders",
    path: "/admin/all-orders",
    icon: "📦"
  },

  {
    label: "Branch Orders",
    path: "/admin/branch-orders",
    icon: "🏢"
  },

{
  label: "Waybill Management",
  path: "/admin/waybill-management",
  icon: "🏷️"
},

  {
    label: "Users",
    path: "/admin/users",
    icon: "👥"
  },

  {
    label: "Cities",
    path: "/admin/cities",
    icon: "🏙️"
  },

  {
    label: "Reports",
    path: "/admin/reports",
    icon: "📈"
  },

  {
    label: "Notifications",
    path: "/admin/notify",
    icon: "🔔"
  },

  {
    label: "Profile",
    path: "/admin/profile",
    icon: "👤"
  }

];

  return (

    <div className="
w-64
bg-white
border-r
min-h-screen
p-5">

      <h1 className="
text-3xl
font-bold
mb-10
text-red-500">

        SmartExpress 🚚

      </h1>



      <div className="space-y-2">

        {

          menu.map(

            (item) => (

              <NavLink

                key={item.path}

                to={item.path}

                className={(

                  { isActive }

                ) =>

                  `
flex
gap-3
px-4
py-3
rounded-xl

${isActive

                    ?

                    "bg-red-500 text-white"

                    :

                    "text-gray-700 hover:bg-red-50"

                  }

`
                }

              >

                <span>
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </NavLink>

            )

          )

        }

      </div>

    </div>

  );

}

export default AdminSidebar;