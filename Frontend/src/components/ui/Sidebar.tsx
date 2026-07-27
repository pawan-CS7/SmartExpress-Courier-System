import {
    NavLink,
    useNavigate
}
from "react-router-dom";

type MenuItem = {

    label: string;

    path: string;

    icon: string;
};

type Props = {

    items: MenuItem[];

};



function Sidebar(
    {
        items
    }: Props
) {

    const navigate =
        useNavigate();



    const logout =
        () => {

            localStorage
                .removeItem(
                    "token"
                );

            localStorage
                .removeItem(
                    "role"
                );

            navigate(
                "/login"
            );
        };



    return (

        <div className="
        w-64
        bg-white
        border-r
        border-gray-100
        min-h-screen
        p-5
        shadow-sm
        flex
        flex-col
        justify-between
        ">

            {/* TOP */}

            <div>

                <h1 className="
                text-3xl
                font-bold
                mb-10
                text-red-500
                ">

                    SmartExpress 🚚

                </h1>



                <div className="
                space-y-2">

                    {

                        items.map(

                            (item) => (

                                <NavLink

                                    key={
                                        item.path
                                    }

                                    to={
                                        item.path
                                    }

                                    className={(

                                        {
                                            isActive
                                        }

                                    ) =>

                                        `
                                        flex
                                        items-center
                                        gap-3
                                        px-4
                                        py-3
                                        rounded-xl
                                        transition

                                        ${

                                            isActive

                                                ?

                                                "bg-red-500 text-white shadow"

                                                :

                                                "hover:bg-red-50 text-gray-700"

                                        }

                                        `
                                    }

                                >

                                    <span>

                                        {
                                            item.icon
                                        }

                                    </span>

                                    <span>

                                        {
                                            item.label
                                        }

                                    </span>

                                </NavLink>

                            )

                        )

                    }

                </div>

            </div>



            {/* BOTTOM */}

            <button

                onClick={
                    logout
                }

                className="
                bg-gray-100
                hover:bg-red-500
                hover:text-white
                rounded-xl
                py-3
                transition
                "

            >

                Logout 🚪

            </button>

        </div>

    );

}

export default Sidebar;