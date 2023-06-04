import { useState } from 'react';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import logo from '../../../assets/react.svg';
import WindowSettings from '../floatingwindow/WindowSettings';
import { useContext } from 'react';
import strs from '../../../utils/strings.json';
import { Link } from 'react-router-dom';
import { EthContextAccount } from '../../../context/EthContextAccount';

const Navbar = () => {
    //https://zh-hant.reactjs.org/docs/hooks-state.html
    //dynamic changes
    const [toggleMenu, setToggleMenu] = useState(false);
    const [toggleSettings, setToggleSettings] = useState(false);
    const {currentAccount} = useContext(EthContextAccount);

    const navClick = (e) => {
        setToggleMenu(false);
        if(!currentAccount)
            return alert(strs.Nav_login);
        switch(e.target.innerHTML){
            case 'Settings':
                if (toggleSettings) setToggleSettings(false);
                else setToggleSettings(true);
                break;
        }
    }
    
    //tiny component with para: title, class properties, click listener
    const NavbarItem = ({title, classProps}) => {
        return (
            <li name={title} className={`mx-4 cursor-pointer ${classProps}`} onClick={navClick}>
                {title}
            </li>
        );
    }

    return (
        <nav className='w-full flex md:justify-center justify-between items-center p-4 bg-black'>
            <div className='md:flex-[1] flex-initial justify-center items-center'>
                <img src={logo} alt='logo' className='w-10 cursor-pointer' />
            </div>
            
            <div className='flex relative'>
                    {!toggleMenu && <HiMenuAlt4 fontSize={28} className='text-white md: cursor-pointer' onClick={() => setToggleMenu(true)}/>}
                    {toggleMenu && (
                        <ul
                            className='z-10 fixed top-0 -right-2 p-3 w-[30vw] h-screen shadow-2xl md:list-none
                                flex flex-col justify-start items-end rounded-md animate-slide-in backdrop-blur-sm text-white font-bold
                            '    
                        >
                            <li className='text-xl w-full my-2'>
                                <AiOutlineClose onClick={()=>setToggleMenu(false)}/>
                            </li>

                            <Link to = "/"><NavbarItem title="File" classProps={'my-2 text-lg1001'} key={"File"}/></Link>
                            <Link to = "/ut"><NavbarItem title="Unit Test" classProps={'my-2 text-lg1002'} key={"Unit Test"}/></Link>
                            <Link to = "/hello"><NavbarItem title="Hello World" classProps={'my-2 text-lg1003'} key={"Hello World"}/></Link>
                            
                            {['Settings'].map((item, index) => (
                                <NavbarItem title={item} classProps={'my-2 text-lg' + index} key={item}/>
                            ))}
                        </ul>
                    )}
            </div>

            {toggleSettings && <WindowSettings windowCloseSettings={()=>(setToggleSettings(false))}/>}
        </nav>
    );
}

export default Navbar;