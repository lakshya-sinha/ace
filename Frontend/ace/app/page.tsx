import { LogInIcon } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="login_page_cover bg-cover flex items-center justify-center">
        <div className="login-container w-100 h-90 rounded-xl backdrop-blur-xl border-1 border-white shadow-xl flex flex-col p-4 hover:scale-102 hover:bg-green-800/10 transition">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-black-400 self-center">Sign In with username</h1>
            <p className="text-center text-gray-800">Make a new doc to bring your words, data, and teams together. For free.</p>
          </div>
         <div className="flex items-center flex-col m-6 gap-4 ">
            <form className="flex flex-col items-center w-full gap-4">
              <input type="text"  className="border w-full px-2 py-3  rounded-sm" name="username" placeholder="Username"/>
              <input type="text"  className="border w-full px-2 py-3 rounded-sm" name="password" placeholder="Password"/>
              <div className="flex gap-2 self-start">
                <input type="checkbox"  />
                <p>Remember Me</p>
              </div>
              <button className="w-full border px-2 py-2 hover:rounded-xl hover:bg-green-400 transition-all cursor-pointer ">Login</button>
            </form>
          </div>
          <p></p>
        </div>
       </div>
    </>
  );
}
