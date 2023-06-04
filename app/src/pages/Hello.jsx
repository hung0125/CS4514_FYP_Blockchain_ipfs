import React from "react";
import Navbar from "./components/general/Navbar";
import Footer from "./components/general/Footer";
import { create } from 'ipfs-http-client';


const abc = async() => {
    const client = create({ url: "http://127.0.0.1:5001/api/v0" });
    const {cid} = await client.add('hello');
    console.log(cid.toV1().toString());
}

const Hello = () => {
    abc();
    return(
        <div className='bg-[#002B5B] text-white'>
            <Navbar/>
            <h1 className="text-xl font-bold font-sans text-center">Hello World!</h1>
            <Footer/>
        </div>
    );
};

export default Hello;