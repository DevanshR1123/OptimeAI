import { Link } from "react-router-dom";
import { useAuth } from "./contexts/Auth";

const Navbar = () => {
  const { Login, Logout, session, user } = useAuth();

  const LogoutView = () => {
    const { name, picture } = user;

    return (
      <div className=''>
        <button
          className='text-lg font-bold rounded-xl bg-slate-600 active:bg-slate-800 border-gray-200 border-2'
          onClick={Logout}>
          <div className='flex items-center gap-2 py-2 px-4'>
            <span>{name.split(" ")[0]}</span>
            <img src={picture} alt='profile picture' className='rounded-full aspect-square w-8' />
          </div>
        </button>
      </div>
    );
  };

  const LoginView = () => {
    return (
      <div>
        <button
          className='px-6 py-1 text-lg font-bold bg-slate-600 border-spacing-1 active:bg-slate-800 border-gray-200 border-4'
          onClick={Login}>
          Login
        </button>
      </div>
    );
  };

  return (
    <nav className='grid grid-cols-[auto_1fr_auto] bg-slate-800 px-8 py-2 items-center'>
      <div className='border-white border-4 rounded-full grid place-items-center w-16 h-16'>
        Logo
      </div>
      <ul className='flex gap-4 justify-around items-center'>
        <li>
          <Link to='/'>Home</Link>
        </li>
        <li>
          <Link to='/dashboard'>Dashboard</Link>
        </li>
        <li></li>
      </ul>
      <div>{session ? <LogoutView /> : <LoginView />}</div>
    </nav>
  );
};

export default Navbar;
