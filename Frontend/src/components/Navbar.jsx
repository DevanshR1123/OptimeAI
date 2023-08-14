import { Link } from "react-router-dom";
import googleIcon from "../assets/icons/google.svg";
import menuIcon from "../assets/icons/menu.svg";
import { useAuth } from "./contexts/Auth";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

const Navbar = () => {
  const { Login, Logout, session, user } = useAuth();

  const LogoutView = () => {
    const { name, picture } = user;

    return (
      <Menu
        className="relative w-max rounded-xl bg-slate-600 px-4 py-2 text-lg font-bold transition-all duration-100 active:bg-slate-700 ui-open:rounded-b-none"
        as="div"
      >
        <Menu.Button className="flex items-center gap-2">
          <span>{name.split(" ")[0]}</span>
          <img
            src={picture}
            alt="profile picture"
            className="aspect-square w-8 rounded-full"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-0"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-0"
        >
          <Menu.Items className="absolute left-0 right-0 origin-top-right rounded-b-xl bg-slate-600 px-4 py-2 shadow-lg">
            <Menu.Item
              as="button"
              onClick={Logout}
              className="w-max text-left active:bg-slate-700"
            >
              Logout
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  const LoginView = () => {
    return (
      <>
        <button
          className="flex border-spacing-1 items-center gap-2 border-4 border-gray-200 bg-slate-600 px-6 py-2 text-lg font-bold active:bg-slate-800"
          onClick={Login}
        >
          <img src={googleIcon} className="h-6 w-6" />
          Login with Google
        </button>
      </>
    );
  };

  const links = [
    { label: "Home", to: "/" },
    { label: "Dashboard", to: "/dashboard" },
  ];

  return (
    <nav className="grid grid-cols-[auto_1fr_auto] items-center bg-slate-800 px-8 py-2">
      <div>
        <CustomMenu
          button={
            <>
              <img src={menuIcon} alt="" className="aspect-square w-6" />
            </>
          }
          items={links.map(({ label, to }) => ({
            label,
            props: {
              as: Link,
              to,
              className: "w-max text-left active:bg-slate-700",
            },
          }))}
        />
      </div>
      <h1 className="text-center text-4xl font-bold">OptimeAI</h1>
      <div>{session ? <LogoutView /> : <LoginView />}</div>
    </nav>
  );
};

export default Navbar;
