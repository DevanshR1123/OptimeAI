import { Link } from "react-router-dom";
import googleIcon from "../assets/icons/google.svg";
import menuIcon from "../assets/icons/menu.svg";
import { useAuth } from "./contexts/Auth";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { twMerge } from "tailwind-merge";

const Navbar = () => {
  const { Login, Logout, session, user } = useAuth();

  const styles = {
    menuButton: `relative z-[1] ease ease-in flex items-center gap-2 p-4 w-16 rounded-xl text-lg font-bold transition-all delay-0 ui-open:delay-75 active:bg-primary-700 hover:bg-primary-700 ui-open:ease-out`,
    menuItems: `absolute aspect-square top-0 delay-75 ui-open:delay-0 overflow-hidden rounded-xl bg-primary-700 pb-4 shadow-lg transition transform pt-16 `,
    menuItem: `w-full px-4 py-1 font-bold hover:bg-primary-600 grid text-primary-400 text-xl`,
  };

  const LogoutView = () => {
    const { name, picture } = user;

    const links = [
      { label: "Profile", to: "/profile" },
      { label: "Settings", to: "/settings" },
      { label: "Logout", to: "/", onClick: Logout },
    ];

    return (
      <Menu className="relative" as="div">
        <Menu.Button className={twMerge(styles.menuButton)}>
          <img
            src={picture}
            alt="profile picture"
            className="aspect-square w-full rounded-full"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="ease-out"
          enterFrom="opacity-0 scale-0"
          enterTo="opacity-100 scale-100"
          leave="ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-0"
        >
          <Menu.Items
            className={twMerge(
              styles.menuItems,
              "right-0 w-48 origin-top-right",
            )}
            as="ul"
          >
            {links.map(({ label, to, onClick }) => (
              <Menu.Item
                as="li"
                className={twMerge(styles.menuItem, "text-right")}
                key={to}
              >
                {({ close }) => (
                  <Link
                    to={to}
                    onClick={
                      onClick
                        ? () => {
                            onClick();
                            close();
                          }
                        : close
                    }
                  >
                    {label}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  const links = [
    { label: "Home", to: "/" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Timetable", to: "/timetable" },
  ];

  return (
    <nav className="grid grid-cols-3 items-center justify-between bg-primary-900 p-2">
      <div className={twMerge("justify-self-start", !session && "hidden")}>
        <Menu className="relative" as="div">
          <Menu.Button className={twMerge(styles.menuButton, "p-5")}>
            <img src={menuIcon} alt="" className="aspect-square w-full" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out"
            enterFrom="transform opacity-0 scale-0"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-0"
          >
            <Menu.Items
              className={twMerge(
                styles.menuItems,
                "left-0 w-48 origin-top-left",
              )}
              as="ul"
            >
              {links.map(({ label, to }) => (
                <Menu.Item
                  as="li"
                  className={twMerge(styles.menuItem, "text-left")}
                  key={to}
                >
                  {({ close }) => (
                    <Link to={to} onClick={close}>
                      {label}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <h1 className="col-start-2 justify-self-center text-center text-4xl font-bold">
        OptimeAI
      </h1>
      <div className="justify-self-end">
        {session ? (
          <LogoutView />
        ) : (
          <button
            className="flex items-center gap-2 rounded-xl px-6 py-4 text-lg font-bold hover:bg-primary-700"
            onClick={Login}
          >
            <img src={googleIcon} className="h-6 w-6" />
            Login with Google
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
