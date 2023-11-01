import { withPrefix } from "gatsby";
import parchment from '../assets/Texturelabs_Glass_151L.jpg';

const MainMenu = () => {
  console.log(`parchment: ${parchment}`);
  return (
    <div className={`mx-52 w-2/6 h-4/6 p-5 bg-parchment bg-transparent/50 backdrop-blur-md border-black/20 border-4 absolute top-[5.125rem] left-10 `}>
      <menu>
        <li><button><h1 className='text-3xl font-bold text-japan-red hover:text-red-400'>About Me</h1></button></li>
        <li><button><h1 className='text-3xl font-bold text-japan-red hover:text-red-400' >About This Site</h1></button></li>
        <li><button><h1 className='text-3xl font-bold text-japan-red hover:text-red-400'>My Resume</h1></button></li>
        <li><button><h1 className='text-3xl font-bold text-japan-red hover:text-red-400'>Contact</h1></button></li>
      </menu>
    </div>
  );
}

export default MainMenu;